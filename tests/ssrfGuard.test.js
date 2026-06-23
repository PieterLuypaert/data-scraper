const { assertSafeUrl, isPrivateAddress } = require('../server/utils/ssrfGuard');

describe('isPrivateAddress', () => {
  it('flags private/loopback/link-local IPv4', () => {
    for (const ip of ['127.0.0.1', '10.0.0.1', '192.168.1.1', '172.16.5.4', '169.254.169.254', '0.0.0.0']) {
      expect(isPrivateAddress(ip)).toBe(true);
    }
  });

  it('allows public IPv4', () => {
    for (const ip of ['8.8.8.8', '1.1.1.1', '93.184.216.34']) {
      expect(isPrivateAddress(ip)).toBe(false);
    }
  });

  it('flags IPv6 loopback and IPv4-mapped (dotted + hex)', () => {
    expect(isPrivateAddress('::1')).toBe(true);
    expect(isPrivateAddress('::ffff:127.0.0.1')).toBe(true);
    expect(isPrivateAddress('::ffff:a9fe:a9fe')).toBe(true); // 169.254.169.254
    expect(isPrivateAddress('fe80::1')).toBe(true);
    expect(isPrivateAddress('fc00::1')).toBe(true);
  });
});

describe('assertSafeUrl', () => {
  it('rejects non-http(s) schemes', async () => {
    for (const u of ['file:///etc/passwd', 'ftp://example.com', 'gopher://x']) {
      await expect(assertSafeUrl(u)).rejects.toThrow(/http and https/);
    }
  });

  it('rejects literal private/internal hosts', async () => {
    for (const u of ['http://127.0.0.1', 'http://169.254.169.254/', 'http://[::1]/', 'http://[::ffff:a9fe:a9fe]/']) {
      await expect(assertSafeUrl(u)).rejects.toThrow(/private\/internal/);
    }
  });

  it('rejects malformed URLs', async () => {
    await expect(assertSafeUrl('not a url')).rejects.toThrow(/Invalid URL/);
  });

  it('allows a public https URL', async () => {
    await expect(assertSafeUrl('https://example.com')).resolves.toBeUndefined();
  });
});
