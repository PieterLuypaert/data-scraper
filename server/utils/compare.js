/**
 * Compare two scraped data objects and find differences
 * Backend version of change detection
 */

function compareArrays(oldArr, newArr, keyField) {
  const oldMap = new Map();
  const newMap = new Map();

  oldArr.forEach(item => {
    const key = typeof item === 'string' ? item : (item[keyField] || item.href || item.src || JSON.stringify(item));
    oldMap.set(key, item);
  });

  newArr.forEach(item => {
    const key = typeof item === 'string' ? item : (item[keyField] || item.href || item.src || JSON.stringify(item));
    newMap.set(key, item);
  });

  const added = [];
  const removed = [];
  const modified = [];

  newMap.forEach((value, key) => {
    if (!oldMap.has(key)) {
      added.push(value);
    } else {
      const oldValue = oldMap.get(key);
      if (JSON.stringify(oldValue) !== JSON.stringify(value)) {
        modified.push({ old: oldValue, new: value });
      }
    }
  });

  oldMap.forEach((value, key) => {
    if (!newMap.has(key)) {
      removed.push(value);
    }
  });

  return { added, removed, modified };
}

function compareHeadings(oldHeadings, newHeadings) {
  const added = {};
  const removed = {};

  ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(tag => {
    const old = oldHeadings[tag] || [];
    const new_ = newHeadings[tag] || [];
    
    const oldTexts = old.map(h => typeof h === 'string' ? h : h.text).filter(Boolean);
    const newTexts = new_.map(h => typeof h === 'string' ? h : h.text).filter(Boolean);

    const addedItems = newTexts.filter(t => !oldTexts.includes(t));
    const removedItems = oldTexts.filter(t => !newTexts.includes(t));

    if (addedItems.length > 0) {
      added[tag] = addedItems;
    }
    if (removedItems.length > 0) {
      removed[tag] = removedItems;
    }
  });

  return { added, removed };
}

function compareObjects(oldObj, newObj) {
  const added = [];
  const removed = [];
  const modified = [];

  Object.keys(newObj).forEach(key => {
    if (!(key in oldObj)) {
      added.push({ key, value: newObj[key] });
    } else if (oldObj[key] !== newObj[key]) {
      modified.push({ key, old: oldObj[key], new: newObj[key] });
    }
  });

  Object.keys(oldObj).forEach(key => {
    if (!(key in newObj)) {
      removed.push({ key, value: oldObj[key] });
    }
  });

  return { added, removed, modified };
}

function calculateTextDiff(oldText, newText) {
  const oldWords = oldText.split(/\s+/);
  const newWords = newText.split(/\s+/);
  
  return {
    oldLength: oldText.length,
    newLength: newText.length,
    wordCountChange: newWords.length - oldWords.length,
    similarity: calculateSimilarity(oldText, newText)
  };
}

function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1, str2) {
  const matrix = [];
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[str2.length][str1.length];
}

function compareStatistics(oldStats, newStats) {
  const changes = {};
  Object.keys(newStats).forEach(key => {
    if (oldStats[key] !== undefined && oldStats[key] !== newStats[key]) {
      changes[key] = {
        old: oldStats[key],
        new: newStats[key],
        change: newStats[key] - oldStats[key]
      };
    }
  });
  return changes;
}

/**
 * Compare two scraped data objects
 */
function compareScrapedData(oldData, newData) {
  if (!oldData || !newData) {
    return { error: 'Both old and new data are required' };
  }

  const changes = {
    added: {},
    removed: {},
    modified: {},
    unchanged: {},
    statistics: {
      totalChanges: 0,
      additions: 0,
      removals: 0,
      modifications: 0
    }
  };

  // Compare title
  if (oldData.title !== newData.title) {
    changes.modified.title = {
      old: oldData.title,
      new: newData.title
    };
    changes.statistics.modifications++;
  } else {
    changes.unchanged.title = oldData.title;
  }

  // Compare links
  const oldLinks = oldData.links || [];
  const newLinks = newData.links || [];
  const linkChanges = compareArrays(oldLinks, newLinks, 'href');
  if (linkChanges.added.length > 0) {
    changes.added.links = linkChanges.added;
    changes.statistics.additions += linkChanges.added.length;
  }
  if (linkChanges.removed.length > 0) {
    changes.removed.links = linkChanges.removed;
    changes.statistics.removals += linkChanges.removed.length;
  }
  if (linkChanges.modified.length > 0) {
    changes.modified.links = linkChanges.modified;
    changes.statistics.modifications += linkChanges.modified.length;
  }

  // Compare images
  const oldImages = oldData.images || [];
  const newImages = newData.images || [];
  const imageChanges = compareArrays(oldImages, newImages, 'src');
  if (imageChanges.added.length > 0) {
    changes.added.images = imageChanges.added;
    changes.statistics.additions += imageChanges.added.length;
  }
  if (imageChanges.removed.length > 0) {
    changes.removed.images = imageChanges.removed;
    changes.statistics.removals += imageChanges.removed.length;
  }

  // Compare headings
  if (oldData.headings && newData.headings) {
    const headingChanges = compareHeadings(oldData.headings, newData.headings);
    if (Object.keys(headingChanges.added).length > 0) {
      changes.added.headings = headingChanges.added;
      changes.statistics.additions += Object.values(headingChanges.added).reduce((sum, arr) => sum + arr.length, 0);
    }
    if (Object.keys(headingChanges.removed).length > 0) {
      changes.removed.headings = headingChanges.removed;
      changes.statistics.removals += Object.values(headingChanges.removed).reduce((sum, arr) => sum + arr.length, 0);
    }
  }

  // Compare meta tags
  if (oldData.metaTags && newData.metaTags) {
    const metaChanges = compareObjects(oldData.metaTags, newData.metaTags);
    if (metaChanges.added.length > 0) {
      changes.added.metaTags = metaChanges.added;
      changes.statistics.additions += metaChanges.added.length;
    }
    if (metaChanges.removed.length > 0) {
      changes.removed.metaTags = metaChanges.removed;
      changes.statistics.removals += metaChanges.removed.length;
    }
    if (metaChanges.modified.length > 0) {
      changes.modified.metaTags = metaChanges.modified;
      changes.statistics.modifications += metaChanges.modified.length;
    }
  }

  // Compare text content
  const oldText = oldData.textPreview || oldData.fullText || oldData.bodyText || '';
  const newText = newData.textPreview || newData.fullText || newData.bodyText || '';
  if (oldText !== newText) {
    const textDiff = calculateTextDiff(oldText, newText);
    changes.modified.text = textDiff;
    changes.statistics.modifications++;
  }

  // Compare statistics
  if (oldData.statistics && newData.statistics) {
    const statChanges = compareStatistics(oldData.statistics, newData.statistics);
    if (Object.keys(statChanges).length > 0) {
      changes.modified.statistics = statChanges;
    }
  }

  changes.statistics.totalChanges = 
    changes.statistics.additions + 
    changes.statistics.removals + 
    changes.statistics.modifications;

  return changes;
}

module.exports = {
  compareScrapedData
};

