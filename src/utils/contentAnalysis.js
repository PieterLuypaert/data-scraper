/**
 * Content analysis utilities
 */

/**
 * Extract most common words from text
 * @param {string} text - Text to analyze
 * @param {number} limit - Number of words to return
 * @returns {Array<{word: string, count: number}>} Array of word objects
 */
export function getMostCommonWords(text, limit = 20) {
  if (!text) return [];

  // Remove HTML tags and normalize
  const cleanText = text.replace(/<[^>]*>/g, ' ').toLowerCase();
  
  // Extract words (min 3 characters, exclude common stop words)
  const stopWords = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
    'de', 'het', 'een', 'van', 'in', 'is', 'op', 'te', 'voor', 'dat',
    'met', 'die', 'aan', 'bij', 'zijn', 'als', 'ook', 'niet', 'er', 'maar'
  ]);

  const words = cleanText
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length >= 3 && !stopWords.has(word));

  // Count words
  const wordCount = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  // Sort and return top words
  return Object.entries(wordCount)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Calculate keyword density
 * @param {string} text - Text to analyze
 * @param {Array<string>} keywords - Keywords to check
 * @returns {Object} Keyword density object
 */
export function calculateKeywordDensity(text, keywords = []) {
  if (!text || keywords.length === 0) return {};

  const cleanText = text.toLowerCase().replace(/[^\w\s]/g, ' ');
  const words = cleanText.split(/\s+/).filter(w => w.length > 0);
  const totalWords = words.length;

  const density = {};
  keywords.forEach(keyword => {
    const keywordLower = keyword.toLowerCase();
    const count = words.filter(w => w === keywordLower).length;
    density[keyword] = {
      count,
      density: totalWords > 0 ? ((count / totalWords) * 100).toFixed(2) : 0
    };
  });

  return density;
}

/**
 * Calculate readability score (Flesch Reading Ease approximation)
 * @param {string} text - Text to analyze
 * @returns {Object} Readability metrics
 */
export function calculateReadability(text) {
  if (!text) {
    return {
      score: 0,
      level: 'Unknown',
      sentences: 0,
      words: 0,
      syllables: 0
    };
  }

  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const words = text.split(/\s+/).filter(w => w.length > 0).length;
  
  // Approximate syllables (simple heuristic)
  const syllableCount = text
    .toLowerCase()
    .replace(/[^a-z]/g, '')
    .split('')
    .reduce((count, char, i, arr) => {
      const vowels = 'aeiouy';
      if (vowels.includes(char) && (i === 0 || !vowels.includes(arr[i - 1]))) {
        return count + 1;
      }
      return count;
    }, 0);

  // Flesch Reading Ease formula (simplified)
  const avgSentenceLength = words / sentences || 0;
  const avgSyllablesPerWord = syllableCount / words || 0;
  
  const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  
  let level = 'Unknown';
  if (score >= 90) level = 'Very Easy';
  else if (score >= 80) level = 'Easy';
  else if (score >= 70) level = 'Fairly Easy';
  else if (score >= 60) level = 'Standard';
  else if (score >= 50) level = 'Fairly Difficult';
  else if (score >= 30) level = 'Difficult';
  else level = 'Very Difficult';

  return {
    score: Math.round(score),
    level,
    sentences,
    words,
    syllables: syllableCount,
    avgSentenceLength: avgSentenceLength.toFixed(2),
    avgSyllablesPerWord: avgSyllablesPerWord.toFixed(2)
  };
}

/**
 * Analyze content length
 * @param {string} text - Text to analyze
 * @returns {Object} Length analysis
 */
export function analyzeContentLength(text) {
  if (!text) {
    return {
      characters: 0,
      charactersNoSpaces: 0,
      words: 0,
      sentences: 0,
      paragraphs: 0,
      estimatedReadingTime: 0
    };
  }

  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const words = text.split(/\s+/).filter(w => w.length > 0).length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
  
  // Average reading speed: 200-250 words per minute
  const estimatedReadingTime = Math.ceil(words / 200);

  return {
    characters,
    charactersNoSpaces,
    words,
    sentences,
    paragraphs,
    estimatedReadingTime
  };
}

