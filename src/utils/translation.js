/**
 * Translation utilities for scraped content
 * Uses a simple translation approach (can be extended with API integration)
 */

/**
 * Simple word-based translation dictionary
 * For production, consider using a translation API like Google Translate, DeepL, etc.
 */
const translationDictionary = {
  // Common words and phrases
  nl: {
    'the': 'de',
    'is': 'is',
    'and': 'en',
    'or': 'of',
    'to': 'naar',
    'for': 'voor',
    'with': 'met',
    'from': 'van',
    'about': 'over',
    'contact': 'contact',
    'home': 'home',
    'products': 'producten',
    'services': 'diensten',
    'about us': 'over ons',
    'read more': 'lees meer',
    'buy now': 'koop nu',
    'add to cart': 'voeg toe aan winkelwagen'
  },
  en: {
    'de': 'the',
    'het': 'the',
    'een': 'a',
    'is': 'is',
    'en': 'and',
    'van': 'from',
    'voor': 'for',
    'met': 'with',
    'over': 'about',
    'contact': 'contact',
    'home': 'home',
    'producten': 'products',
    'diensten': 'services',
    'over ons': 'about us',
    'lees meer': 'read more',
    'koop nu': 'buy now',
    'voeg toe aan winkelwagen': 'add to cart'
  }
};

/**
 * Translate text using simple dictionary lookup
 * Note: This is a basic implementation. For production, use a proper translation API.
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code (nl, en, fr, de, es)
 * @param {string} sourceLang - Source language code (optional, will be auto-detected)
 * @returns {Promise<string>} Translated text
 */
export async function translateText(text, targetLang, sourceLang = null) {
  if (!text || text.trim().length === 0) {
    return text;
  }

  // For now, return a placeholder message indicating translation would happen here
  // In production, integrate with a translation API like:
  // - Google Translate API
  // - DeepL API
  // - Microsoft Translator API
  // - LibreTranslate (open source)
  
  // Simple word-by-word translation for demonstration
  if (translationDictionary[targetLang]) {
    let translated = text;
    const dict = translationDictionary[targetLang];
    
    // Replace common words (case-insensitive)
    Object.keys(dict).forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      translated = translated.replace(regex, dict[word]);
    });
    
    return translated;
  }

  // If no translation available, return original with note
  return `${text} [Translation to ${targetLang} would be available with API integration]`;
}

/**
 * Translate scraped data object
 * @param {Object} data - Scraped data object
 * @param {string} targetLang - Target language code
 * @returns {Promise<Object>} Translated data object
 */
export async function translateScrapedData(data, targetLang) {
  const translated = { ...data };
  
  // Translate title
  if (data.title) {
    translated.title = await translateText(data.title, targetLang);
  }
  
  // Translate description
  if (data.description) {
    translated.description = await translateText(data.description, targetLang);
  }
  
  // Translate headings
  if (data.headings) {
    translated.headings = { ...data.headings };
    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(level => {
      if (data.headings[level]) {
        translated.headings[level] = data.headings[level].map(async h => {
          const text = typeof h === 'string' ? h : h.text || '';
          const translatedText = await translateText(text, targetLang);
          return typeof h === 'string' ? translatedText : { ...h, text: translatedText };
        });
      }
    });
  }
  
  // Translate paragraphs (first 10 for performance)
  if (data.paragraphs && Array.isArray(data.paragraphs)) {
    translated.paragraphs = await Promise.all(
      data.paragraphs.slice(0, 10).map(async p => {
        const text = typeof p === 'string' ? p : p.text || '';
        const translatedText = await translateText(text, targetLang);
        return typeof p === 'string' ? translatedText : { ...p, text: translatedText };
      })
    );
  }
  
  // Add translation metadata
  translated.translation = {
    targetLanguage: targetLang,
    translatedAt: new Date().toISOString(),
    note: 'Basic translation - for full translation, integrate with translation API'
  };
  
  return translated;
}

