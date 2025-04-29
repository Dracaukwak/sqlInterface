import { escapeHtml } from '../utils/helpers.js'; 
import { t } from '../controllers/localizationController.js';  

/**  
 * Displays query results in a table element with row numbers, pagination controls, and a summary  
 * @param {Object} data - Query result data containing columns, rows, and pagination metadata
 * @param {HTMLElement} tableElement - Target table element to populate
 * @param {HTMLElement} containerElement - Container element for additional controls
 * @param {Function} onPageChange - Callback function for pagination changes  
 */ 
export function displayResults(data, tableElement, containerElement, onPageChange) {     
    // Add pagination controls if total count is available
    if (data.total !== undefined) {
        const currentOffset = data.offset || 0;
        const limit = data.limit || 10;
        const total = data.total;
        
        // Create pagination controls
        const paginationControls = document.createElement('div');
        paginationControls.className = 'table-actions';
        
        paginationControls.innerHTML = `
            <div class="pagination">
                <button class="prev-page" ${currentOffset === 0 ? 'disabled' : ''} data-i18n="table.pagination.previous">Previous</button>
                <button class="next-page" ${currentOffset + limit >= total ? 'disabled' : ''} data-i18n="table.pagination.next">Next</button>
                <span class="pagination-info">
                    ${currentOffset+1}-${Math.min(currentOffset+limit, total)} 
                    <span data-i18n="table.pagination.of">of</span> 
                    ${total}
                </span>
            </div>
        `;
        
        // Remove any existing pagination controls
        const existingControls = containerElement.querySelector('.table-actions');
        if (existingControls) {
            containerElement.removeChild(existingControls);
        }
        
        // Add the new controls before the table
        containerElement.insertBefore(paginationControls, tableElement);
        
        // Add event handlers for pagination buttons
        const prevButton = paginationControls.querySelector('.prev-page');
        const nextButton = paginationControls.querySelector('.next-page');
        
        prevButton.addEventListener('click', () => {
            onPageChange(Math.max(0, currentOffset - limit), limit);
        });
        
        nextButton.addEventListener('click', () => {
            onPageChange(currentOffset + limit, limit);
        });
    }
    
    // Add a column for row numbers (no column header label)     
    let headers = `<th class="row-number-header"></th>` +          
        data.columns.map(col => `<th>${escapeHtml(col)}</th>`).join('');      
    
    // Map each row and add its index as the row number
    // Use offset to show the correct row numbers across pages     
    let rows = data.rows.map((row, index) =>          
        `<tr>             
            <td class="row-number">${(data.offset || 0) + index + 1}</td>             
            ${row.map(cell => `<td>${escapeHtml(cell !== null ? cell : t('table.nullValue'))}</td>`).join('')}         
        </tr>`     
    ).join('');      
    
    // Populate the table with headers and rows     
    tableElement.innerHTML = `<thead><tr>${headers}</tr></thead><tbody>${rows}</tbody>`;
}  

/**  
 * Displays an error message in the specified container  
 * @param {string} message - Error message to display  
 * @param {HTMLElement} containerElement - Target container to show the error  
 */ 
export function showError(message, containerElement) {     
    // Replace container content with error block     
    containerElement.innerHTML = `         
        <div class="error">${escapeHtml(message)}</div>     
    `; 
}