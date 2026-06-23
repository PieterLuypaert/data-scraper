/**
 * AI-powered content insights routes
 */

const { generateAIInsights } = require('../utils/aiInsights');
const { sendError } = require('../utils/errorResponse');

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
    sendError(res, 500, error, 'Failed to generate insights');
  }
}

module.exports = {
  generateInsights
};

