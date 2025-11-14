/**
 * API functions for web scraping
 */

const API_BASE_URL = '/api';

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

    // Poll for result
    return new Promise((resolve, reject) => {
      const resultInterval = setInterval(async () => {
        try {
          const resultResponse = await fetch(`${API_BASE_URL}/crawl/result?sessionId=${sessionId}`);
          const resultData = await resultResponse.json();

          if (resultData.success && resultData.data) {
            clearInterval(resultInterval);
            resolve(resultData.data);
          } else if (resultData.error) {
            clearInterval(resultInterval);
            reject(new Error(resultData.error));
          }
          // Otherwise, still in progress, continue polling
        } catch (error) {
          clearInterval(resultInterval);
          reject(error);
        }
      }, 2000); // Poll result every 2 seconds

      // Timeout after 10 minutes
      setTimeout(() => {
        clearInterval(resultInterval);
        reject(new Error('Crawl timeout: Operation took too long'));
      }, 600000);
    });
  } catch (error) {
    console.error('Crawling error:', error);
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Kan niet verbinden met de server. Zorg ervoor dat de backend server draait op poort 3001.');
    }
    throw error;
  }
}

