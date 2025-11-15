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
 * Compress data for storage by removing/limiting large arrays
 * @param {Object} data - Data to compress
 * @returns {Object} Compressed data
 */
function compressDataForStorage(data) {
  const compressed = { ...data };
  
  // Remove screenshot
  if (compressed.screenshot) {
    compressed._hadScreenshot = true;
    delete compressed.screenshot;
  }
  
  // Limit large arrays to prevent quota issues
  const arrayLimits = {
    links: 100,
    images: 50,
    headings: 50,
    paragraphs: 100,
    tables: 20,
    forms: 20,
    videos: 20,
    scripts: 50,
    stylesheets: 50,
  };
  
  Object.keys(arrayLimits).forEach(key => {
    if (compressed[key] && Array.isArray(compressed[key])) {
      const limit = arrayLimits[key];
      if (compressed[key].length > limit) {
        compressed[`${key}_total`] = compressed[key].length;
        compressed[key] = compressed[key].slice(0, limit);
        compressed[`${key}_truncated`] = true;
      }
    }
  });
  
  return compressed;
}

export function saveToHistory(scrapeData, url) {
  try {
    const history = getHistory();
    
    // Compress data before saving
    const compressedData = compressDataForStorage(scrapeData);
    const hasScreenshot = !!scrapeData.screenshot;
    
    const historyItem = {
      id: Date.now().toString(),
      url,
      timestamp: new Date().toISOString(),
      data: compressedData,
      hasScreenshot,
    };
    
    history.unshift(historyItem);
    
    // Start with lower limits to prevent quota issues
    let limit = 30; // Reduced default limit
    let limitedHistory = history.slice(0, limit);
    
    // Try to save with progressively smaller limits if quota exceeded
    let saved = false;
    const limits = [30, 20, 15, 10, 5];
    
    for (const tryLimit of limits) {
      try {
        limitedHistory = history.slice(0, tryLimit);
        const jsonString = JSON.stringify(limitedHistory);
        
        // Check approximate size (rough estimate: 1 char ≈ 1 byte)
        if (jsonString.length > 4 * 1024 * 1024) { // ~4MB limit
          console.warn(`History item too large (${Math.round(jsonString.length / 1024)}KB), reducing limit...`);
          continue;
        }
        
        localStorage.setItem(STORAGE_KEYS.HISTORY, jsonString);
        saved = true;
        limit = tryLimit;
        break;
      } catch (quotaError) {
        if (quotaError.name === 'QuotaExceededError') {
          console.warn(`Quota exceeded with ${tryLimit} items, trying smaller limit...`);
          continue;
        } else {
          throw quotaError;
        }
      }
    }
    
    if (!saved) {
      // Last resort: keep only the new item
      console.warn('History too large, keeping only latest item');
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([historyItem]));
    }
    
    return historyItem;
  } catch (error) {
    console.error('Error saving to history:', error);
    
    // Final fallback: try to save just metadata
    if (error.name === 'QuotaExceededError') {
      try {
        console.warn('Quota exceeded, clearing history and saving minimal data...');
        const minimalItem = {
          id: Date.now().toString(),
          url,
          timestamp: new Date().toISOString(),
          data: {
            title: scrapeData.title || '',
            url: scrapeData.url || url,
            _compressed: true,
            _hadScreenshot: !!scrapeData.screenshot,
          },
          hasScreenshot: !!scrapeData.screenshot,
        };
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([minimalItem]));
        return minimalItem;
      } catch (finalError) {
        console.error('Failed to save even minimal history:', finalError);
        // Clear everything as last resort
        try {
          localStorage.removeItem(STORAGE_KEYS.HISTORY);
        } catch (clearError) {
          console.error('Failed to clear history:', clearError);
        }
      }
    }
    throw error;
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

