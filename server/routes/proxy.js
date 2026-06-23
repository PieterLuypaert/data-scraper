const getProxyManager = require('../utils/proxyManagerInstance');
const { maskProxyUrl } = require('../utils/proxyManager');
const { sendError } = require('../utils/errorResponse');
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
    sendError(res, 500, error, 'Failed to get proxy stats');
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
    sendError(res, 500, error, 'Failed to check proxy health');
  }
}

/**
 * Validate a proxy config (object or URL string). Returns an error string or null.
 */
function validateProxyInput(proxy) {
  if (typeof proxy === 'string') {
    try {
      const u = new URL(proxy);
      if (!['http:', 'https:', 'socks4:', 'socks5:'].includes(u.protocol)) {
        return 'Unsupported proxy protocol';
      }
      if (!u.hostname) return 'Proxy host is required';
      return null;
    } catch {
      return 'Invalid proxy URL';
    }
  }
  if (proxy && typeof proxy === 'object') {
    if (!proxy.host) return 'Proxy host is required';
    if (!proxy.port || Number.isNaN(Number(proxy.port))) return 'Valid proxy port is required';
    return null;
  }
  return 'Invalid proxy configuration';
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

    const validationError = validateProxyInput(proxy);
    if (validationError) {
      return res.status(400).json({ success: false, error: validationError });
    }

    const addedProxy = proxyManager.addProxy(proxy);
    // Never echo credentials back to the client.
    res.json({
      success: true,
      proxy: { ...addedProxy, url: maskProxyUrl(addedProxy.url), password: undefined }
    });
  } catch (error) {
    sendError(res, 500, error, 'Failed to add proxy');
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
    sendError(res, 500, error, 'Failed to remove proxy');
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
    sendError(res, 500, error, 'Failed to reset proxies');
  }
}

module.exports = {
  getProxyStats,
  checkProxyHealth,
  addProxy,
  removeProxy,
  resetProxies
};

