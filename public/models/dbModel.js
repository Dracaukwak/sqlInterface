// Model for retrieving information about the connected database
import { t } from '../controllers/localizationController.js';

/**
 * Gets the adventure title from the sqlab_info table
 * @returns {Promise<string>} Adventure title
 */
export async function getAdventureTitle() {
    try {
        // Execute SQL query to get the title
        const response = await fetch('/execute-query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                query: "SELECT value FROM sqlab_info WHERE name = 'title' LIMIT 1" 
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
        // Execute SQL query to get the relational schema
        const response = await fetch('/execute-query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                query: "SELECT value FROM sqlab_info WHERE name = 'relational_schema' LIMIT 1" 
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