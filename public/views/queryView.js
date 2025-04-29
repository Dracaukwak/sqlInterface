/**  
 * Query View module for displaying query results
 */
import { renderPaginatedTable, showError } from '../utils/paginationUtils.js';  

/**  
 * Displays query results in a table element with row numbers and pagination controls  
 * @param {Object} data - Query result data containing columns, rows, and pagination metadata
 * @param {HTMLElement} tableElement - Target table element to populate
 * @param {HTMLElement} containerElement - Container element for additional controls
 * @param {Function} onPageChange - Callback function for pagination changes  
 */ 
export function displayResults(data, tableElement, containerElement, onPageChange) {     
    // Use the unified pagination utility to render the entire table
    renderPaginatedTable(data, tableElement, containerElement, onPageChange);
}