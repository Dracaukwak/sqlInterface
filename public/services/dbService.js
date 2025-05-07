/**
 * Unified Database Service
 * Centralizes all database interactions for cleaner code and consistent error handling
 */
class DbService {
    /**
     * Executes a SQL query with pagination
     * @param {string} query - SQL query to execute
     * @param {number} offset - Starting offset for pagination
     * @param {number} limit - Number of rows to retrieve
     * @param {boolean} skipPagination - Whether to skip pagination
     * @returns {Promise<Object>} - Query results
     */
    async executeQuery(query, offset = 0, limit = 10, skipPagination = false) {
      try {
        const response = await fetch('/execute-query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, offset, limit, skipPagination })
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Database error: ${response.status}`);
        }
  
        return await response.json();
      } catch (error) {
        console.error('Query execution error:', error);
        throw error;
      }
    }
  
    /**
     * Gets a list of all tables in the current database
     * @returns {Promise<Array<string>>} - Array of table names
     */
    async getTables() {
      try {
        const response = await fetch('/list-tables');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch tables: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Filter out system tables that start with "sqlab_"
        return data.tables.filter(tableName => !tableName.startsWith('sqlab_'));
      } catch (error) {
        console.error('Error fetching tables:', error);
        throw error;
      }
    }
  
    /**
     * Gets data for a specific table with pagination
     * @param {string} tableName - Table to fetch
     * @param {number} offset - Starting offset for pagination
     * @param {number} limit - Number of rows to retrieve
     * @returns {Promise<Object>} - Table data with pagination metadata
     */
    async getTableData(tableName, offset = 0, limit = 10) {
      try {
        const response = await fetch(`/table-data/${tableName}?offset=${offset}&limit=${limit}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch table data: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error(`Error fetching data for table ${tableName}:`, error);
        throw error;
      }
    }
  
    /**
     * Gets information about the current database
     * @returns {Promise<Object>} - Database information
     */
    async getDatabaseInfo() {
      try {
        const response = await fetch('/database-info');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch database info: ${response.status}`);
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
    async setDatabase(databaseName) {
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
    async getTocData(databaseName) {
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
     * Gets metadata from the sqlab_info table
     * @param {string} key - Metadata key to fetch
     * @param {any} defaultValue - Default value if not found
     * @returns {Promise<any>} - The metadata value
     */
    async getMetadata(key, defaultValue = null) {
      try {
        const response = await this.executeQuery(
          `SELECT value FROM sqlab_info WHERE name = '${key}' LIMIT 1`,
          0, 1, true // Skip pagination for system table queries
        );
        
        if (!response.rows || response.rows.length === 0) {
          console.warn(`No metadata found for key: ${key}`);
          return defaultValue;
        }
        
        return response.rows[0][0];
      } catch (error) {
        console.error(`Error fetching metadata for key ${key}:`, error);
        return defaultValue;
      }
    }
  
    /**
     * Gets the adventure title from the database metadata
     * @returns {Promise<string>} - Adventure title
     */
    async getAdventureTitle() {
      return this.getMetadata('title', 'Unknown Adventure');
    }
  
    /**
     * Gets the relational schema from the database metadata
     * @returns {Promise<string|null>} - Schema SVG content or null if not found
     */
    async getRelationalSchema() {
      return this.getMetadata('relational_schema');
    }
  }
  
  // Export a singleton instance of the service
  export default new DbService();