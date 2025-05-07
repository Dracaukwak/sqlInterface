import databaseService from '../services/databaseService.js';

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

/**
 * Sets the database to use for the current session
 * @param {Object} req - Express request with database name
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
async function setDatabase(req, res, next) {
  try {
    const { database } = req.body;
    
    if (!database) {
      return res.status(400).json({
        error: 'Database name is required'
      });
    }
    
    // Update database configuration
    const result = await databaseService.setDatabase(database);
    
    res.json({ 
      success: true, 
      message: `Database switched to ${database}`,
      ...result
    });
  } catch (err) {
    console.error('Error setting database:', err);
    res.status(500).json({
      error: `Failed to set database: ${err.message}`
    });
  }
}

/**
 * Gets the table of contents (TOC) data for the specified database
 * @param {Object} req - Express request with database name
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
async function getTocData(req, res, next) {
  try {
    const { database } = req.body;
    
    if (!database) {
      return res.status(400).json({
        error: 'Database name is required'
      });
    }
    
    // Temporarily connect to the specified database to get TOC data
    const tocData = await databaseService.getTocData(database);
    
    res.json({ 
      success: true,
      toc: tocData
    });
  } catch (err) {
    console.error('Error getting TOC data:', err);
    res.status(500).json({
      error: `Failed to get TOC data: ${err.message}`
    });
  }
}

export default {
  getDatabaseInfo,
  setDatabase,
  getTocData
};