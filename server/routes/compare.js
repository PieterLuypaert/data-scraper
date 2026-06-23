const { compareScrapedData } = require('../utils/compare');
const { sendError } = require('../utils/errorResponse');

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
    sendError(res, 500, error, 'Failed to compare data');
  }
}

module.exports = {
  handleCompare
};

