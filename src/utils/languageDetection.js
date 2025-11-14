/**
 * Language detection utilities
 */

/**
 * Detect language from text
 * @param {string} text - Text to analyze
 * @returns {Object} Language detection result
 */
export function detectLanguage(text) {
  if (!text || text.length < 10) {
    return {
      language: 'Unknown',
      confidence: 0,
      code: 'unknown'
    };
  }

  // Common language patterns
  const patterns = {
    nl: {
      words: ['de', 'het', 'een', 'van', 'in', 'is', 'op', 'te', 'voor', 'dat', 'met', 'die', 'aan', 'bij', 'zijn', 'als', 'ook', 'niet', 'er', 'maar'],
      chars: ['ij', 'ë', 'é', 'è', 'ê', 'ö', 'ü']
    },
    en: {
      words: ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at'],
      chars: []
    },
    fr: {
      words: ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir', 'que', 'pour', 'dans', 'ce', 'son', 'une', 'sur', 'avec', 'ne', 'se'],
      chars: ['é', 'è', 'ê', 'ë', 'à', 'â', 'ç', 'ô', 'ù', 'û']
    },
    de: {
      words: ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich', 'des', 'auf', 'für', 'ist', 'im', 'dem', 'nicht', 'ein', 'eine', 'als'],
      chars: ['ä', 'ö', 'ü', 'ß']
    },
    es: {
      words: ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se', 'no', 'haber', 'por', 'con', 'su', 'para', 'como', 'estar', 'tener', 'le'],
      chars: ['ñ', 'á', 'é', 'í', 'ó', 'ú', 'ü']
    }
  };

  const textLower = text.toLowerCase();
  const scores = {};

  Object.keys(patterns).forEach(lang => {
    let score = 0;
    const pattern = patterns[lang];

    // Check for common words
    pattern.words.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = textLower.match(regex);
      if (matches) score += matches.length;
    });

    // Check for language-specific characters
    pattern.chars.forEach(char => {
      const regex = new RegExp(char, 'gi');
      const matches = textLower.match(regex);
      if (matches) score += matches.length * 2;
    });

    scores[lang] = score;
  });

  // Find language with highest score
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topLang = sorted[0];
  const totalScore = Object.values(scores).reduce((sum, s) => sum + s, 0);
  const confidence = totalScore > 0 ? (topLang[1] / totalScore) * 100 : 0;

  const languageNames = {
    nl: 'Nederlands',
    en: 'English',
    fr: 'Français',
    de: 'Deutsch',
    es: 'Español'
  };

  return {
    language: languageNames[topLang[0]] || topLang[0],
    code: topLang[0],
    confidence: Math.round(confidence),
    scores: scores
  };
}

