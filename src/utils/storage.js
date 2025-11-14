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
    const historyItem = {
      id: Date.now().toString(),
      url,
      timestamp: new Date().toISOString(),
      data: scrapeData,
    };
    
    history.unshift(historyItem);
    // Keep only last 100 items
    const limitedHistory = history.slice(0, 100);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(limitedHistory));
    
    return historyItem;
  } catch (error) {
    console.error('Error saving to history:', error);
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

