/**
 * LocalStorage utilities for history and analytics
 */

const STORAGE_KEYS = {
  HISTORY: 'scraper_history',
  ANALYTICS: 'scraper_analytics',
};

/**
 * Get scrape history
 * @returns {Array} Array of scrape history items
 */
export function getHistory() {
  try {
    const history = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error reading history:', error);
    return [];
  }
}

/**
 * Save scrape to history
 * @param {Object} scrapeData - The scraped data
 * @param {string} url - The URL that was scraped
 */
export function saveToHistory(scrapeData, url) {
  try {
    const history = getHistory();
    
    // Remove screenshot from data before saving (too large for localStorage)
    // Keep a flag to indicate screenshot was available
    const hasScreenshot = !!scrapeData.screenshot;
    const dataToSave = { ...scrapeData };
    if (dataToSave.screenshot) {
      delete dataToSave.screenshot;
      dataToSave._hadScreenshot = true; // Flag to indicate screenshot existed
    }
    
    const historyItem = {
      id: Date.now().toString(),
      url,
      timestamp: new Date().toISOString(),
      data: dataToSave,
      hasScreenshot, // Store flag separately for easy checking
    };
    
    history.unshift(historyItem);
    
    // Reduce limit if screenshots are present to avoid quota issues
    // Keep only last 50 items if screenshots were involved, otherwise 100
    const limit = hasScreenshot ? 50 : 100;
    const limitedHistory = history.slice(0, limit);
    
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(limitedHistory));
    } catch (quotaError) {
      // If still too large, try with even fewer items
      if (quotaError.name === 'QuotaExceededError') {
        console.warn('History too large, reducing to 20 items...');
        const reducedHistory = history.slice(0, 20);
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(reducedHistory));
      } else {
        throw quotaError;
      }
    }
    
    return historyItem;
  } catch (error) {
    console.error('Error saving to history:', error);
    // Try to clear old history and retry once
    if (error.name === 'QuotaExceededError') {
      console.warn('Clearing old history to make space...');
      try {
        const history = getHistory();
        // Keep only last 10 items
        const minimalHistory = history.slice(0, 10);
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(minimalHistory));
        console.log('History cleared, please try again');
      } catch (clearError) {
        console.error('Failed to clear history:', clearError);
      }
    }
  }
}

/**
 * Delete history item by ID
 * @param {string} id - History item ID
 */
export function deleteHistoryItem(id) {
  try {
    const history = getHistory();
    const filtered = history.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(filtered));
    return filtered;
  } catch (error) {
    console.error('Error deleting history item:', error);
    return getHistory();
  }
}

/**
 * Delete multiple history items
 * @param {Array<string>} ids - Array of history item IDs
 */
export function bulkDeleteHistory(ids) {
  try {
    const history = getHistory();
    const filtered = history.filter(item => !ids.includes(item.id));
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(filtered));
    return filtered;
  } catch (error) {
    console.error('Error bulk deleting history:', error);
    return getHistory();
  }
}

/**
 * Clear all history
 */
export function clearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    return [];
  } catch (error) {
    console.error('Error clearing history:', error);
    return [];
  }
}

/**
 * Get analytics data
 * @returns {Object} Analytics data
 */
export function getAnalytics() {
  try {
    const analytics = localStorage.getItem(STORAGE_KEYS.ANALYTICS);
    return analytics ? JSON.parse(analytics) : {
      totalScrapes: 0,
      successfulScrapes: 0,
      failedScrapes: 0,
      urls: {},
      dailyStats: {},
    };
  } catch (error) {
    console.error('Error reading analytics:', error);
    return {
      totalScrapes: 0,
      successfulScrapes: 0,
      failedScrapes: 0,
      urls: {},
      dailyStats: {},
    };
  }
}

/**
 * Update analytics
 * @param {boolean} success - Whether the scrape was successful
 * @param {string} url - The URL that was scraped
 */
export function updateAnalytics(success, url) {
  try {
    const analytics = getAnalytics();
    const today = new Date().toISOString().split('T')[0];
    
    analytics.totalScrapes += 1;
    if (success) {
      analytics.successfulScrapes += 1;
    } else {
      analytics.failedScrapes += 1;
    }
    
    // Track URL frequency
    if (url) {
      analytics.urls[url] = (analytics.urls[url] || 0) + 1;
    }
    
    // Track daily stats
    if (!analytics.dailyStats[today]) {
      analytics.dailyStats[today] = { successful: 0, failed: 0 };
    }
    if (success) {
      analytics.dailyStats[today].successful += 1;
    } else {
      analytics.dailyStats[today].failed += 1;
    }
    
    localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(analytics));
    return analytics;
  } catch (error) {
    console.error('Error updating analytics:', error);
    return getAnalytics();
  }
}

/**
 * Get most scraped websites
 * @param {number} limit - Number of top websites to return
 * @returns {Array} Array of {url, count} objects
 */
export function getMostScrapedWebsites(limit = 10) {
  const analytics = getAnalytics();
  return Object.entries(analytics.urls)
    .map(([url, count]) => ({ url, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Get success rate
 * @returns {number} Success rate percentage
 */
export function getSuccessRate() {
  const analytics = getAnalytics();
  if (analytics.totalScrapes === 0) return 0;
  return Math.round((analytics.successfulScrapes / analytics.totalScrapes) * 100);
}

