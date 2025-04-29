/**
 * Shared pagination utilities for SQLab Interface
 * Centralizes pagination logic to be reused across different components
 */
import { escapeHtml } from '../utils/helpers.js';
import { t } from '../controllers/localizationController.js';
import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_LIMIT } from '../utils/constants.js';

/**
 * Renders pagination controls for any table
 * @param {HTMLElement} containerElement - Container where pagination controls will be added
 * @param {number} currentOffset - Current offset for pagination
 * @param {number} limit - Number of rows per page
 * @param {number} total - Total number of rows
 * @param {Function} onPageChange - Callback when pagination changes
 * @returns {HTMLElement} - The created pagination element
 */
export function renderPaginationControls(containerElement, currentOffset, limit, total, onPageChange) {
    // Create the pagination controls
    const paginationControls = document.createElement('div');
    paginationControls.className = 'table-actions';
    
    paginationControls.innerHTML = `
        <div class="pagination">
            <button class="prev-page" ${currentOffset === DEFAULT_PAGE_OFFSET ? 'disabled' : ''} data-i18n="table.pagination.previous">Previous</button>
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
    
    // Add the new controls
    containerElement.insertBefore(paginationControls, containerElement.firstChild);
    
    // Add event handlers for pagination buttons
    const prevButton = paginationControls.querySelector('.prev-page');
    const nextButton = paginationControls.querySelector('.next-page');
    
    prevButton.addEventListener('click', () => {
        onPageChange(Math.max(DEFAULT_PAGE_OFFSET, currentOffset - limit), limit);
    });
    
    nextButton.addEventListener('click', () => {
        onPageChange(currentOffset + limit, limit);
    });
    
    return paginationControls;
}

/**
 * Renders table headers with automatic row numbering column
 * @param {Array} columns - Array of column names
 * @returns {string} - HTML string for the table header
 */
export function renderTableHeaders(columns) {
    let headerHtml = '<tr><th class="row-number-header"></th>';
    
    columns.forEach(column => {
        headerHtml += `<th>${escapeHtml(column)}</th>`;
    });
    
    headerHtml += '</tr>';
    return headerHtml;
}

/**
 * Renders table rows with automatic row numbering
 * @param {Array} rows - Array of row data
 * @param {number} offset - Current offset for pagination (for row numbering)
 * @returns {string} - HTML string for all table rows
 */
export function renderTableRows(rows, offset = DEFAULT_PAGE_OFFSET) {
    return rows.map((row, index) => {
        let rowHtml = '<tr>';
        // Add row number cell
        rowHtml += `<td class="row-number">${offset + index + 1}</td>`;
        
        // Add data cells
        row.forEach(cell => {
            rowHtml += `<td>${escapeHtml(cell !== null ? cell : t('table.nullValue'))}</td>`;
        });
        
        rowHtml += '</tr>';
        return rowHtml;
    }).join('');
}

/**
 * Renders a complete table with headers, rows and pagination
 * @param {Object} data - Table data with columns, rows and pagination metadata
 * @param {HTMLElement} tableElement - Table element to populate
 * @param {HTMLElement} containerElement - Container element for the table
 * @param {Function} onPageChange - Callback for pagination changes
 */
export function renderPaginatedTable(data, tableElement, containerElement, onPageChange) {
    // 1. Add pagination controls if total count is available
    if (data.total !== undefined) {
        renderPaginationControls(
            containerElement, 
            data.offset || DEFAULT_PAGE_OFFSET, 
            data.limit || DEFAULT_PAGE_LIMIT, 
            data.total, 
            onPageChange
        );
    }
    
    // 2. Render table content
    const headers = renderTableHeaders(data.columns);
    const rows = renderTableRows(data.rows, data.offset || DEFAULT_PAGE_OFFSET);
    
    // 3. Update the table with new content
    tableElement.innerHTML = `<thead>${headers}</thead><tbody>${rows}</tbody>`;
}

/**
 * Shows an error message in a container
 * @param {string} message - Error message to display
 * @param {HTMLElement} containerElement - Container to show the error in
 */
export function showError(message, containerElement) {
    containerElement.innerHTML = `<div class="error">${escapeHtml(message)}</div>`;
}