const databaseService = require('../services/databaseService');

/**
 * Executes a SQL query and returns the results
 * @param {Object} req - Express request containing SQL query
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
async function executeQuery(req, res, next) {
  const { query } = req.body;
  
  if (!query || query.trim() === '') {
    return res.status(400).json({
      error: 'Query cannot be empty'
    });
  }
  
  try {
    // Execute the query
    const rows = await databaseService.executeQuery(query);
    
    // Format the results
    const results = {
      columns: rows.length > 0 ? Object.keys(rows[0]) : [],
      rows: rows.map(row => Object.values(row)),
      totalRows: rows.length
    };
    
    res.json(results);
  } catch (err) {
    // For SQL errors, return 400 instead of 500
    res.status(400).json({
      error: `Database error: ${err.message}`
    });
  }
}

module.exports = {
  executeQuery
};
