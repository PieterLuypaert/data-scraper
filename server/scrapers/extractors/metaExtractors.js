const { toAbsoluteUrl, extractAttributes } = require('../../utils/helpers');

/**
 * Extract data attributes
 */
function extractDataAttributes($) {
  const dataAttributes = [];
  
  // Use * selector and filter manually since [data-*] is not valid CSS
  $('*').each((i, elem) => {
    const dataAttrs = {};
    Object.keys(elem.attribs || {}).forEach(key => {
      if (key.startsWith('data-')) {
        dataAttrs[key] = elem.attribs[key];
      }
    });
    if (Object.keys(dataAttrs).length > 0) {
      dataAttributes.push({
        element: elem.tagName || '',
        id: $(elem).attr('id') || '',
        className: $(elem).attr('class') || '',
        dataAttributes: dataAttrs
      });
    }
  });
  
  return dataAttributes;
}

/**
 * Extract all classes and IDs
 */
function extractClassesAndIds($) {
  const allClasses = new Set();
  const allIds = new Set();
  
  $('[class]').each((i, elem) => {
    const classes = $(elem).attr('class').split(/\s+/).filter(c => c);
    classes.forEach(c => allClasses.add(c));
  });
  
  $('[id]').each((i, elem) => {
    const id = $(elem).attr('id');
    if (id) allIds.add(id);
  });
  
  return {
    classes: Array.from(allClasses),
    ids: Array.from(allIds)
  };
}

/**
 * Extract comments
 */
function extractComments($) {
  const comments = [];
  
  $('*').contents().each((i, node) => {
    if (node.type === 'comment') {
      comments.push(node.data.trim());
    }
  });
  
  return comments;
}

/**
 * Extract favicons
 */
function extractFavicons($, finalUrl) {
  const favicons = [];
  
  $('link[rel*="icon"]').each((i, elem) => {
    favicons.push({
      rel: $(elem).attr('rel') || '',
      href: toAbsoluteUrl($(elem).attr('href') || '', finalUrl),
      sizes: $(elem).attr('sizes') || '',
      type: $(elem).attr('type') || ''
    });
  });
  
  return favicons;
}

/**
 * Extract element counts
 */
function extractElementCounts($) {
  const elementCounts = {};
  
  $('*').each((i, elem) => {
    const tag = elem.tagName?.toLowerCase();
    if (tag) {
      elementCounts[tag] = (elementCounts[tag] || 0) + 1;
    }
  });
  
  return elementCounts;
}

/**
 * Extract text content
 */
function extractTextContent($) {
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
  const fullText = $('html').text().replace(/\s+/g, ' ').trim();
  
  return { bodyText, fullText };
}

module.exports = {
  extractDataAttributes,
  extractClassesAndIds,
  extractComments,
  extractFavicons,
  extractElementCounts,
  extractTextContent
};

