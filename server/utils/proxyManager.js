const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { HttpProxyAgent } = require('http-proxy-agent');

/**
 * Proxy Manager with rotation, health monitoring, and failover
 */
class ProxyManager {
  constructor(proxies = []) {
    this.proxies = proxies.map(proxy => ({
      ...proxy,
      url: this.formatProxyUrl(proxy),
      isHealthy: true,
      lastChecked: null,
      consecutiveFailures: 0,
      totalRequests: 0,
      successfulRequests: 0,
      lastUsed: null,
      responseTime: null
    }));
    this.currentIndex = 0;
    this.healthCheckInterval = null;
    this.maxConsecutiveFailures = 3;
    this.healthCheckTimeout = 10000; // 10 seconds
    this.healthCheckUrl = 'https://www.google.com'; // Default health check URL
  }

  /**
   * Format proxy object to URL string
   */
  formatProxyUrl(proxy) {
    if (typeof proxy === 'string') {
      return proxy;
    }
    
    const { host, port, username, password, protocol = 'http' } = proxy;
    
    if (username && password) {
      return `${protocol}://${username}:${password}@${host}:${port}`;
    }
    
    return `${protocol}://${host}:${port}`;
  }

  /**
   * Get next proxy in rotation
   */
  getNextProxy() {
    if (this.proxies.length === 0) {
      return null;
    }

    // Filter healthy proxies
    const healthyProxies = this.proxies.filter(p => p.isHealthy);
    
    if (healthyProxies.length === 0) {
      // If no healthy proxies, reset all and try again
      console.warn('No healthy proxies available, resetting health status...');
      this.proxies.forEach(p => {
        p.isHealthy = true;
        p.consecutiveFailures = 0;
      });
      return this.proxies[this.currentIndex % this.proxies.length];
    }

    // Use round-robin on healthy proxies
    const healthyIndex = this.currentIndex % healthyProxies.length;
    const proxy = healthyProxies[healthyIndex];
    this.currentIndex = (this.currentIndex + 1) % healthyProxies.length;
    
    proxy.lastUsed = new Date();
    proxy.totalRequests++;
    
    return proxy;
  }

  /**
   * Get proxy agent for axios
   */
  getProxyAgent(proxy) {
    if (!proxy) return null;
    
    const proxyUrl = typeof proxy === 'string' ? proxy : proxy.url;
    
    try {
      if (proxyUrl.startsWith('https://')) {
        return new HttpsProxyAgent(proxyUrl);
      } else {
        return new HttpProxyAgent(proxyUrl);
      }
    } catch (error) {
      console.error('Error creating proxy agent:', error);
      return null;
    }
  }

  /**
   * Get proxy configuration for Puppeteer
   */
  getPuppeteerProxyConfig(proxy) {
    if (!proxy) return {};
    
    const proxyUrl = typeof proxy === 'string' ? proxy : proxy.url;
    const url = new URL(proxyUrl);
    
    return {
      proxy: {
        server: `${url.protocol}//${url.hostname}:${url.port}`,
        username: url.username || undefined,
        password: url.password || undefined
      }
    };
  }

  /**
   * Check health of a single proxy
   */
  async checkProxyHealth(proxy) {
    const startTime = Date.now();
    
    try {
      const agent = this.getProxyAgent(proxy);
      
      if (!agent) {
        throw new Error('Failed to create proxy agent');
      }

      const response = await axios.get(this.healthCheckUrl, {
        httpsAgent: agent,
        httpAgent: agent,
        timeout: this.healthCheckTimeout,
        validateStatus: (status) => status < 500 // Accept 2xx, 3xx, 4xx as healthy
      });

      const responseTime = Date.now() - startTime;
      
      proxy.isHealthy = true;
      proxy.consecutiveFailures = 0;
      proxy.lastChecked = new Date();
      proxy.responseTime = responseTime;
      proxy.successfulRequests++;
      
      return { healthy: true, responseTime };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      proxy.consecutiveFailures++;
      proxy.lastChecked = new Date();
      proxy.responseTime = responseTime;
      
      if (proxy.consecutiveFailures >= this.maxConsecutiveFailures) {
        proxy.isHealthy = false;
        console.warn(`Proxy ${proxy.url || proxy.host} marked as unhealthy after ${proxy.consecutiveFailures} failures`);
      }
      
      return { healthy: false, error: error.message, responseTime };
    }
  }

