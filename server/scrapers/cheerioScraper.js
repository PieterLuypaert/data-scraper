const axios = require('axios');
const config = require('../config');
const getProxyManager = require('../utils/proxyManagerInstance');

/**
 * Scrape a URL using Axios (for simple sites)
 * @param {string} url - URL to scrape
 * @param {Object} proxy - Optional proxy to use (for retry with different proxy)
 * @returns {Promise<{htmlContent: string, finalUrl: string}>}
 */
async function scrapeWithCheerio(url, proxy = null) {
  const proxyManager = getProxyManager();
  let selectedProxy = proxy;
  let retries = 0;
  const maxRetries = proxyManager && config.PROXY.enabled && config.PROXY.failoverEnabled ? 3 : 0;
  
  while (retries <= maxRetries) {
    try {
      // Get proxy if enabled and not provided
      if (!selectedProxy && proxyManager && config.PROXY.enabled && proxyManager.proxies.length > 0) {
        selectedProxy = proxyManager.getNextProxy();
      }
      
      const axiosConfig = {
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
      };
      
      // Add proxy agent if proxy is available
      if (selectedProxy && proxyManager) {
        const agent = proxyManager.getProxyAgent(selectedProxy);
        if (agent) {
          axiosConfig.httpsAgent = agent;
          axiosConfig.httpAgent = agent;
          console.log(`Using proxy: ${selectedProxy.url || selectedProxy.host}:${selectedProxy.port}`);
        }
      }
      
      const response = await axios.get(url, axiosConfig);
      
      // Mark proxy as successful
      if (selectedProxy && proxyManager) {
        proxyManager.markProxySuccess(selectedProxy);
      }
      
      const finalUrl = response.request.res.responseUrl || url;
      const htmlContent = response.data;
      
      return { htmlContent, finalUrl };
      
    } catch (error) {
      // Mark proxy as failed if using proxy
      if (selectedProxy && proxyManager) {
        proxyManager.markProxyFailed(selectedProxy);
      }
      
      // If failover is enabled and we have more retries, try next proxy
      if (retries < maxRetries && proxyManager && config.PROXY.enabled && config.PROXY.failoverEnabled && proxyManager.proxies.length > 0) {
        console.warn(`Request failed with proxy ${selectedProxy?.url || selectedProxy?.host}, trying next proxy...`);
        selectedProxy = null; // Get next proxy
        retries++;
        continue;
      }
      
      // If no proxy or no more retries, throw error
      throw error;
    }
  }
}

module.exports = {
  scrapeWithCheerio
};

