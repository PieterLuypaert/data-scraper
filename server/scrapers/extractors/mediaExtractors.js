const { toAbsoluteUrl, extractAttributes } = require('../../utils/helpers');

/**
 * Extract videos
 */
function extractVideos($, finalUrl) {
  const videos = [];
  
  $('video').each((i, elem) => {
    videos.push({
      src: toAbsoluteUrl($(elem).attr('src') || '', finalUrl),
      poster: toAbsoluteUrl($(elem).attr('poster') || '', finalUrl),
      width: $(elem).attr('width') || '',
      height: $(elem).attr('height') || '',
      controls: $(elem).attr('controls') !== undefined,
      autoplay: $(elem).attr('autoplay') !== undefined,
      loop: $(elem).attr('loop') !== undefined,
      muted: $(elem).attr('muted') !== undefined,
      id: $(elem).attr('id') || '',
      className: $(elem).attr('class') || '',
      attributes: extractAttributes($, elem)
    });
  });
  
  return videos;
}

/**
 * Extract audio
 */
function extractAudio($, finalUrl) {
  const audios = [];
  
  $('audio').each((i, elem) => {
    audios.push({
      src: toAbsoluteUrl($(elem).attr('src') || '', finalUrl),
      controls: $(elem).attr('controls') !== undefined,
      autoplay: $(elem).attr('autoplay') !== undefined,
      loop: $(elem).attr('loop') !== undefined,
      muted: $(elem).attr('muted') !== undefined,
      id: $(elem).attr('id') || '',
      className: $(elem).attr('class') || '',
      attributes: extractAttributes($, elem)
    });
  });
  
  return audios;
}

/**
 * Extract iframes
 */
function extractIframes($, finalUrl) {
  const iframes = [];
  
  $('iframe').each((i, elem) => {
    iframes.push({
      src: toAbsoluteUrl($(elem).attr('src') || '', finalUrl),
      title: $(elem).attr('title') || '',
      width: $(elem).attr('width') || '',
      height: $(elem).attr('height') || '',
      id: $(elem).attr('id') || '',
      className: $(elem).attr('class') || '',
      attributes: extractAttributes($, elem)
    });
  });
  
  return iframes;
}

/**
 * Extract scripts
 */
function extractScripts($, finalUrl) {
  const scripts = [];
  
  $('script').each((i, elem) => {
    const src = $(elem).attr('src');
    const type = $(elem).attr('type') || 'text/javascript';
    const content = $(elem).html() || '';
    
    scripts.push({
      src: src ? toAbsoluteUrl(src, finalUrl) : null,
      type,
      inline: !src,
      contentLength: content.length,
      attributes: extractAttributes($, elem)
    });
  });
  
  return scripts;
}

/**
 * Extract stylesheets
 */
function extractStylesheets($, finalUrl) {
  const stylesheets = [];
  
  $('link[rel="stylesheet"], style').each((i, elem) => {
    if ($(elem).is('style')) {
      stylesheets.push({
        type: 'inline',
        contentLength: $(elem).html().length,
        id: $(elem).attr('id') || '',
        attributes: extractAttributes($, elem)
      });
    } else {
      stylesheets.push({
        type: 'external',
        href: toAbsoluteUrl($(elem).attr('href') || '', finalUrl),
        media: $(elem).attr('media') || 'all',
        attributes: extractAttributes($, elem)
      });
    }
  });
  
  return stylesheets;
}

/**
 * Extract SVGs
 */
function extractSVGs($) {
  const svgs = [];
  
  $('svg').each((i, elem) => {
    svgs.push({
      viewBox: $(elem).attr('viewBox') || '',
      width: $(elem).attr('width') || '',
      height: $(elem).attr('height') || '',
      id: $(elem).attr('id') || '',
      className: $(elem).attr('class') || '',
      content: $(elem).html() || '',
      attributes: extractAttributes($, elem)
    });
  });
  
  return svgs;
}

/**
 * Extract canvases
 */
function extractCanvases($) {
  const canvases = [];
  
  $('canvas').each((i, elem) => {
    canvases.push({
      width: $(elem).attr('width') || '',
      height: $(elem).attr('height') || '',
      id: $(elem).attr('id') || '',
      className: $(elem).attr('class') || '',
      attributes: extractAttributes($, elem)
    });
  });
  
  return canvases;
}

module.exports = {
  extractVideos,
  extractAudio,
  extractIframes,
  extractScripts,
  extractStylesheets,
  extractSVGs,
  extractCanvases
};

