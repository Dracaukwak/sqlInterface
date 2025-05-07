/**
 * Model for managing episode data and operations
 * Handles loading, processing, and extracting metadata from episodes
 */
import { executeQuery } from './queryModel.js';
import dbService from '../services/dbService.js';

/**
 * Loads an episode using a token
 * @param {string|number} token - The token to decrypt
 * @returns {Promise<Object>} - The processed episode data
 */
export async function loadEpisodeByToken(token) {
    try {
        const response = await dbService.executeSQL(`SELECT decrypt(${token})`, 0, 10);
        return processEpisodeResponse(response);
    } catch (error) {
        console.error('Error loading episode:', error);
        throw error;
    }
}

/**
 * Processes the response from a decrypt query
 * @param {Object} response - Query response data
 * @returns {Promise<Object>} - Processed episode data
 */
export async function processEpisodeResponse(response) {
    if (!response.rows?.length || !response.rows[0]?.length) {
        throw new Error('Failed to load episode data');
    }
    
    try {
        const data = response.rows[0][0];
        let episodeData;
        
        // Parse JSON if returned as string
        if (typeof data === 'string') {
            episodeData = JSON.parse(data);
        } else {
            episodeData = data;
        }
        
        return episodeData;
    } catch (error) {
        console.error('Error parsing episode data:', error);
        throw error;
    }
}

/**
 * Checks if the provided data is a hint rather than a full episode
 * @param {Object} episodeData - The episode data to examine
 * @returns {boolean} - Whether the data is a hint
 */
export function isHint(episodeData) {
    return episodeData.feedback && 
           !episodeData.task && 
           episodeData.feedback.includes('<div class=\'hint\'>');
}

/**
 * Extracts episode number from episode content if available
 * @param {string} episodeContent - HTML content of the episode
 * @returns {number|null} - Extracted episode number or null if not found
 */
export function extractEpisodeNumber(episodeContent) {
    if (!episodeContent) return null;
    
    const match = episodeContent.match(/<div class='task_number'>(\d+)<\/div>/);
    if (match && match[1]) {
        return parseInt(match[1]);
    }
    
    return null;
}

/**
 * Gets hint for a given query by hashing it
 * @param {string} query - SQL query to get hint for
 * @returns {Promise<Object|null>} - Hint data if available
 */
export async function getHintForQuery(query) {
    try {
        const hashResponse = await dbService.executeSQL(
            `SELECT decrypt(hash(${JSON.stringify(query)}))`, 
            0, 
            10
        );
        
        if (hashResponse.rows?.length > 0 && hashResponse.rows[0]?.length > 0) {
            const hintData = hashResponse.rows[0][0];
            
            try {
                let hintObj;
                if (typeof hintData === 'string') {
                    hintObj = JSON.parse(hintData);
                } else {
                    hintObj = hintData;
                }
                
                return hintObj;
            } catch (e) {
                console.error('Error parsing hint data:', e);
                return {
                    rawHint: hintData
                };
            }
        }
        
        return null;
    } catch (error) {
        console.error('Error fetching hint:', error);
        return null;
    }
}

/**
 * Enhances a query with the verification formula if needed
 * @param {string} query - Original SQL query
 * @param {string} formula - Verification formula to add
 * @returns {string} - Enhanced query with formula
 */
export function enhanceQueryWithFormula(query, formula) {
    if (!query || !formula) return query;
    
    // If query already includes the formula, return as is
    if (query.toLowerCase().includes(formula.toLowerCase())) {
        return query;
    }
    
    // Otherwise, add the formula to the SELECT clause
    // Using the external addColumnToSelects function from sqlUtils
    return window.addColumnToSelects(query, formula);
}