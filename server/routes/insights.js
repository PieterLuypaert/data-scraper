/**
 * AI-powered content insights routes
 */

const { generateAIInsights } = require('../utils/aiInsights');

/**
 * Generate AI insights for scraped data
 * POST /api/insights/generate
 */
async function generateInsights(req, res) {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'No data provided'
      });
    }

    const insights = generateAIInsights(data);

    res.json({
      success: true,
      insights
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate insights',
      message: error.message
    });
  }
}

module.exports = {
  generateInsights
};

