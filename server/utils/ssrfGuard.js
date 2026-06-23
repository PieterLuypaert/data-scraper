const dns = require('dns').promises;
const dnsCallback = require('dns');
const net = require('net');

/**
 * SSRF guard: validate that a URL is safe to fetch server-side.
 *
 * Blocks non-http(s) schemes (file:, ftp:, gopher:, dict:, ...) and any
 * hostname that resolves to a private / loopback / link-local address
 * (incl. cloud metadata 169.254.169.254).
 *
 * NOTE: there is an inherent TOCTOU / DNS-rebinding window between this
 * check and the actual request — a hostname could resolve to a public IP
 * here and an internal IP at fetch time. Mitigating that fully requires
 * pinning the resolved IP into the HTTP agent, which is out of scope here.
 */

/**
 * Convert an IPv4 string to a 32-bit unsigned integer.
 * @param {string} ip
 * @returns {number}
 */
function ipv4ToInt(ip) {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

/**
 * Check whether an IPv4 address falls inside a blocked range.
 * @param {string} ip - dotted-quad IPv4 string
 * @returns {boolean}
 */
function isPrivateIPv4(ip) {
  const n = ipv4ToInt(ip);
  // [base, mask] pairs for blocked CIDR ranges
  const ranges = [
    ['0.0.0.0', 8],        // "this" network
    ['10.0.0.0', 8],       // private
    ['100.64.0.0', 10],    // carrier-grade NAT
    ['127.0.0.0', 8],      // loopback
    ['169.254.0.0', 16],   // link-local (incl. cloud metadata)
    ['172.16.0.0', 12],    // private
    ['192.168.0.0', 16],   // private
  ];
  return ranges.some(([base, bits]) => {
    const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
    return (n & mask) === (ipv4ToInt(base) & mask);
  });
}

/**
 * Check whether an IPv6 address is loopback / unique-local / link-local,
 * or an IPv4-mapped address pointing at a private IPv4.
 * @param {string} ip - IPv6 string
 * @returns {boolean}
 */
function isPrivateIPv6(ip) {
  const lower = ip.toLowerCase();

  // IPv4-mapped, dotted-decimal form (::ffff:a.b.c.d) — validate embedded IPv4.
  const mappedDotted = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mappedDotted) {
    return isPrivateIPv4(mappedDotted[1]);
  }

  // IPv4-mapped, hex form (::ffff:a9fe:a9fe == 169.254.169.254). Without this
  // an attacker could bypass the dotted-decimal check above.
  const mappedHex = lower.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (mappedHex) {
    const hi = parseInt(mappedHex[1], 16);
    const lo = parseInt(mappedHex[2], 16);
    const ipv4 = `${(hi >> 8) & 0xff}.${hi & 0xff}.${(lo >> 8) & 0xff}.${lo & 0xff}`;
    return isPrivateIPv4(ipv4);
  }

  if (lower === '::1' || lower === '::') return true;        // loopback / unspecified

  // First hextet, zero-padded to 4 chars, for prefix matching.
  const firstHextet = parseInt(lower.split(':')[0] || '0', 16) || 0;
  if ((firstHextet & 0xfe00) === 0xfc00) return true;        // fc00::/7  unique-local
  if ((firstHextet & 0xffc0) === 0xfe80) return true;        // fe80::/10 link-local

  return false;
}

/**
 * @param {string} ip
 * @returns {boolean} true if the address is private/internal and must be blocked.
 */
function isPrivateAddress(ip) {
  const kind = net.isIP(ip);
  if (kind === 4) return isPrivateIPv4(ip);
  if (kind === 6) return isPrivateIPv6(ip);
  return false;
}

/**
 * Throw if the given URL is unsafe to fetch server-side.
 * @param {string} rawUrl
 * @throws {Error} 'Invalid URL format' | 'Only http and https URLs are allowed' |
 *                 'Requests to private/internal addresses are not allowed'
 */
async function assertSafeUrl(rawUrl) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch (e) {
    throw new Error('Invalid URL format');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Only http and https URLs are allowed');
  }

  // If the hostname is already a literal IP, check it directly.
  const hostname = parsed.hostname;
  if (net.isIP(hostname)) {
    if (isPrivateAddress(hostname)) {
      throw new Error('Requests to private/internal addresses are not allowed');
    }
    return;
  }

  // Resolve the hostname and check every returned address.
  let addresses;
  try {
    addresses = await dns.lookup(hostname, { all: true });
  } catch (e) {
    throw new Error('Could not resolve hostname');
  }

  if (addresses.some(({ address }) => isPrivateAddress(address))) {
    throw new Error('Requests to private/internal addresses are not allowed');
  }
}

/**
 * A drop-in replacement for dns.lookup that rejects any hostname resolving to
 * a private/internal address. Pass it as the `lookup` option to axios/http so
 * that the check runs at actual connection time — this closes the redirect
 * bypass (it fires for every redirect hop) AND mitigates DNS-rebinding (the
 * resolved IP that gets blocked is the exact one used for the socket).
 *
 * @param {string} hostname
 * @param {object|number|Function} options
 * @param {Function} [callback]
 */
function safeLookup(hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  const opts = typeof options === 'number' ? { family: options } : (options || {});

  dnsCallback.lookup(hostname, { ...opts, all: true }, (err, addresses) => {
    if (err) return callback(err);
    const blocked = addresses.find(a => isPrivateAddress(a.address));
    if (blocked) {
      return callback(new Error(
        `Blocked request to private/internal address (${blocked.address}) for host ${hostname}`
      ));
    }
    if (opts.all) return callback(null, addresses);
    const first = addresses[0];
    return callback(null, first.address, first.family);
  });
}

/**
 * axios/follow-redirects `beforeRedirect` hook. Node skips the custom `lookup`
 * for literal-IP hosts, so a redirect straight to e.g. http://169.254.169.254/
 * would not hit safeLookup. This synchronous check closes that gap by rejecting
 * non-http(s) schemes and literal private/internal IPs on every redirect hop.
 * Hostname redirects remain covered by safeLookup at connect time.
 *
 * @param {object} options - redirect target options (hostname, protocol, ...)
 * @throws {Error} to abort the redirect
 */
function beforeRedirect(options) {
  if (options.protocol && options.protocol !== 'http:' && options.protocol !== 'https:') {
    throw new Error('Only http and https URLs are allowed');
  }
  const host = options.hostname || options.host;
  if (host && net.isIP(host) && isPrivateAddress(host)) {
    throw new Error('Requests to private/internal addresses are not allowed');
  }
}

module.exports = {
  assertSafeUrl,
  isPrivateAddress,
  safeLookup,
  beforeRedirect,
};
