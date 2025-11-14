/**
 * API functions for web scraping
 */

const API_BASE_URL = '/api';

/**
 * Scrapes a website and returns the data
 * @param {string} url - The URL to scrape
 * @returns {Promise<Object>} The scraped data
 */
export async function scrapeWebsite(url) {
  try {
    const response = await fetch(`${API_BASE_URL}/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
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
    const response = await fetch(`${API_BASE_URL}/crawl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, options }),
    });

    const responseText = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Server error: ${response.status} ${response.statusText}. Response: ${responseText.substring(0, 200)}`);
    }

    if (!response.ok) {
      const errorMessage = data.error || data.message || `Server error: ${response.status} ${response.statusText}`;
      console.error('Server error response:', data);
      throw new Error(errorMessage);
    }

    if (!data.success) {
      const errorMessage = data.error || data.message || 'Er is een fout opgetreden';
      console.error('Crawling failed:', data);
      throw new Error(errorMessage);
    }

    return data.data;
  } catch (error) {
    console.error('Crawling error:', error);
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Kan niet verbinden met de server. Zorg ervoor dat de backend server draait op poort 3001.');
    }
    throw error;
  }
}

