const axios = require('axios');
const config = require('../config');

/**
 * Scrape a URL using Axios (for simple sites)
 * @param {string} url - URL to scrape
 * @returns {Promise<{htmlContent: string, finalUrl: string}>}
 */
async function scrapeWithCheerio(url) {
  const response = await axios.get(url, {
    timeout: 30000,
    headers: {
      'User-Agent': config.USER_AGENT,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none'
    },
    maxRedirects: 5
  });
  
  const finalUrl = response.request.res.responseUrl || url;
  const htmlContent = response.data;
  
  return { htmlContent, finalUrl };
}

module.exports = {
  scrapeWithCheerio
};

