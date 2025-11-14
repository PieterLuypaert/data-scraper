/**
 * Sentiment analysis utilities
 */

/**
 * Analyze sentiment of text
 * @param {string} text - Text to analyze
 * @returns {Object} Sentiment analysis result
 */
export function analyzeSentiment(text) {
  if (!text || text.length < 10) {
    return {
      sentiment: 'neutral',
      score: 0,
      confidence: 0,
      positive: 0,
      negative: 0,
      neutral: 0
    };
  }

  // Simple sentiment word lists
  const positiveWords = [
    'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome', 'perfect',
    'love', 'like', 'happy', 'joy', 'pleasure', 'delight', 'brilliant', 'outstanding',
    'goed', 'geweldig', 'fantastisch', 'prachtig', 'mooi', 'leuk', 'fijn', 'top',
    'super', 'perfect', 'uitstekend', 'geweldig', 'prachtig', 'mooi', 'leuk'
  ];

  const negativeWords = [
    'bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'disgusting', 'disappointing',
    'sad', 'angry', 'frustrated', 'annoyed', 'upset', 'disappointed', 'poor', 'weak',
    'slecht', 'vreselijk', 'verschrikkelijk', 'afschuwelijk', 'teleurstellend', 'waardeloos',
    'rot', 'kut', 'vervelend', 'irritant', 'frustrerend', 'teleurgesteld'
  ];

  const textLower = text.toLowerCase();
  
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

  const total = positiveCount + negativeCount;
  let sentiment = 'neutral';
  let score = 0;

  if (total > 0) {
    score = ((positiveCount - negativeCount) / total) * 100;
    
    if (score > 20) {
      sentiment = 'positive';
    } else if (score < -20) {
      sentiment = 'negative';
    } else {
      sentiment = 'neutral';
    }
  }

  const confidence = total > 0 ? Math.min(Math.abs(score), 100) : 0;

  return {
    sentiment,
    score: Math.round(score),
    confidence,
    positive: positiveCount,
    negative: negativeCount,
    neutral: Math.max(0, total - positiveCount - negativeCount)
  };
}

/**
 * Detect emotions in text
 * @param {string} text - Text to analyze
 * @returns {Object} Emotion detection result
 */
export function detectEmotions(text) {
  if (!text) {
    return {
      emotions: {},
      dominant: 'neutral'
    };
  }

  const emotionWords = {
    joy: ['happy', 'joy', 'excited', 'delighted', 'pleased', 'blij', 'gelukkig', 'vrolijk'],
    sadness: ['sad', 'depressed', 'unhappy', 'sorrow', 'grief', 'verdrietig', 'droevig', 'somber'],
    anger: ['angry', 'mad', 'furious', 'rage', 'annoyed', 'boos', 'woedend', 'kwaad'],
    fear: ['afraid', 'scared', 'fear', 'worried', 'anxious', 'bang', 'bezorgd', 'angstig'],
    surprise: ['surprised', 'amazed', 'shocked', 'astonished', 'verrast', 'verbaasd'],
    disgust: ['disgusted', 'revolted', 'sickened', 'walgelijk', 'misselijk']
  };

  const textLower = text.toLowerCase();
  const emotions = {};

  Object.keys(emotionWords).forEach(emotion => {
    let count = 0;
    emotionWords[emotion].forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = textLower.match(regex);
      if (matches) count += matches.length;
    });
    if (count > 0) {
      emotions[emotion] = count;
    }
  });

  const dominant = Object.keys(emotions).length > 0
    ? Object.entries(emotions).sort((a, b) => b[1] - a[1])[0][0]
    : 'neutral';

  return {
    emotions,
    dominant
  };
}

