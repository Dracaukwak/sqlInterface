// Model for retrieving information about the connected database
import dbService from '../services/dbService.js';

/**
 * Gets the adventure title from the sqlab_info table
 * @returns {Promise<string>} Adventure title
 */
export async function getAdventureTitle() {
    return dbService.getAdventureTitle();
}

/**
 * Gets the relational schema SVG from the sqlab_info table
 * @returns {Promise<string>} Relational schema SVG content
 */
export async function getRelationalSchema() {
    return dbService.getRelationalSchema();
}