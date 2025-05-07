// Model for retrieving information about the connected database
import { translate as t } from '../utils/i18nManager.js';

/**
 * Gets the adventure title from the sqlab_info table
 * @returns {Promise<string>} Adventure title
 */
export async function getAdventureTitle() {
    try {
        // Direct query for the title without pagination to avoid issues
        const response = await fetch('/execute-query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                query: "SELECT value FROM sqlab_info WHERE name = 'title' LIMIT 1",
                // Set special flag to bypass pagination for this system query
                skipPagination: true 
            })
        });

        if (!response.ok) {
            throw new Error(t('database.fetchError', { status: response.status }));
        }

        const result = await response.json();
        
        // If no result found
        if (!result.rows || result.rows.length === 0) {
            return t('database.unknown');
        }
        
        // Return the title directly from the database
        return result.rows[0][0];
    } catch (error) {
        console.error('Error fetching adventure title:', error);
        return t('database.unknown');
    }
}

/**
 * Gets the relational schema SVG from the sqlab_info table
 * @returns {Promise<string>} Relational schema SVG content
 */
export async function getRelationalSchema() {
    try {
        // Similar special query for schema without pagination
        const response = await fetch('/execute-query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                query: "SELECT value FROM sqlab_info WHERE name = 'relational_schema' LIMIT 1",
                skipPagination: true
            })
        });

        if (!response.ok) {
            throw new Error(t('database.fetchError', { status: response.status }));
        }

        const result = await response.json();
        
        // If no result found
        if (!result.rows || result.rows.length === 0) {
            return null;
        }
        
        // Return the schema SVG content
        return result.rows[0][0];
    } catch (error) {
        console.error('Error fetching relational schema:', error);
        return null;
    }
}