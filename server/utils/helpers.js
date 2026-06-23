/**
 * Helper function to convert relative URLs to absolute
 * @param {string} href - Relative or absolute URL
 * @param {string} baseUrl - Base URL to resolve against
 * @returns {string} Absolute URL
 */
function toAbsoluteUrl(href, baseUrl) {
  if (!href) return '';
  try {
    return new URL(href, baseUrl).href;
  } catch (e) {
    return href;
  }
}

/**
 * Helper function to extract all attributes from an element
 * @param {object} $ - Cheerio instance
 * @param {object} elem - DOM element
 * @returns {object} Object with all attributes
 */
function extractAttributes($, elem) {
  const attrs = {};
  if (elem.attribs) {
    Object.keys(elem.attribs).forEach(key => {
      attrs[key] = elem.attribs[key];
    });
  }
  return attrs;
}

/**
 * Check if a domain requires Puppeteer (JavaScript rendering)
 * @param {string} url - URL to check
 * @param {string[]} jsHeavySites - List of sites that require JS
 * @returns {boolean} True if Puppeteer is needed
 */
function needsPuppeteer(url, jsHeavySites) {
  try {
    const domain = new URL(url).hostname.toLowerCase();
    // Avoid false positives like "getamazonreviews.nl" matching "amazon" via a
    // naive substring check. Full-domain entries (e.g. "bol.com") match exactly
    // or as a subdomain; bare-brand entries (e.g. "amazon") match a whole
    // domain label, so amazon.nl/amazon.com hit but getamazonreviews.nl does not.
    return jsHeavySites.some(site => {
      const s = site.toLowerCase();
      if (s.includes('.')) {
        return domain === s || domain.endsWith('.' + s);
      }
      return domain.split('.').includes(s);
    });
  } catch (e) {
    return false;
  }
}

/**
 * Translate a low-level scraping error into a user-facing (Dutch) message.
 * Centralizes the net/timeout/navigation mapping previously duplicated across
 * route handlers. Returns a safe string; never includes internal hostnames.
 * @param {Error} error
 * @returns {string}
 */
function mapScrapingError(error) {
  const msg = error?.message || '';
  if (msg.includes('private/internal') || msg.includes('Only http and https')) {
    return msg; // SSRF guard messages are already safe and user-facing
  }
  if (msg.includes('net::ERR')) {
    if (msg.includes('ERR_CONNECTION_REFUSED')) {
      return 'Verbinding geweigerd: De website is mogelijk niet bereikbaar of blokkeert de verbinding.';
    }
    if (msg.includes('ERR_NAME_NOT_RESOLVED')) {
      return 'DNS error: De website kan niet worden gevonden. Controleer of de URL correct is.';
    }
    if (msg.includes('ERR_SSL')) {
      return 'SSL error: Er is een probleem met het SSL certificaat van de website.';
    }
    return 'Netwerk error: De website kan niet worden geladen.';
  }
  if (msg.includes('timeout')) {
    return 'Timeout: De website reageert niet snel genoeg. Probeer het later opnieuw.';
  }
  if (msg.includes('Navigation failed')) {
    return 'Navigatie gefaald: De website kan niet worden geladen. Mogelijk wordt scraping geblokkeerd.';
  }
  if (msg.includes('Protocol error')) {
    return 'Protocol error: Er is een probleem met de verbinding. Probeer het opnieuw.';
  }
  return 'Het scrapen van de website is mislukt.';
}

module.exports = {
  toAbsoluteUrl,
  extractAttributes,
  needsPuppeteer,
  mapScrapingError
};

