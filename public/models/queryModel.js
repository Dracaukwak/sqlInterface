/**
 * Model for executing SQL queries via the API
 */
import { t } from '../controllers/localizationController.js';

/**
 * Sends a SQL query to the backend for execution
 * @param {string} query - SQL query to execute
 * @returns {Promise<Object>} - Resolves with the query results
 */
export async function executeQuery(query) {
    const response = await fetch('/execute-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
    });

    // If the request failed, throw an error with the message from the backend
    if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || t('database.fetchError', { status: response.status }));
    }

    return response.json();
}