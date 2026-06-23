/**
 * API functions for web scraping
 */

const API_BASE_URL = '/api';

/**
 * Proxy management API functions
 */
export async function getProxyStats() {
  const response = await fetch(`${API_BASE_URL}/proxy/stats`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to get proxy stats');
  }
  return data;
}

export async function checkProxyHealth() {
  const response = await fetch(`${API_BASE_URL}/proxy/health`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to check proxy health');
  }
  return data;
}

export async function addProxy(proxy) {
  const response = await fetch(`${API_BASE_URL}/proxy/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ proxy }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to add proxy');
  }
  return data;
}

export async function removeProxy(proxyUrl) {
  const response = await fetch(`${API_BASE_URL}/proxy/remove`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ proxyUrl }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to remove proxy');
  }
  return data;
}

export async function resetProxies() {
  const response = await fetch(`${API_BASE_URL}/proxy/reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to reset proxies');
  }
  return data;
}

/**
 * Scrapes a website and returns the data
 * @param {string} url - The URL to scrape
 * @param {boolean} forcePuppeteer - Force use of Puppeteer for screenshots
 * @returns {Promise<Object>} The scraped data
 */
export async function scrapeWebsite(url, forcePuppeteer = false) {
  try {
    const response = await fetch(`${API_BASE_URL}/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, forcePuppeteer }),
    });

    const responseText = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      // If response is not JSON, it's likely an error
      throw new Error(`Server error: ${response.status} ${response.statusText}. Response: ${responseText.substring(0, 200)}`);
    }

    if (!response.ok) {
      // Use the detailed error message from the server
      const errorMessage = data.error || data.message || `Server error: ${response.status} ${response.statusText}`;
      console.error('Server error response:', data);
      throw new Error(errorMessage);
    }

    if (!data.success) {
      const errorMessage = data.error || data.message || 'Er is een fout opgetreden';
      console.error('Scraping failed:', data);
      throw new Error(errorMessage);
    }

    return data.data;
  } catch (error) {
    console.error('Scraping error:', error);
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Kan niet verbinden met de server. Zorg ervoor dat de backend server draait op poort 3001.');
    }
    // Pass through the error message from the server
    throw error;
  }
}

/**
 * Crawls a website and scrapes all pages
 * @param {string} url - The starting URL to crawl
 * @param {object} options - Crawl options
 * @returns {Promise<Object>} All scraped pages data
 */
export async function crawlWebsite(url, options = {}) {
  try {
    // Start crawl
    const startResponse = await fetch(`${API_BASE_URL}/crawl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, options }),
    });

    const startResponseText = await startResponse.text();
    let startData;
    
    try {
      startData = JSON.parse(startResponseText);
    } catch (e) {
      throw new Error(`Server error: ${startResponse.status} ${startResponse.statusText}. Response: ${startResponseText.substring(0, 200)}`);
    }

    if (!startResponse.ok) {
      const errorMessage = startData.error || startData.message || `Server error: ${startResponse.status} ${startResponse.statusText}`;
      console.error('Server error response:', startData);
      throw new Error(errorMessage);
    }

    if (!startData.success) {
      const errorMessage = startData.error || startData.message || 'Er is een fout opgetreden';
      console.error('Crawling failed:', startData);
      throw new Error(errorMessage);
    }

    const sessionId = startData.sessionId;

    // Poll for result. The returned promise carries a `.cancel()` so callers
    // can stop polling on unmount / tab-switch (prevents a leaking interval and
    // setState on an unmounted component).
    let resultInterval;
    let timeoutId;
    let settled = false;
    const stop = () => {
      clearInterval(resultInterval);
      clearTimeout(timeoutId);
    };

    const promise = new Promise((resolve, reject) => {
      resultInterval = setInterval(async () => {
        try {
          const resultResponse = await fetch(`${API_BASE_URL}/crawl/result?sessionId=${sessionId}`);
          const resultData = await resultResponse.json();

          if (resultData.success && resultData.data) {
            settled = true;
            stop();
            resolve(resultData.data);
          } else if (resultData.error) {
            settled = true;
            stop();
            reject(new Error(resultData.error));
          }
          // Otherwise, still in progress, continue polling
        } catch (error) {
          settled = true;
          stop();
          reject(error);
        }
      }, 2000); // Poll result every 2 seconds

      // Timeout after 10 minutes
      timeoutId = setTimeout(() => {
        settled = true;
        stop();
        reject(new Error('Crawl timeout: Operation took too long'));
      }, 600000);
    });

    // Allow the caller to abort polling; resolves to null when cancelled.
    promise.cancel = () => {
      if (settled) return;
      settled = true;
      stop();
    };
    return promise;
  } catch (error) {
    console.error('Crawling error:', error);
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Kan niet verbinden met de server. Zorg ervoor dat de backend server draait op poort 3001.');
    }
    throw error;
  }
}

