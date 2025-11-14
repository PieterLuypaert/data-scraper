const { compareScrapedData } = require('../utils/compare');

/**
 * Compare route handler
 */
function handleCompare(req, res) {
  const { oldData, newData } = req.body;

  if (!oldData || !newData) {
    return res.status(400).json({ error: 'Both oldData and newData are required for comparison' });
  }

  try {
    const changes = compareScrapedData(oldData, newData);
    res.json({ success: true, changes });
  } catch (error) {
    console.error('Change detection error:', error);
    res.status(500).json({ error: 'Failed to compare data', message: error.message });
  }
}

module.exports = {
  handleCompare
};

