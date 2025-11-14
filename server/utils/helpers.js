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
    return jsHeavySites.some(site => domain.includes(site));
  } catch (e) {
    return false;
  }
}

module.exports = {
  toAbsoluteUrl,
  extractAttributes,
  needsPuppeteer
};

