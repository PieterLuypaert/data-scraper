const cheerio = require('cheerio');
const { extractBasicInfo, extractMetaTags, extractHeadings } = require('./extractors/basicExtractors');
const { extractLinks } = require('./extractors/linkExtractor');
const { extractImages } = require('./extractors/imageExtractor');
const { extractParagraphs, extractLists, extractTables, extractForms, extractButtons } = require('./extractors/contentExtractors');
const { extractVideos, extractAudio, extractIframes, extractScripts, extractStylesheets, extractSVGs, extractCanvases } = require('./extractors/mediaExtractors');
const { extractDataAttributes, extractClassesAndIds, extractComments, extractFavicons, extractElementCounts, extractTextContent } = require('./extractors/metaExtractors');
const { extractContactInfo, extractEcommerceData, extractRssAndSitemaps, detectLanguage, detectContentType, analyzeContent, analyzeSentiment, analyzeSEO } = require('./extractors/analysisExtractors');

/**
 * Extract all data from HTML content
 * @param {string} htmlContent - HTML content to extract from
 * @param {string} finalUrl - Final URL after redirects
 * @returns {object} Extracted data
 */
function extractAllData(htmlContent, finalUrl) {
  let $;
  try {
    $ = cheerio.load(htmlContent, {
      decodeEntities: false,
      normalizeWhitespace: false
    });
  } catch (e) {
    console.error('Error loading HTML with cheerio:', e);
    throw new Error(`Failed to parse HTML: ${e.message}`);
  }
  
  // Basic information
  const { title, description, lang, charset } = extractBasicInfo($);
  
  // Meta tags
  const { metaTags, openGraphTags, twitterTags, schemaTags, microdata } = extractMetaTags($);
  
  // Headings
  const headings = extractHeadings($);
  
  // Links
  const links = extractLinks($, finalUrl);
  
  // Images
  const images = extractImages($, finalUrl);
  
  // Content
  const paragraphs = extractParagraphs($);
  const lists = extractLists($);
  const tables = extractTables($);
  const forms = extractForms($);
  const buttons = extractButtons($);
  
  // Media
  const videos = extractVideos($, finalUrl);
  const audios = extractAudio($, finalUrl);
  const iframes = extractIframes($, finalUrl);
  const scripts = extractScripts($, finalUrl);
  const stylesheets = extractStylesheets($, finalUrl);
  const svgs = extractSVGs($);
  const canvases = extractCanvases($);
  
  // Meta data
  const dataAttributes = extractDataAttributes($);
  const { classes: allClasses, ids: allIds } = extractClassesAndIds($);
  const comments = extractComments($);
  const favicons = extractFavicons($, finalUrl);
  const elementCounts = extractElementCounts($);
  const { bodyText, fullText } = extractTextContent($);
  
  // Analysis - need text content first
  const contactInfo = extractContactInfo(title, description, bodyText, links, paragraphs, metaTags, openGraphTags, twitterTags);
  const allTextForContact = [
    title,
    description,
    bodyText,
    ...links.map(l => l.text || l.href || ''),
    ...paragraphs.map(p => typeof p === 'string' ? p : p.text || ''),
    ...Object.values(metaTags),
    ...Object.values(openGraphTags),
    ...Object.values(twitterTags)
  ].join(' ');
  
  const ecommerce = extractEcommerceData(allTextForContact);
  const { rssFeeds, sitemaps } = extractRssAndSitemaps($, finalUrl, metaTags, links);
  const languageDetection = detectLanguage(bodyText);
  const contentType = detectContentType(title, bodyText, metaTags, ecommerce.prices, images);
  const contentAnalysis = analyzeContent(bodyText);
  const sentiment = analyzeSentiment(bodyText);
  const seoAnalysis = analyzeSEO($, title, description, metaTags, headings, images, links, finalUrl);
  
  // Compile all data
  const scrapedData = {
    // Basic info
    title,
    description,
    url: finalUrl,
    lang: lang || languageDetection.code,
    charset,
    
    // Meta tags
    metaTags,
    openGraphTags,
    twitterTags,
    schemaTags,
    microdata,
    
    // Content structure
    headings,
    paragraphs,
    lists,
    tables,
    
    // Media
    images,
    links,
    videos,
    audios,
    iframes,
    
    // Scripts and styles
    scripts,
    stylesheets,
    svgs,
    canvases,
    
    // Forms and buttons
    forms,
    buttons,
    
    // Meta data
    dataAttributes,
    allClasses: Array.from(allClasses),
    allIds: Array.from(allIds),
    comments,
    favicons,
    elementCounts,
    
    // Text content
    bodyText: bodyText.substring(0, 10000),
    fullText: fullText.substring(0, 10000),
    
    // Contact information
    contactInfo,
    
    // E-commerce data
    ecommerce,
    
    // RSS & Sitemap
    rssFeeds,
    sitemaps,
    
    // Language detection
    languageDetection,
    
    // Content type
    contentType,
    
    // Content analysis
    contentAnalysis,
    
    // Sentiment analysis
    sentiment,
    
    // SEO analysis
    seoAnalysis,
    
    // Statistics
    elementCounts,
    statistics: {
      totalLinks: links.length,
      totalImages: images.length,
      totalHeadings: Object.values(headings).reduce((sum, arr) => sum + arr.length, 0),
      totalParagraphs: paragraphs.length,
      totalTables: tables.length,
      totalForms: forms.length,
      totalButtons: buttons.length,
      totalVideos: videos.length,
      totalAudios: audios.length,
      totalIframes: iframes.length,
      totalScripts: scripts.length,
      totalStylesheets: stylesheets.length,
      totalSVGs: svgs.length,
      totalCanvases: canvases.length,
      totalDataAttributes: dataAttributes.length,
      totalComments: comments.length
    }
  };
  
  return scrapedData;
}

module.exports = {
  extractAllData
};

