import mariadb from 'mariadb';
import defaultConfig from '../config.js';
import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_LIMIT } from '../../public/utils/constants.js';

// Store the current configuration (initially loaded from config.js)
let currentConfig = { ...defaultConfig.dbConfig };

// Create database connection pool
let pool = mariadb.createPool(currentConfig);

/**
 * Sets the database to use for the application
 * @param {string} databaseName - Name of the database to use
 * @returns {Promise<Object>} Result of the operation
 */
async function setDatabase(databaseName) {
  try {
    // Close existing pool connections
    await pool.end();
    
    // Create new configuration with updated database name
    currentConfig = { 
      ...currentConfig,
      database: databaseName
    };
    
    // Create new connection pool with updated configuration
    pool = mariadb.createPool(currentConfig);
    
    // Test connection
    const conn = await pool.getConnection();
    await conn.query(`USE ${databaseName}`);
    conn.release();
    
    return {
      database: databaseName,
      host: currentConfig.host,
      port: currentConfig.port
    };
  } catch (err) {
    console.error(`Error setting database to ${databaseName}:`, err);
    throw err;
  }
}

/**
 * Gets table of contents data from a specific database
 * @param {string} databaseName - Database to get TOC data from
 * @returns {Promise<Object>} Parsed TOC data
 */
async function getTocData(databaseName) {
  let tempPool = null;
  let conn = null;
  
  try {
    // Create a temporary pool for this specific database
    tempPool = mariadb.createPool({
      ...currentConfig,
      database: databaseName
    });
    
    // Get connection from temporary pool
    conn = await tempPool.getConnection();
    
    // Query for TOC data
    const result = await conn.query(
      "SELECT value FROM sqlab_info WHERE name = 'parts' LIMIT 1"
    );
    
    if (result.length === 0) {
      throw new Error(`No TOC data found in database ${databaseName}`);
    }
    
    // Parse JSON TOC data
    try {
      return JSON.parse(result[0].value);
    } catch (parseError) {
      console.error('Error parsing TOC data:', parseError);
      throw new Error('Invalid TOC data format');
    }
  } catch (err) {
    console.error(`Error getting TOC data from ${databaseName}:`, err);
    throw err;
  } finally {
    // Close connection and pool
    if (conn) conn.release();
    if (tempPool) await tempPool.end();
  }
}

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
      host: hostInfo[0].host || currentConfig.host,
      port: currentConfig.port,
      adventure: formatAdventureName(dbName)
    };
  } catch (err) {
    console.error('Error fetching database info:', err);
    return {
      name: 'Not connected',
      host: currentConfig.host,
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
async function getTableData(tableName, offset = DEFAULT_PAGE_OFFSET, limit = DEFAULT_PAGE_LIMIT) {
  // Get total row count
  const countResult = await executeQuery(`SELECT COUNT(*) as total FROM ${tableName}`);
  const total = countResult[0].total;
  
  // Get data with pagination
  const rows = await executeQuery(
    `SELECT * FROM ${tableName} LIMIT ? OFFSET ?`, 
    [parseInt(limit), parseInt(offset)]
  );
  
  // Filter out hash columns
  const filteredColumns = rows.length > 0 
    ? Object.keys(rows[0]).filter(col => !col.toLowerCase().endsWith('hash'))
    : [];
  
  // Create filtered rows without hash data
  const filteredRows = rows.map(row => {
    return filteredColumns.map(col => row[col]);
  });
  
  return {
    tableName,
    total,
    offset: parseInt(offset),
    limit: parseInt(limit),
    columns: filteredColumns,
    rows: filteredRows
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

export default {
  getConnection,
  executeQuery,
  getDatabaseInfo,
  listTables,
  getTableData,
  formatAdventureName,
  setDatabase,
  getTocData
};