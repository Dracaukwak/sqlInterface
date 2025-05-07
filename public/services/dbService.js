/**
 * Database Service - Unified interface for database operations
 * Centralizes all database interactions to provide a consistent API
 */
import { executeQuery } from '../models/queryModel.js';
import { getTables, getTableData } from '../models/tableModel.js';
import { translate as t } from '../utils/i18nManager.js';

/**
 * Fetches information about the current database connection
 * @returns {Promise<Object>} Database information
 */
export async function getDatabaseInfo() {
    try {
        const response = await fetch('/database-info');
        
        if (!response.ok) {
            throw new Error(t('database.fetchError', { status: response.status }));
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching database info:', error);
        throw error;
    }
}

/**
 * Changes the active database
 * @param {string} databaseName - Database to connect to
 * @returns {Promise<Object>} - Result of the operation
 */
export async function setDatabase(databaseName) {
    try {
        const response = await fetch('/set-database', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ database: databaseName })
        });

        if (!response.ok) {
            throw new Error(`Failed to set database: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error setting database:', error);
        throw error;
    }
}

/**
 * Fetches table of contents for a database
 * @param {string} databaseName - Database to get TOC from
 * @returns {Promise<Object>} - TOC data
 */
export async function getTocData(databaseName) {
    try {
        const response = await fetch('/get-toc', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ database: databaseName })
        });

        if (!response.ok) {
            throw new Error(`Failed to load TOC data: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error loading TOC data:', error);
        throw error;
    }
}

/**
 * Executes a SQL query with pagination
 * @param {string} query - SQL query to execute
 * @param {number} offset - Pagination offset 
 * @param {number} limit - Pagination limit
 * @param {boolean} skipPagination - Whether to skip pagination
 * @returns {Promise<Object>} - Query results
 */
export async function executeSQL(query, offset = 0, limit = 10, skipPagination = false) {
    return executeQuery(query, offset, limit, skipPagination);
}

/**
 * Gets all tables in the current database
 * @returns {Promise<Array<string>>} - List of table names
 */
export async function getAllTables() {
    try {
        const data = await getTables();
        // Filter out system tables that start with "sqlab_"
        return data.tables.filter(tableName => !tableName.startsWith('sqlab_'));
    } catch (error) {
        console.error('Error getting tables:', error);
        throw error;
    }
}

/**
 * Gets table data with pagination
 * @param {string} tableName - Name of the table
 * @param {number} offset - Pagination offset
 * @param {number} limit - Pagination limit
 * @returns {Promise<Object>} - Table data and metadata
 */
export async function getTable(tableName, offset = 0, limit = 10) {
    return getTableData(tableName, offset, limit);
}

/**
 * Gets the adventure title from the database metadata
 * @returns {Promise<string>} Adventure title
 */
export async function getAdventureTitle() {
    try {
        const response = await executeSQL(
            "SELECT value FROM sqlab_info WHERE name = 'title' LIMIT 1",
            0, 
            1, 
            true // Skip pagination for this system query
        );
        
        if (!response.rows || response.rows.length === 0) {
            return t('database.unknown');
        }
        
        return response.rows[0][0];
    } catch (error) {
        console.error('Error fetching adventure title:', error);
        return t('database.unknown');
    }
}

/**
 * Gets the relational schema from the database metadata
 * @returns {Promise<string|null>} Schema SVG content or null if not found
 */
export async function getRelationalSchema() {
    try {
        const response = await executeSQL(
            "SELECT value FROM sqlab_info WHERE name = 'relational_schema' LIMIT 1",
            0,
            1,
            true // Skip pagination for this system query
        );
        
        if (!response.rows || response.rows.length === 0) {
            return null;
        }
        
        return response.rows[0][0];
    } catch (error) {
        console.error('Error fetching relational schema:', error);
        return null;
    }
}

export default {
    getDatabaseInfo,
    setDatabase,
    getTocData,
    executeSQL,
    getAllTables,
    getTable,
    getAdventureTitle,
    getRelationalSchema
};