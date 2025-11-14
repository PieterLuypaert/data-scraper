const { toAbsoluteUrl, extractAttributes } = require('../../utils/helpers');

/**
 * Extract basic information from HTML
 */
function extractBasicInfo($) {
  let title, description, lang, charset;
  
  try {
    title = $('title').text().trim() || 'No title';
  } catch (e) {
    console.error('Error getting title:', e);
    title = 'No title';
  }
  
  try {
    description = $('meta[name="description"]').attr('content') || '';
  } catch (e) {
    console.error('Error getting description:', e);
    description = '';
  }
  
  try {
    lang = $('html').attr('lang') || $('html').attr('xml:lang') || '';
  } catch (e) {
    console.error('Error getting lang:', e);
    lang = '';
  }
  
  try {
    charset = $('meta[charset]').attr('charset') || $('meta[http-equiv="Content-Type"]').attr('content') || '';
  } catch (e) {
    console.error('Error getting charset:', e);
    charset = '';
  }
  
  return { title, description, lang, charset };
}

/**
 * Extract meta tags
 */
function extractMetaTags($) {
  const metaTags = {};
  const openGraphTags = {};
  const twitterTags = {};
  const schemaTags = [];
  
  try {
    $('meta').each((i, elem) => {
      const name = $(elem).attr('name');
      const property = $(elem).attr('property');
      const itemprop = $(elem).attr('itemprop');
      const httpEquiv = $(elem).attr('http-equiv');
      const content = $(elem).attr('content');
      
      if (property && property.startsWith('og:')) {
        openGraphTags[property] = content;
      } else if (name && name.startsWith('twitter:')) {
        twitterTags[name] = content;
      } else if (name) {
        metaTags[name] = content;
      } else if (property) {
        metaTags[property] = content;
      } else if (itemprop) {
        metaTags[itemprop] = content;
      } else if (httpEquiv) {
        metaTags[httpEquiv] = content;
      }
    });
  } catch (e) {
    console.error('Error extracting meta tags:', e);
  }
  
  // Extract JSON-LD structured data
  $('script[type="application/ld+json"]').each((i, elem) => {
    try {
      const jsonData = JSON.parse($(elem).html());
      schemaTags.push(jsonData);
    } catch (e) {
      // Invalid JSON, skip
    }
  });
  
  // Extract microdata
  const microdata = [];
  $('[itemscope]').each((i, elem) => {
    const item = {
      type: $(elem).attr('itemtype') || '',
      properties: {}
    };
    $(elem).find('[itemprop]').each((j, prop) => {
      const propName = $(prop).attr('itemprop');
      const propValue = $(prop).text().trim() || $(prop).attr('content') || '';
      if (propName) {
        item.properties[propName] = propValue;
      }
    });
    microdata.push(item);
  });
  
  return { metaTags, openGraphTags, twitterTags, schemaTags, microdata };
}

/**
 * Extract headings
 */
function extractHeadings($) {
  const headings = {
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: []
  };
  
  ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(tag => {
    $(tag).each((i, elem) => {
      const text = $(elem).text().trim();
      const id = $(elem).attr('id') || '';
      const className = $(elem).attr('class') || '';
      if (text) {
        headings[tag].push({
          text,
          id,
          className,
          attributes: extractAttributes($, elem)
        });
      }
    });
  });
  
  return headings;
}

module.exports = {
  extractBasicInfo,
  extractMetaTags,
  extractHeadings
};

