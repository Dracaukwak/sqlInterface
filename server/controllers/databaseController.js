const databaseService = require('../services/databaseService');

/**
 * Retrieves and returns database information
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
async function getDatabaseInfo(req, res, next) {
  try {
    const dbInfo = await databaseService.getDatabaseInfo();
    res.json(dbInfo);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDatabaseInfo
};
