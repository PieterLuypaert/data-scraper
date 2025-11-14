const { toAbsoluteUrl, extractAttributes } = require('../../utils/helpers');

/**
 * Extract all images from HTML
 */
function extractImages($, finalUrl) {
  const images = [];
  const imageSet = new Set(); // To avoid duplicates
  
  // Extract all img tags
  $('img').each((i, elem) => {
    const alt = $(elem).attr('alt') || '';
    // Check multiple possible src attributes for lazy loading
    const src = $(elem).attr('src') || 
                $(elem).attr('data-src') || 
                $(elem).attr('data-lazy-src') || 
                $(elem).attr('data-original') ||
                $(elem).attr('data-image') ||
                $(elem).attr('data-img') ||
                $(elem).attr('data-lazy') ||
                $(elem).attr('data-url') ||
                '';
    
    // Extract from srcset if no src
    let srcFromSrcset = '';
    const srcset = $(elem).attr('srcset') || '';
    if (!src && srcset) {
      const srcsetParts = srcset.split(',');
      if (srcsetParts.length > 0) {
        srcFromSrcset = srcsetParts[0].trim().split(' ')[0];
      }
    }
    
    const finalSrc = src || srcFromSrcset;
    const title = $(elem).attr('title') || '';
    const width = $(elem).attr('width') || '';
    const height = $(elem).attr('height') || '';
    const loading = $(elem).attr('loading') || '';
    const id = $(elem).attr('id') || '';
    const className = $(elem).attr('class') || '';
    
    if (finalSrc) {
      const absoluteSrc = toAbsoluteUrl(finalSrc, finalUrl);
      // Only add if not already in set and is a valid URL
      if (!imageSet.has(absoluteSrc) && absoluteSrc && absoluteSrc !== finalUrl) {
        imageSet.add(absoluteSrc);
        images.push({
          alt,
          src: absoluteSrc,
          srcset,
          title,
          width,
          height,
          loading,
          id,
          className,
          attributes: extractAttributes($, elem)
        });
      }
    }
  });
  
  // Also extract images from background-image CSS
  try {
    $('*').each((i, elem) => {
      const style = $(elem).attr('style') || '';
      const bgImageMatch = style.match(/background-image:\s*url\(['"]?([^'")]+)['"]?\)/i);
      if (bgImageMatch && bgImageMatch[1]) {
        const bgSrc = toAbsoluteUrl(bgImageMatch[1], finalUrl);
        if (!imageSet.has(bgSrc) && bgSrc.includes('http') && bgSrc !== finalUrl) {
          imageSet.add(bgSrc);
          images.push({
            alt: '',
            src: bgSrc,
            srcset: '',
            title: '',
            width: '',
            height: '',
            loading: '',
            id: $(elem).attr('id') || '',
            className: $(elem).attr('class') || '',
            type: 'background-image',
            attributes: extractAttributes($, elem)
          });
        }
      }
    });
  } catch (e) {
    console.error('Error extracting background images:', e);
  }
  
  return images;
}

module.exports = {
  extractImages
};

