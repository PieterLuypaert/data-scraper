const ProxyManager = require('./proxyManager');
const config = require('../config');

// Create singleton instance
let proxyManagerInstance = null;

function getProxyManager() {
  if (!proxyManagerInstance) {
    const proxies = config.PROXY.enabled && config.PROXY.proxies.length > 0 
      ? config.PROXY.proxies 
      : [];
    
    proxyManagerInstance = new ProxyManager(proxies);
    
    if (config.PROXY.enabled && proxies.length > 0) {
      proxyManagerInstance.startHealthCheck(config.PROXY.healthCheckInterval);
      console.log(`Proxy support enabled with ${proxies.length} proxies`);
    }
  }
  
  return proxyManagerInstance;
}

module.exports = getProxyManager;

