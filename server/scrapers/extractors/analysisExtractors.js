const { toAbsoluteUrl } = require('../../utils/helpers');

/**
 * Extract contact information
 */
function extractContactInfo(title, description, bodyText, links, paragraphs, metaTags, openGraphTags, twitterTags) {
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
  
  // Extract emails
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = [...new Set((allTextForContact.match(emailRegex) || []))];
  
  // Extract phone numbers
  const phonePatterns = [
    /\+?\d{1,4}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g,
    /0\d{1,2}[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,4}/g
  ];
  const phones = new Set();
  phonePatterns.forEach(pattern => {
    const matches = allTextForContact.match(pattern) || [];
    matches.forEach(match => {
      const digits = match.replace(/\D/g, '');
      if (digits.length >= 7 && digits.length <= 15) {
        phones.add(match.trim());
      }
    });
  });
  
  // Extract social media links
  const socialMedia = {
    facebook: links.filter(l => l.href?.toLowerCase().includes('facebook.com')),
    twitter: links.filter(l => l.href?.toLowerCase().includes('twitter.com') || l.href?.toLowerCase().includes('x.com')),
    linkedin: links.filter(l => l.href?.toLowerCase().includes('linkedin.com')),
    instagram: links.filter(l => l.href?.toLowerCase().includes('instagram.com')),
    youtube: links.filter(l => l.href?.toLowerCase().includes('youtube.com') || l.href?.toLowerCase().includes('youtu.be')),
    github: links.filter(l => l.href?.toLowerCase().includes('github.com'))
  };
  
  return {
    emails,
    phoneNumbers: Array.from(phones),
    socialMedia
  };
}

/**
 * Extract e-commerce data
 */
function extractEcommerceData(allTextForContact) {
  const ecommerceData = {
    products: [],
    prices: [],
    reviews: []
  };
  
  // Extract prices
  const pricePatterns = [
    /€\s*(\d+[.,]\d{2})/g,
    /\$\s*(\d+[.,]\d{2})/g,
    /(\d+[.,]\d{2})\s*€/g,
    /price[:\s]+([€$]?\s*\d+[.,]?\d*)/gi
  ];
  const prices = new Set();
  pricePatterns.forEach(pattern => {
    const matches = allTextForContact.match(pattern) || [];
    matches.forEach(match => prices.add(match.trim()));
  });
  
  return {
    hasProducts: ecommerceData.products.length > 0,
    prices: Array.from(prices),
    priceCount: prices.size
  };
}

/**
 * Extract RSS feeds and sitemaps
 */
function extractRssAndSitemaps($, finalUrl, metaTags, links) {
  const rssFeeds = [];
  const sitemaps = [];
  
  $('link[type="application/rss+xml"], link[rel="alternate"][type="application/rss+xml"]').each((i, elem) => {
    const href = $(elem).attr('href');
    if (href) rssFeeds.push(toAbsoluteUrl(href, finalUrl));
  });
  
  // Check for sitemap in robots.txt or meta
  if (metaTags['robots']?.includes('sitemap') || links.some(l => l.href?.includes('sitemap'))) {
    links.forEach(link => {
      if (link.href?.toLowerCase().includes('sitemap')) {
        sitemaps.push(link.href);
      }
    });
  }
  
  return { rssFeeds, sitemaps };
}

/**
 * Detect language
 */
function detectLanguage(text) {
  if (!text || text.length < 10) return { language: 'Unknown', code: 'unknown', confidence: 0 };
  
  const patterns = {
    nl: ['de', 'het', 'een', 'van', 'in', 'is', 'op', 'te', 'voor', 'dat', 'met', 'die', 'aan', 'bij'],
    en: ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on'],
    fr: ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir', 'que', 'pour'],
    de: ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich', 'des']
  };
  
  const textLower = text.toLowerCase();
  const scores = {};
  
  Object.keys(patterns).forEach(lang => {
    let score = 0;
    patterns[lang].forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = textLower.match(regex);
      if (matches) score += matches.length;
    });
    scores[lang] = score;
  });
  
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topLang = sorted[0];
  const totalScore = Object.values(scores).reduce((sum, s) => sum + s, 0);
  const confidence = totalScore > 0 ? Math.round((topLang[1] / totalScore) * 100) : 0;
  
  const names = { nl: 'Nederlands', en: 'English', fr: 'Français', de: 'Deutsch' };
  return {
    language: names[topLang[0]] || topLang[0],
    code: topLang[0],
    confidence
  };
}

/**
 * Detect content type
 */
function detectContentType(title, bodyText, metaTags, prices, images) {
  const allTextLower = (title + ' ' + bodyText + ' ' + Object.values(metaTags).join(' ')).toLowerCase();
  const contentType = {
    isBlog: allTextLower.includes('blog') || allTextLower.includes('post') || allTextLower.includes('article'),
    isNews: allTextLower.includes('news') || allTextLower.includes('breaking') || metaTags['og:type'] === 'article',
    isEcommerce: allTextLower.includes('shop') || allTextLower.includes('cart') || allTextLower.includes('buy') || allTextLower.includes('price') || prices.size > 0,
    isPortfolio: allTextLower.includes('portfolio') || allTextLower.includes('projects') || images.length > 10,
    isCorporate: allTextLower.includes('about us') || allTextLower.includes('contact') || allTextLower.includes('services')
  };
  
  const primaryType = contentType.isBlog ? 'Blog' :
                      contentType.isNews ? 'News' :
                      contentType.isEcommerce ? 'E-commerce' :
                      contentType.isPortfolio ? 'Portfolio' :
                      contentType.isCorporate ? 'Corporate' : 'Unknown';
  
  return { ...contentType, primaryType };
}

/**
 * Analyze content
 */
function analyzeContent(bodyText) {
  const words = bodyText.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length >= 3);
  const wordCount = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  const mostCommonWords = Object.entries(wordCount)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
  
  // Readability calculation
  const sentences = bodyText.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const wordCountTotal = words.length;
  const avgSentenceLength = sentences > 0 ? wordCountTotal / sentences : 0;
  const readability = {
    sentences,
    words: wordCountTotal,
    avgSentenceLength: avgSentenceLength.toFixed(2),
    estimatedReadingTime: Math.ceil(wordCountTotal / 200)
  };
  
  return {
    mostCommonWords,
    readability,
    wordCount: wordCountTotal,
    characterCount: bodyText.length
  };
}

/**
 * Analyze sentiment
 */
function analyzeSentiment(bodyText) {
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome', 'perfect', 'love', 'like', 'happy', 'goed', 'geweldig', 'fantastisch'];
  const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'disgusting', 'slecht', 'vreselijk', 'verschrikkelijk'];
  const textLower = bodyText.toLowerCase();
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = textLower.match(regex);
    if (matches) positiveCount += matches.length;
  });
  
  negativeWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = textLower.match(regex);
    if (matches) negativeCount += matches.length;
  });
  
  const totalSentiment = positiveCount + negativeCount;
  const sentimentScore = totalSentiment > 0 ? ((positiveCount - negativeCount) / totalSentiment) * 100 : 0;
  const sentiment = sentimentScore > 20 ? 'positive' : sentimentScore < -20 ? 'negative' : 'neutral';
  
  return {
    sentiment,
    score: Math.round(sentimentScore),
    positive: positiveCount,
    negative: negativeCount
  };
}

module.exports = {
  extractContactInfo,
  extractEcommerceData,
  extractRssAndSitemaps,
  detectLanguage,
  detectContentType,
  analyzeContent,
  analyzeSentiment
};

