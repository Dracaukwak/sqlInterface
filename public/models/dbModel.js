// Model for retrieving information about the connected database

/**
 * Fetches information about the connected database
 * @returns {Promise<Object>} - Resolves with database details
 */
export async function getDatabaseInfo() {
    try {
        // Send a request to retrieve the current database name
        const response = await fetch('/database-info');

        if (!response.ok) {
            throw new Error('Failed to fetch database information');
        }

        return await response.json();
    } catch (error) {
        console.error('Error while retrieving database info:', error);

        // Return fallback data in case of failure
        return {
            name: 'Not connected',
            host: 'localhost',
            adventure: 'Unknown'
        };
    }
}

/**
 * Formats the raw database name for display
 * Example: "sqlab_island" → "Island", "sqlab_corbeau" → "Corbeau"
 * @param {string} dbName - Raw database name
 * @returns {string} - Formatted name for display
 */
export function formatDatabaseName(dbName) {
    if (!dbName) return 'Unknown';

    // If name starts with "sqlab_", remove the prefix and capitalize the rest
    if (dbName.toLowerCase().startsWith('sqlab_')) {
        const adventureName = dbName.substring(6); // Length of "sqlab_"
        return adventureName.charAt(0).toUpperCase() + adventureName.slice(1);
    }

    return dbName;
}
