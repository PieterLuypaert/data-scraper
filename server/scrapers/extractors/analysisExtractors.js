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

/**
 * Analyze SEO aspects of a website
 * @param {object} $ - Cheerio instance
 * @param {string} title - Page title
 * @param {string} description - Meta description
 * @param {object} metaTags - Meta tags object
 * @param {object} headings - Headings object
 * @param {array} images - Images array
 * @param {array} links - Links array
 * @param {string} finalUrl - Final URL
 * @returns {object} SEO analysis data
 */
function analyzeSEO($, title, description, metaTags, headings, images, links, finalUrl) {
  const issues = [];
  const warnings = [];
  const recommendations = [];
  let score = 100;
  
  // Title analysis
  const titleLength = title ? title.length : 0;
  if (!title) {
    issues.push('Geen title tag gevonden');
    score -= 20;
  } else if (titleLength < 30) {
    warnings.push(`Title is te kort (${titleLength} karakters, aanbevolen: 50-60)`);
    score -= 5;
  } else if (titleLength > 60) {
    warnings.push(`Title is te lang (${titleLength} karakters, aanbevolen: 50-60)`);
    score -= 5;
  }
  
  // Meta description analysis
  const descLength = description ? description.length : 0;
  if (!description) {
    issues.push('Geen meta description gevonden');
    score -= 15;
  } else if (descLength < 120) {
    warnings.push(`Meta description is te kort (${descLength} karakters, aanbevolen: 150-160)`);
    score -= 5;
  } else if (descLength > 160) {
    warnings.push(`Meta description is te lang (${descLength} karakters, aanbevolen: 150-160)`);
    score -= 5;
  }
  
  // Heading structure analysis
  const h1Count = headings.h1 ? headings.h1.length : 0;
  const h2Count = headings.h2 ? headings.h2.length : 0;
  const h3Count = headings.h3 ? headings.h3.length : 0;
  
  if (h1Count === 0) {
    issues.push('Geen H1 heading gevonden');
    score -= 10;
  } else if (h1Count > 1) {
    warnings.push(`Meerdere H1 headings gevonden (${h1Count}), aanbevolen: 1`);
    score -= 5;
  }
  
  if (h2Count === 0 && h3Count === 0) {
    warnings.push('Geen H2 of H3 headings gevonden voor structuur');
    score -= 3;
  }
  
  // Image alt text analysis
  const imagesWithoutAlt = images.filter(img => !img.alt || img.alt.trim() === '').length;
  const totalImages = images.length;
  if (totalImages > 0) {
    const altPercentage = ((totalImages - imagesWithoutAlt) / totalImages) * 100;
    if (altPercentage < 80) {
      warnings.push(`${imagesWithoutAlt} afbeeldingen zonder alt tekst (${Math.round(altPercentage)}% heeft alt tekst)`);
      score -= Math.round((100 - altPercentage) / 10);
    }
  }
  
  // Open Graph tags
  const hasOGTitle = !!metaTags['og:title'];
  const hasOGDescription = !!metaTags['og:description'];
  const hasOGImage = !!metaTags['og:image'];
  
  if (!hasOGTitle) {
    warnings.push('Geen Open Graph title tag');
    score -= 3;
  }
  if (!hasOGDescription) {
    warnings.push('Geen Open Graph description tag');
    score -= 3;
  }
  if (!hasOGImage) {
    warnings.push('Geen Open Graph image tag');
    score -= 3;
  }
  
  // Twitter Card tags
  const hasTwitterCard = !!metaTags['twitter:card'];
  if (!hasTwitterCard) {
    warnings.push('Geen Twitter Card tag');
    score -= 2;
  }
  
  // Canonical URL
  const hasCanonical = links.some(link => link.rel === 'canonical');
  if (!hasCanonical) {
    warnings.push('Geen canonical URL gevonden');
    score -= 3;
  }
  
  // Robots meta tag
  const robotsTag = metaTags['robots'];
  if (robotsTag && robotsTag.toLowerCase().includes('noindex')) {
    warnings.push('Robots meta tag bevat "noindex" - pagina wordt niet geïndexeerd');
    score -= 10;
  }
  
  // URL structure
  const urlLength = finalUrl.length;
  if (urlLength > 100) {
    warnings.push(`URL is lang (${urlLength} karakters, aanbevolen: < 100)`);
    score -= 2;
  }
  
  const urlDepth = (finalUrl.match(/\//g) || []).length - 2; // Subtract protocol slashes
  if (urlDepth > 3) {
    warnings.push(`URL heeft veel niveaus (${urlDepth} niveaus, aanbevolen: < 3)`);
    score -= 2;
  }
  
  // HTTPS check
  if (!finalUrl.startsWith('https://')) {
    issues.push('Website gebruikt geen HTTPS');
    score -= 15;
  }
  
  // Mobile-friendliness indicators
  const viewportMeta = metaTags['viewport'];
  const hasViewport = !!viewportMeta;
  if (!hasViewport) {
    issues.push('Geen viewport meta tag gevonden (niet mobile-friendly)');
    score -= 10;
  }
  
  // Schema.org structured data
  const hasSchema = Object.keys(metaTags).some(key => key.includes('schema') || key.includes('itemtype'));
  if (!hasSchema) {
    recommendations.push('Overweeg Schema.org structured data toe te voegen');
  }
  
  // Internal vs external links
  const domain = new URL(finalUrl).hostname;
  const internalLinks = links.filter(link => {
    try {
      const linkUrl = new URL(link.href);
      return linkUrl.hostname === domain || linkUrl.hostname === `www.${domain}` || `www.${linkUrl.hostname}` === domain;
    } catch {
      return link.href.startsWith('/') || link.href.startsWith('#');
    }
  }).length;
  const externalLinks = links.length - internalLinks;
  
  // Recommendations
  if (h2Count === 0) {
    recommendations.push('Voeg H2 headings toe voor betere content structuur');
  }
  if (imagesWithoutAlt > 0) {
    recommendations.push(`Voeg alt tekst toe aan ${imagesWithoutAlt} afbeelding(en)`);
  }
  if (!hasOGTitle || !hasOGDescription) {
    recommendations.push('Voeg Open Graph tags toe voor betere social media sharing');
  }
  if (description && description.length < 120) {
    recommendations.push('Vergroot meta description naar 150-160 karakters');
  }
  
  // Ensure score is between 0 and 100
  score = Math.max(0, Math.min(100, score));
  
  // Determine SEO rating
  let rating = 'Excellent';
  if (score < 50) rating = 'Poor';
  else if (score < 70) rating = 'Needs Improvement';
  else if (score < 85) rating = 'Good';
  
  return {
    score: Math.round(score),
    rating,
    issues,
    warnings,
    recommendations,
    meta: {
      titleLength,
      descriptionLength: descLength,
      h1Count,
      h2Count,
      h3Count,
      imagesWithAlt: totalImages - imagesWithoutAlt,
      imagesWithoutAlt,
      totalImages,
      hasOGTags: hasOGTitle && hasOGDescription && hasOGImage,
      hasTwitterCard,
      hasCanonical,
      hasViewport,
      hasSchema,
      usesHTTPS: finalUrl.startsWith('https://'),
      urlLength,
      urlDepth,
      internalLinks,
      externalLinks
    }
  };
}

module.exports = {
  extractContactInfo,
  extractEcommerceData,
  extractRssAndSitemaps,
  detectLanguage,
  detectContentType,
  analyzeContent,
  analyzeSentiment,
  analyzeSEO
};

