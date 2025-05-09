/**  
 * Query View module for displaying query results
 */
import { renderPaginatedTable, showError } from '../utils/tableUtils.js';  

// Export renderPaginatedTable as displayResults for backward compatibility
export { renderPaginatedTable as displayResults };

// Any other query-specific view functions could go here