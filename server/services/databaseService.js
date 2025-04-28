const mariadb = require('mariadb');

// Create database connection pool
const pool = mariadb.createPool({
  host: 'localhost',
  port: 3306,
  database: 'sqlab_island',
  user: 'root',
  password: 'student',
  connectionLimit: 5
});

/**
 * Gets a connection from the pool
 * @returns {Promise<Object>} Database connection
 */
async function getConnection() {
  return await pool.getConnection();
}

/**
 * Executes a query and returns the results
 * @param {string} query - SQL query to execute
 * @param {Array} params - Parameters for prepared statement (optional)
 * @returns {Promise<Array>} Query results
 */
async function executeQuery(query, params = []) {
  let conn;
  try {
    conn = await getConnection();
    return await conn.query(query, params);
  } finally {
    if (conn) conn.release();
  }
}

/**
 * Gets information about the current database
 * @returns {Promise<Object>} Database information
 */
async function getDatabaseInfo() {
  try {
    // Get current database name
    const dbInfo = await executeQuery("SELECT DATABASE() as name");
    
    // Get database host
    const hostInfo = await executeQuery("SELECT @@hostname as host");
    
    // Format adventure name
    const dbName = dbInfo[0].name;
    
    // Build response object
    return {
      name: dbName,
      host: hostInfo[0].host || 'localhost',
      port: 3306,
      adventure: formatAdventureName(dbName)
    };
  } catch (err) {
    console.error('Error fetching database info:', err);
    return {
      name: 'Not connected',
      host: 'localhost',
      adventure: 'Unknown'
    };
  }
}

/**
 * Gets the list of tables from the current database
 * @returns {Promise<Array>} List of table names
 */
async function listTables() {
  // Get current database name
  const dbInfo = await executeQuery("SELECT DATABASE() as name");
  const currentDatabase = dbInfo[0].name;
  
  
  const result = await executeQuery(`
    SELECT table_name AS table_name 
    FROM information_schema.tables 
    WHERE table_schema = ? 
    ORDER BY table_name
  `, [currentDatabase]);
  return result;
}

/**
 * Gets table data with pagination
 * @param {string} tableName - Table name
 * @param {number} offset - Starting index
 * @param {number} limit - Number of rows to retrieve
 * @returns {Promise<Object>} Table data and metadata
 */
async function getTableData(tableName, offset = 0, limit = 10) {
  // Get total row count
  const countResult = await executeQuery(`SELECT COUNT(*) as total FROM ${tableName}`);
  const total = countResult[0].total;
  
  // Get data with pagination
  const rows = await executeQuery(
    `SELECT * FROM ${tableName} LIMIT ? OFFSET ?`, 
    [parseInt(limit), parseInt(offset)]
  );
  
  return {
    tableName,
    total,
    offset: parseInt(offset),
    limit: parseInt(limit),
    columns: rows.length > 0 ? Object.keys(rows[0]) : [],
    rows: rows.map(row => Object.values(row))
  };
}

/**
 * Formats the database name for display
 * @param {string} dbName - Raw database name
 * @returns {string} Formatted name for display
 */
function formatAdventureName(dbName) {
  if (!dbName) return 'Unknown';

  // If name starts with "sqlab_", extract the part after
  if (dbName.toLowerCase().startsWith('sqlab_')) {
    const adventureName = dbName.substring(6); // 'sqlab_'.length === 6
    // Capitalize first letter
    return adventureName.charAt(0).toUpperCase() + adventureName.slice(1);
  }

  return dbName;
}

module.exports = {
  getConnection,
  executeQuery,
  getDatabaseInfo,
  listTables,
  getTableData,
  formatAdventureName
};
