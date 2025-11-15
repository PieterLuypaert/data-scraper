/**
 * AI-powered content insights utilities
 * Provides summarization, categorization, topic detection, and sentiment analysis
 */

import { analyzeSentiment } from './sentimentAnalysis';
import { detectLanguage } from './languageDetection';

/**
 * Generate a summary of content
 * @param {string} text - Text to summarize
 * @param {number} maxLength - Maximum length of summary (default: 200)
 * @returns {string} Summary text
 */
export function generateSummary(text, maxLength = 200) {
  if (!text || text.length < 50) {
    return text || 'Geen voldoende content voor samenvatting.';
  }

  // Remove extra whitespace and newlines
  const cleanText = text.replace(/\s+/g, ' ').trim();
  
  // If text is already short enough, return as is
  if (cleanText.length <= maxLength) {
    return cleanText;
  }

  // Try to find sentence boundaries
  const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];
  
  if (sentences.length === 0) {
    // No sentence boundaries found, just truncate
    return cleanText.substring(0, maxLength - 3) + '...';
  }

  // Build summary from first sentences until we reach maxLength
  let summary = '';
  for (const sentence of sentences) {
    if (summary.length + sentence.length > maxLength) {
      break;
    }
    summary += sentence + ' ';
  }

  return summary.trim() || cleanText.substring(0, maxLength - 3) + '...';
}

/**
 * Detect topics/themes in content
 * @param {string} text - Text to analyze
 * @param {number} maxTopics - Maximum number of topics to return (default: 5)
 * @returns {Array} Array of topic objects with name and relevance score
 */
export function detectTopics(text, maxTopics = 5) {
  if (!text || text.length < 50) {
    return [];
  }

  // Common topic keywords in multiple languages
  const topicKeywords = {
    technology: ['tech', 'software', 'code', 'programming', 'computer', 'digital', 'app', 'website', 'internet', 'tech', 'software', 'code', 'programmeren', 'computer', 'digitaal'],
    business: ['business', 'company', 'enterprise', 'corporate', 'market', 'sales', 'revenue', 'profit', 'bedrijf', 'onderneming', 'markt', 'verkoop'],
    health: ['health', 'medical', 'doctor', 'hospital', 'treatment', 'medicine', 'gezondheid', 'medisch', 'arts', 'ziekenhuis', 'behandeling'],
    education: ['education', 'school', 'university', 'student', 'learn', 'study', 'onderwijs', 'school', 'universiteit', 'student', 'leren'],
    finance: ['finance', 'money', 'bank', 'investment', 'stock', 'crypto', 'financiën', 'geld', 'bank', 'investering', 'aandeel'],
    travel: ['travel', 'trip', 'vacation', 'hotel', 'flight', 'destination', 'reizen', 'reis', 'vakantie', 'hotel', 'vlucht'],
    food: ['food', 'restaurant', 'recipe', 'cooking', 'cuisine', 'meal', 'eten', 'restaurant', 'recept', 'koken', 'maaltijd'],
    sports: ['sport', 'game', 'match', 'player', 'team', 'championship', 'sport', 'wedstrijd', 'speler', 'team'],
    entertainment: ['movie', 'film', 'music', 'show', 'entertainment', 'film', 'muziek', 'show', 'entertainment'],
    news: ['news', 'article', 'report', 'breaking', 'headline', 'nieuws', 'artikel', 'rapport', 'krant'],
    ecommerce: ['shop', 'store', 'product', 'buy', 'cart', 'price', 'winkel', 'product', 'kopen', 'prijs'],
    science: ['science', 'research', 'study', 'experiment', 'discovery', 'wetenschap', 'onderzoek', 'experiment'],
    art: ['art', 'design', 'creative', 'artist', 'gallery', 'kunst', 'ontwerp', 'creatief', 'kunstenaar']
  };

  const textLower = text.toLowerCase();
  const topicScores = {};

  // Score each topic based on keyword matches
  Object.keys(topicKeywords).forEach(topic => {
    let score = 0;
    topicKeywords[topic].forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = textLower.match(regex);
      if (matches) {
        score += matches.length;
      }
    });
    if (score > 0) {
      topicScores[topic] = score;
    }
  });

  // Sort by score and return top topics
  const sortedTopics = Object.entries(topicScores)
    .map(([name, score]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      score,
      relevance: Math.min(100, Math.round((score / 10) * 100))
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, maxTopics);

  return sortedTopics;
}

