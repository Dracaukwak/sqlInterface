import { escapeHtml } from '../utils/helpers.js';
import { t } from '../controllers/localizationController.js';
import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_LIMIT } from '../utils/constants.js';

/**
 * Renders pagination controls as numbered buttons in a scrollable container
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
    
    // Calculate total pages and current page
    const totalPages = Math.ceil(total / limit);
    const currentPage = Math.floor(currentOffset / limit) + 1;
    
    // Create the pagination container
    const pagination = document.createElement('div');
    pagination.className = 'pagination-scroll';
    
    const paginationInner = document.createElement('div');
    paginationInner.className = 'pagination-buttons';
    
    // Generate page buttons
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = 'page-button';
        if (i === currentPage) {
            pageButton.classList.add('active');
        }
        
        // For last page that might not have full limit, calculate actual row count
        const pageOffset = (i - 1) * limit;
        const rowEnd = Math.min(pageOffset + limit, total);
        
        // Display the range of rows in button
        pageButton.textContent = rowEnd;
        pageButton.setAttribute('data-page', i);
        pageButton.setAttribute('title', `${t('table.pagination.rows')} ${pageOffset + 1}-${rowEnd}`);
        
        pageButton.addEventListener('click', () => {
            if (i !== currentPage) {
                onPageChange((i - 1) * limit, limit);
            }
        });
        
        paginationInner.appendChild(pageButton);
    }
    
    pagination.appendChild(paginationInner);
    paginationControls.appendChild(pagination);
    
    // Remove any existing pagination controls
    const existingControls = containerElement.querySelector('.table-actions');
    if (existingControls) {
        containerElement.removeChild(existingControls);
    }
    
    // Add the new controls
    containerElement.insertBefore(paginationControls, containerElement.firstChild);
    
    // After rendering, scroll pagination to make current page button visible
    if (paginationInner.querySelector('.page-button.active')) {
        const activeButton = paginationInner.querySelector('.page-button.active');
        const containerWidth = pagination.offsetWidth;
        const buttonLeft = activeButton.offsetLeft;
        const buttonWidth = activeButton.offsetWidth;
        
        // Center the active button if possible
        pagination.scrollLeft = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);
    }

    
    
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
 * Renders table rows with automatic row numbering and click-to-copy functionality
 * @param {Array} rows - Array of row data
 * @param {number} offset - Current offset for pagination (for row numbering)
 * @param {boolean} enableClickToCopy - Whether to enable click-to-copy functionality
 * @returns {string} - HTML string for all table rows
 */
export function renderTableRows(rows, offset = DEFAULT_PAGE_OFFSET, enableClickToCopy = false) {
    return rows.map((row, index) => {
        let rowHtml = '<tr>';
        // Add row number cell
        rowHtml += `<td class="row-number">${offset + index + 1}</td>`;
        
        // Add data cells
        row.forEach(cell => {
            const cellContent = escapeHtml(cell !== null ? cell : t('table.nullValue'));
            if (enableClickToCopy) {
                rowHtml += `<td class="copyable" title="${t('table.clickToCopy') || 'Click to copy cell content'}">${cellContent}</td>`;
            } else {
                rowHtml += `<td>${cellContent}</td>`;
            }
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
 * @param {boolean} enableClickToCopy - Whether to enable click-to-copy functionality
 */
export function renderPaginatedTable(data, tableElement, containerElement, onPageChange, enableClickToCopy = false) {
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
    const rows = renderTableRows(data.rows, data.offset || DEFAULT_PAGE_OFFSET, enableClickToCopy);
    
    // 3. Update the table with new content
    tableElement.innerHTML = `<thead>${headers}</thead><tbody>${rows}</tbody>`;
    
    // 4. Add click-to-copy event listeners if enabled
    if (enableClickToCopy) {
        addCopyEventListeners(tableElement);
    }
}

/**
 * Adds click-to-copy event listeners to copyable cells in a table
 * @param {HTMLElement} tableElement - The table element containing copyable cells
 */
function addCopyEventListeners(tableElement) {
    tableElement.querySelectorAll('td.copyable').forEach(cell => {
        cell.addEventListener('click', async function(e) {
            // Get the text content of the cell
            const textToCopy = this.textContent.trim();
            
            try {
                // Try to use the clipboard API
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(textToCopy);
                } else {
                    // Fallback for older browsers
                    const success = fallbackCopyTextToClipboard(textToCopy);
                    if (!success) throw new Error('Fallback copying failed');
                }
                
                // Visual feedback that copying was successful - using classes instead of inline styles
                this.classList.add('copy-success');
                
                setTimeout(() => {
                    this.classList.remove('copy-success');
                }, 300);
                
            } catch (err) {
                console.error('Failed to copy text: ', err);
                
                // Visual feedback that copying failed - using classes instead of inline styles
                this.classList.add('copy-error');
                
                setTimeout(() => {
                    this.classList.remove('copy-error');
                }, 300);
            }
            
            // Prevent default action and propagation
            e.preventDefault();
            e.stopPropagation();
        });
        
        // Prevent text selection on double click
        cell.addEventListener('dblclick', function(e) {
            e.preventDefault();
        });
    });
}

/**
 * Fallback method for browsers that don't support the Clipboard API
 * @param {string} text - Text to copy to clipboard
 * @returns {boolean} - Whether the operation was successful
 */
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Make the textarea out of viewport
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    let successful = false;
    try {
        successful = document.execCommand('copy');
    } catch (err) {
        console.error('Fallback: Copying text failed', err);
    }
    
    document.body.removeChild(textArea);
    return successful;
}

/**
 * Shows an error message in a container
 * @param {string} message - Error message to display
 * @param {HTMLElement} containerElement - Container to show the error in
 */
export function showError(message, containerElement) {
    containerElement.innerHTML = `<div class="error">${escapeHtml(message)}</div>`;
}