/**
 * Detect content type
 * @param {Object} data - Scraped data
 * @returns {Object} Content type detection results
 */
export function detectContentType(data) {
  const indicators = {
    isBlog: false,
    isNews: false,
    isEcommerce: false,
    isPortfolio: false,
    isCorporate: false,
    confidence: 0
  };

  const title = (data.title || '').toLowerCase();
  const text = ((data.textPreview || '') + ' ' + (data.fullText || '')).toLowerCase();
  const meta = Object.values(data.metaTags || {}).join(' ').toLowerCase();
  const allText = title + ' ' + text + ' ' + meta;

  // Blog indicators
  if (
    allText.includes('blog') ||
    allText.includes('post') ||
    allText.includes('article') ||
    allText.includes('author') ||
    data.headings?.h1?.some(h => {
      const hText = (typeof h === 'string' ? h : h.text || '').toLowerCase();
      return hText.includes('blog') || hText.includes('post');
    })
  ) {
    indicators.isBlog = true;
    indicators.confidence += 30;
  }

  // News indicators
  if (
    allText.includes('news') ||
    allText.includes('breaking') ||
    allText.includes('headline') ||
    allText.includes('reporter') ||
    data.metaTags?.['og:type'] === 'article'
  ) {
    indicators.isNews = true;
    indicators.confidence += 30;
  }

  // E-commerce indicators
  if (
    allText.includes('shop') ||
    allText.includes('cart') ||
    allText.includes('buy') ||
    allText.includes('price') ||
    allText.includes('product') ||
    allText.includes('€') ||
    allText.includes('$') ||
    data.forms?.some(f => f.inputs.some(i => i.type === 'number' || i.name?.includes('quantity')))
  ) {
    indicators.isEcommerce = true;
    indicators.confidence += 30;
  }

  // Portfolio indicators
  if (
    allText.includes('portfolio') ||
    allText.includes('projects') ||
    allText.includes('work') ||
    data.images?.length > 10
  ) {
    indicators.isPortfolio = true;
    indicators.confidence += 20;
  }

  // Corporate indicators
  if (
    allText.includes('about us') ||
    allText.includes('contact') ||
    allText.includes('services') ||
    data.forms?.some(f => f.action?.includes('contact'))
  ) {
    indicators.isCorporate = true;
    indicators.confidence += 20;
  }

  // Determine primary type
  const types = [];
  if (indicators.isBlog) types.push('Blog');
  if (indicators.isNews) types.push('News');
  if (indicators.isEcommerce) types.push('E-commerce');
  if (indicators.isPortfolio) types.push('Portfolio');
  if (indicators.isCorporate) types.push('Corporate');

  indicators.primaryType = types[0] || 'Unknown';
  indicators.allTypes = types;

  return indicators;
}

/**
 * Extract article information
 * @param {Object} data - Scraped data
 * @returns {Object} Article information
 */
export function extractArticleInfo(data) {
  const article = {
    title: data.title || '',
    author: '',
    date: '',
    content: '',
    tags: []
  };

  // Try to find author in meta tags
  article.author = 
    data.metaTags?.['author'] ||
    data.metaTags?.['article:author'] ||
    data.openGraphTags?.['og:article:author'] ||
    '';

  // Try to find date
  article.date = 
    data.metaTags?.['article:published_time'] ||
    data.metaTags?.['date'] ||
    data.metaTags?.['pubdate'] ||
    data.openGraphTags?.['og:article:published_time'] ||
    '';

  // Extract main content (usually in paragraphs)
  article.content = (data.paragraphs || [])
    .map(p => typeof p === 'string' ? p : p.text)
    .join('\n\n')
    .substring(0, 5000);

  // Try to find tags
  const tags = 
    data.metaTags?.['keywords']?.split(',').map(t => t.trim()) ||
    data.metaTags?.['article:tag']?.split(',').map(t => t.trim()) ||
    [];
  article.tags = tags.filter(Boolean);

  return article;
}