/**
 * Categorize content into predefined categories
 * @param {Object} data - Scraped data object
 * @returns {Object} Categorization result with primary category and confidence
 */
export function categorizeContent(data) {
  const title = (data.title || '').toLowerCase();
  const description = (data.description || '').toLowerCase();
  const bodyText = (data.fullText || data.textPreview || '').toLowerCase();
  const allText = `${title} ${description} ${bodyText}`;

  const categories = {
    blog: {
      keywords: ['blog', 'post', 'article', 'author', 'published', 'blogpost'],
      score: 0
    },
    news: {
      keywords: ['news', 'breaking', 'headline', 'reporter', 'journalist', 'nieuws'],
      score: 0
    },
    ecommerce: {
      keywords: ['shop', 'store', 'buy', 'cart', 'product', 'price', '€', '$', 'winkel', 'kopen', 'prijs'],
      score: 0
    },
    portfolio: {
      keywords: ['portfolio', 'projects', 'work', 'gallery', 'showcase', 'portfolio', 'projecten'],
      score: 0
    },
    corporate: {
      keywords: ['about', 'company', 'services', 'contact', 'team', 'bedrijf', 'diensten', 'contact'],
      score: 0
    },
    documentation: {
      keywords: ['documentation', 'docs', 'guide', 'tutorial', 'manual', 'documentatie', 'handleiding'],
      score: 0
    },
    forum: {
      keywords: ['forum', 'discussion', 'thread', 'reply', 'comment', 'forum', 'discussie'],
      score: 0
    }
  };

  // Score each category
  Object.keys(categories).forEach(cat => {
    categories[cat].keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = allText.match(regex);
      if (matches) {
        categories[cat].score += matches.length;
      }
    });
  });

  // Find primary category
  const sorted = Object.entries(categories)
    .map(([name, data]) => ({
      name,
      score: data.score,
      confidence: Math.min(100, data.score * 10)
    }))
    .sort((a, b) => b.score - a.score);

  const primary = sorted[0];
  const secondary = sorted[1]?.score > 0 ? sorted[1] : null;

  return {
    primary: primary.name,
    primaryConfidence: primary.confidence,
    secondary: secondary?.name || null,
    secondaryConfidence: secondary?.confidence || 0,
    allCategories: sorted.filter(c => c.score > 0)
  };
}

/**
 * Analyze sentiment by section (headings, paragraphs, etc.)
 * @param {Object} data - Scraped data object
 * @returns {Object} Sentiment analysis per section
 */
export function analyzeSentimentBySection(data) {
  const sections = {};

  // Analyze headings
  if (data.headings) {
    const allHeadings = [
      ...(data.headings.h1 || []),
      ...(data.headings.h2 || []),
      ...(data.headings.h3 || [])
    ].map(h => typeof h === 'string' ? h : h.text || '').join(' ');
    
    if (allHeadings.length > 0) {
      sections.headings = analyzeSentiment(allHeadings);
    }
  }

  // Analyze paragraphs
  if (data.paragraphs && Array.isArray(data.paragraphs)) {
    const allParagraphs = data.paragraphs
      .map(p => typeof p === 'string' ? p : p.text || '')
      .join(' ');
    
    if (allParagraphs.length > 0) {
      sections.paragraphs = analyzeSentiment(allParagraphs);
    }
  }

  // Analyze full text
  const fullText = data.fullText || data.textPreview || '';
  if (fullText.length > 0) {
    sections.overall = analyzeSentiment(fullText);
  }

  // Analyze meta description
  if (data.description) {
    sections.meta = analyzeSentiment(data.description);
  }

  return sections;
}

/**
 * Generate comprehensive AI insights
 * @param {Object} data - Scraped data object
 * @returns {Object} Complete insights object
 */
export function generateAIInsights(data) {
  const fullText = data.fullText || data.textPreview || '';
  const title = data.title || '';
  const description = data.description || '';

  const combinedText = `${title} ${description} ${fullText}`.trim();

  if (combinedText.length < 50) {
    return {
      error: 'Insufficient content for analysis',
      summary: null,
      categories: null,
      topics: [],
      sentiment: null,
      sentimentBySection: {}
    };
  }

  return {
    summary: generateSummary(combinedText, 250),
    categories: categorizeContent(data),
    topics: detectTopics(combinedText, 8),
    sentiment: analyzeSentiment(combinedText),
    sentimentBySection: analyzeSentimentBySection(data),
    language: detectLanguage(combinedText)
  };
}

