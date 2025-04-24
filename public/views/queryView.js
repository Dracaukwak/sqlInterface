import { escapeHtml } from '../utils/helpers.js';
import { t } from '../controllers/localizationController.js';

/**
 * Displays query results in a table element with row numbers and a summary
 * @param {Object} data - Query result data containing columns and rows
 * @param {HTMLElement} tableElement - Target table element to populate
 */
export function displayResults(data, tableElement) {
    // Add a column for row numbers (no column header label)
    let headers = `<th class="row-number-header"></th>` + 
        data.columns.map(col => `<th>${escapeHtml(col)}</th>`).join('');

    // Map each row and add its index as the row number
    let rows = data.rows.map((row, index) => 
        `<tr>
            <td class="row-number">${index + 1}</td>
            ${row.map(cell => `<td>${escapeHtml(cell !== null ? cell : t('table.nullValue'))}</td>`).join('')}
        </tr>`
    ).join('');

    // Populate the table with headers and rows
    tableElement.innerHTML = `<thead><tr>${headers}</tr></thead><tbody>${rows}</tbody>`;

    // Row counter below the table
    const displayedRows = data.rows.length;
    const totalRows = data.totalRows || displayedRows;
    const rowCounter = document.createElement('div');
    rowCounter.className = 'row-counter';
    
    // Use translation with pluralization parameter
    const plural = displayedRows > 1 ? 's' : '';
    rowCounter.textContent = t('table.rowCounter', {
        displayedRows: displayedRows,
        total: totalRows,
        plural: plural
    });

    // Insert the counter just after the table
    tableElement.parentNode.insertBefore(rowCounter, tableElement.nextSibling);
}

/**
 * Displays an error message in the specified container
 * @param {string} message - Error message to display
 * @param {HTMLElement} containerElement - Target container to show the error
 */
export function showError(message, containerElement) {
    // Replace container content with error block
    containerElement.innerHTML = `
        <h3>${t('execution.results')}</h3>
        <div class="error">${escapeHtml(message)}</div>
    `;
}