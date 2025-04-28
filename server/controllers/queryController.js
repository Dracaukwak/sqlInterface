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
    
    // Filter out hash columns from results
    const filteredColumns = rows.length > 0 
      ? Object.keys(rows[0]).filter(col => !col.toLowerCase().endsWith('hash'))
      : [];
    
    // Create filtered rows without hash data
    const filteredRows = rows.map(row => {
      return filteredColumns.map(col => row[col]);
    });
    
    // Format the results
    const results = {
      columns: filteredColumns,
      rows: filteredRows,
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
