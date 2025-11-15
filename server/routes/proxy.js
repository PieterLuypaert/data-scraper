const getProxyManager = require('../utils/proxyManagerInstance');
const config = require('../config');

/**
 * Get proxy statistics
 */
async function getProxyStats(req, res) {
  try {
    const proxyManager = getProxyManager();
    const stats = proxyManager.getStats();
    res.json({
      success: true,
      enabled: config.PROXY.enabled,
      ...stats
    });
  } catch (error) {
    console.error('Error getting proxy stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Check health of all proxies
 */
async function checkProxyHealth(req, res) {
  try {
    const proxyManager = getProxyManager();
    const result = await proxyManager.checkAllProxiesHealth();
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error checking proxy health:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Add a new proxy
 */
async function addProxy(req, res) {
  try {
    const proxyManager = getProxyManager();
    const { proxy } = req.body;
    
    if (!proxy) {
      return res.status(400).json({
        success: false,
        error: 'Proxy configuration is required'
      });
    }
    
    const addedProxy = proxyManager.addProxy(proxy);
    res.json({
      success: true,
      proxy: addedProxy
    });
  } catch (error) {
    console.error('Error adding proxy:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Remove a proxy
 */
async function removeProxy(req, res) {
  try {
    const proxyManager = getProxyManager();
    const { proxyUrl } = req.body;
    
    if (!proxyUrl) {
      return res.status(400).json({
        success: false,
        error: 'Proxy URL is required'
      });
    }
    
    proxyManager.removeProxy(proxyUrl);
    res.json({
      success: true,
      message: 'Proxy removed successfully'
    });
  } catch (error) {
    console.error('Error removing proxy:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Reset all proxy health status
 */
async function resetProxies(req, res) {
  try {
    const proxyManager = getProxyManager();
    proxyManager.resetAllProxies();
    res.json({
      success: true,
      message: 'All proxies reset to healthy status'
    });
  } catch (error) {
    console.error('Error resetting proxies:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  getProxyStats,
  checkProxyHealth,
  addProxy,
  removeProxy,
  resetProxies
};

