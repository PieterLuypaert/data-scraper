const { toAbsoluteUrl, extractAttributes } = require('../../utils/helpers');

/**
 * Extract all links from HTML
 */
function extractLinks($, finalUrl) {
  const links = [];
  
  $('a').each((i, elem) => {
    const text = $(elem).text().trim();
    const href = $(elem).attr('href');
    const title = $(elem).attr('title') || '';
    const rel = $(elem).attr('rel') || '';
    const target = $(elem).attr('target') || '';
    const id = $(elem).attr('id') || '';
    const className = $(elem).attr('class') || '';
    const download = $(elem).attr('download') || '';
    const hreflang = $(elem).attr('hreflang') || '';
    
    if (href) {
      links.push({
        text: text || href,
        href: toAbsoluteUrl(href, finalUrl),
        title,
        rel,
        target,
        id,
        className,
        download,
        hreflang,
        attributes: extractAttributes($, elem)
      });
    }
  });
  
  return links;
}

module.exports = {
  extractLinks
};