  /**
   * Check health of all proxies
   */
  async checkAllProxiesHealth() {
    console.log(`Checking health of ${this.proxies.length} proxies...`);
    
    const checks = this.proxies.map(proxy => this.checkProxyHealth(proxy));
    const results = await Promise.allSettled(checks);
    
    const healthyCount = this.proxies.filter(p => p.isHealthy).length;
    console.log(`Health check complete: ${healthyCount}/${this.proxies.length} proxies healthy`);
    
    return {
      total: this.proxies.length,
      healthy: healthyCount,
      unhealthy: this.proxies.length - healthyCount,
      proxies: this.proxies.map(p => ({
        url: p.url || `${p.host}:${p.port}`,
        isHealthy: p.isHealthy,
        consecutiveFailures: p.consecutiveFailures,
        responseTime: p.responseTime,
        lastChecked: p.lastChecked,
        totalRequests: p.totalRequests,
        successfulRequests: p.successfulRequests,
        successRate: p.totalRequests > 0 ? (p.successfulRequests / p.totalRequests * 100).toFixed(2) : 0
      }))
    };
  }

  /**
   * Start automatic health checking
   */
  startHealthCheck(intervalMinutes = 5) {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    // Initial check
    this.checkAllProxiesHealth();
    
    // Periodic checks
    this.healthCheckInterval = setInterval(() => {
      this.checkAllProxiesHealth();
    }, intervalMinutes * 60 * 1000);
    
    console.log(`Started automatic health checking every ${intervalMinutes} minutes`);
  }

  /**
   * Stop automatic health checking
   */
  stopHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
      console.log('Stopped automatic health checking');
    }
  }

  /**
   * Mark proxy as failed
   */
  markProxyFailed(proxy) {
    if (!proxy) return;
    
    proxy.consecutiveFailures++;
    proxy.totalRequests++;
    
    if (proxy.consecutiveFailures >= this.maxConsecutiveFailures) {
      proxy.isHealthy = false;
      console.warn(`Proxy ${proxy.url || proxy.host} marked as unhealthy`);
    }
  }

  /**
   * Mark proxy as successful
   */
  markProxySuccess(proxy) {
    if (!proxy) return;
    
    proxy.consecutiveFailures = 0;
    proxy.totalRequests++;
    proxy.successfulRequests++;
    proxy.isHealthy = true;
  }

  /**
   * Add a new proxy
   */
  addProxy(proxy) {
    const formattedProxy = {
      ...proxy,
      url: this.formatProxyUrl(proxy),
      isHealthy: true,
      lastChecked: null,
      consecutiveFailures: 0,
      totalRequests: 0,
      successfulRequests: 0,
      lastUsed: null,
      responseTime: null
    };
    
    this.proxies.push(formattedProxy);
    return formattedProxy;
  }

  /**
   * Remove a proxy
   */
  removeProxy(proxyUrl) {
    this.proxies = this.proxies.filter(p => {
      const url = p.url || this.formatProxyUrl(p);
      return url !== proxyUrl;
    });
  }

  /**
   * Get proxy statistics
   */
  getStats() {
    const healthy = this.proxies.filter(p => p.isHealthy).length;
    const totalRequests = this.proxies.reduce((sum, p) => sum + p.totalRequests, 0);
    const totalSuccessful = this.proxies.reduce((sum, p) => sum + p.successfulRequests, 0);
    
    return {
      total: this.proxies.length,
      healthy,
      unhealthy: this.proxies.length - healthy,
      totalRequests,
      totalSuccessful,
      overallSuccessRate: totalRequests > 0 ? (totalSuccessful / totalRequests * 100).toFixed(2) : 0,
      proxies: this.proxies.map(p => ({
        url: p.url || `${p.host}:${p.port}`,
        isHealthy: p.isHealthy,
        consecutiveFailures: p.consecutiveFailures,
        responseTime: p.responseTime,
        lastChecked: p.lastChecked,
        lastUsed: p.lastUsed,
        totalRequests: p.totalRequests,
        successfulRequests: p.successfulRequests,
        successRate: p.totalRequests > 0 ? (p.successfulRequests / p.totalRequests * 100).toFixed(2) : 0
      }))
    };
  }

  /**
   * Reset all proxy health status
   */
  resetAllProxies() {
    this.proxies.forEach(proxy => {
      proxy.isHealthy = true;
      proxy.consecutiveFailures = 0;
    });
    console.log('All proxies reset to healthy status');
  }
}

module.exports = ProxyManager;

