const databaseService = require('../services/databaseService');

/**
 * Retrieves the list of database tables
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
async function listTables(req, res, next) {
  try {
    const tables = await databaseService.listTables();
    
    // Extract only table names
    const tableNames = tables.map(table => table.table_name);
    
    res.json({ tables: tableNames });
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieves table data with pagination
 * @param {Object} req - Express request with table name and pagination parameters
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
async function getTableData(req, res, next) {
  const { tableName } = req.params;
  const { offset = 0, limit = 10 } = req.query;
  
  try {
    const data = await databaseService.getTableData(tableName, offset, limit);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listTables,
  getTableData
};
