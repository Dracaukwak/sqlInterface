/**
 * Fetches the list of available tables from the backend
 * @returns {Promise<Object>} - Resolves with an object containing table names
 */
export async function getTables() {
    const response = await fetch('/list-tables');

    if (!response.ok) {
        throw new Error("Failed to load table list");
    }

    return response.json();
}

/**
 * Fetches the data of a specific table with pagination
 * @param {string} tableName - Name of the table to load
 * @param {number} offset - Starting row for pagination
 * @param {number} limit - Number of rows to retrieve
 * @returns {Promise<Object>} - Resolves with table content and metadata
 */
export async function getTableData(tableName, offset, limit) {
    const response = await fetch(`/table-data/${tableName}?offset=${offset}&limit=${limit}`);

    if (!response.ok) {
        throw new Error("Failed to load table data");
    }

    return response.json();
}
