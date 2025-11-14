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

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      throw new Error(errorData.error || errorData.message || 'Er is een fout opgetreden');
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Er is een fout opgetreden');
    }

    return data.data;
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Kan niet verbinden met de server. Zorg ervoor dat de backend server draait op poort 3001.');
    }
    throw new Error(
      error.message ||
        'Kon de website niet scrapen. Controleer of de URL correct is en probeer het opnieuw.'
    );
  }
}

