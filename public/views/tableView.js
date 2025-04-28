import { escapeHtml } from '../utils/helpers.js';
import { t } from '../controllers/localizationController.js';

/**
 * Renders a list of business tables as collapsible accordions with column names
 * @param {string[]} tables - List of table names
 */
export function renderBusinessTables(tables) {
    const tablesContainer = document.getElementById('business-tables-container');
    tablesContainer.innerHTML = '';

    // For each table, create an accordion and load column names
    tables.forEach(tableName => {
        const tableAccordion = document.createElement('div');
        tableAccordion.className = 'table-accordion';
        tableAccordion.dataset.table = tableName;
        tableAccordion.setAttribute('draggable', 'true');

        // Create the header with loading state for columns
        const tableHeader = document.createElement('div');
        tableHeader.className = 'table-header';
        tableHeader.innerHTML = `
            <div class="table-name">${escapeHtml(tableName)}</div>
            <div class="table-columns-separator">:</div>
            <div class="table-columns" id="columns-${tableName}">
                <span class="loading-columns">${t('businessTables.loadingColumns') || 'Loading columns...'}</span>
            </div>
            <div class="toggle-icon">▼</div>
        `;

        // Create the collapsible content area
        const tableContent = document.createElement('div');
        tableContent.className = 'table-content';
        tableContent.id = `content-${tableName}`;
        tableContent.innerHTML = `<div class="loading">${t('businessTables.loading')}</div>`;

        // Handle accordion open/close and lazy loading
        tableHeader.addEventListener('click', function () {
            if (window.dragging) return;
            tableContent.classList.toggle('active');
            const toggleIcon = tableHeader.querySelector('.toggle-icon');
            toggleIcon.textContent = tableContent.classList.contains('active') ? '▲' : '▼';

            if (tableContent.classList.contains('active') && tableContent.querySelector('.loading')) {
                window.loadTableData(tableName, 0, 10);
            }
        });

        tableAccordion.appendChild(tableHeader);
        tableAccordion.appendChild(tableContent);
        tablesContainer.appendChild(tableAccordion);

        // Load column metadata for this table (without loading actual data)
        loadTableColumns(tableName);
    });
}

/**
 * Loads and displays column names for a table in its header
 * @param {string} tableName - The name of the table
 */
async function loadTableColumns(tableName) {
    try {
        // Load just one row to get column names without fetching all data
        const response = await fetch(`/table-data/${tableName}?offset=0&limit=1`);

        if (!response.ok) {
            throw new Error(t('error.tableData'));
        }

        const data = await response.json();
        const columnsElement = document.getElementById(`columns-${tableName}`);

        if (data.columns && data.columns.length > 0) {
            // Filter out hash columns and format the remaining ones
            const filteredColumns = data.columns.filter(col => !col.toLowerCase().endsWith('hash'));
            columnsElement.innerHTML = filteredColumns.map(column =>
                `<span class="column-name">${escapeHtml(column)}</span>`
            ).join(', ');
        } else {
            columnsElement.innerHTML = '<span class="no-columns">(No columns)</span>';
        }
    } catch (error) {
        console.error(`Error loading columns for ${tableName}:`, error);
        const columnsElement = document.getElementById(`columns-${tableName}`);
        columnsElement.innerHTML = '<span class="error-columns">Failed to load columns</span>';
    }
}
/**
 * Renders a table's data inside its content area, with pagination and row numbers
 * @param {string} tableName - The name of the table
 * @param {Object} data - Data and metadata for the table
 * @param {number} currentOffset - Offset for pagination
 * @param {Function} loadTableData - Callback to reload table data
 */
export function renderTableData(tableName, data, currentOffset, loadTableData) {
    const tableContent = document.getElementById(`content-${tableName}`);
    const total = data.total || data.rows.length;
    const limit = data.limit || 10;
    const displayedRows = data.rows.length;

    // Also update the column names in the header when data is loaded
    const columnsElement = document.getElementById(`columns-${tableName}`);
    if (columnsElement && data.columns && data.columns.length > 0) {
        columnsElement.innerHTML = data.columns.map(column =>
            `<span class="column-name">${escapeHtml(column)}</span>`
        ).join(', ');
    }

    // Pagination control bar
    const tableActions = document.createElement('div');
    tableActions.className = 'table-actions';
    tableActions.innerHTML = `
        <div class="pagination">
            <button class="prev-page" ${currentOffset === 0 ? 'disabled' : ''}>${t('table.pagination.previous')}</button>
            <button class="next-page" ${currentOffset + limit >= total ? 'disabled' : ''}>${t('table.pagination.next')}</button>
        </div>
    `;

    const table = document.createElement('table');

    // Table headers with row number column
    let headerHtml = '<tr><th class="row-number-header"></th>';
    data.columns.forEach(column => {
        headerHtml += `<th>${escapeHtml(column)}</th>`;
    });
    headerHtml += '</tr>';

    // Table rows
    let bodyHtml = '';
    data.rows.forEach((row, index) => {
        bodyHtml += '<tr>';
        bodyHtml += `<td class="row-number">${currentOffset + index + 1}</td>`;
        row.forEach(cell => {
            bodyHtml += `<td>${escapeHtml(cell !== null ? cell : t('table.nullValue'))}</td>`;
        });
        bodyHtml += '</tr>';
    });

    table.innerHTML = `<thead>${headerHtml}</thead><tbody>${bodyHtml}</tbody>`;

    // Row count summary
    const rowCounter = document.createElement('div');
    rowCounter.className = 'row-counter';

    // Use the translation with pluralization
    const plural = displayedRows > 1 ? 's' : '';
    rowCounter.textContent = t('table.rowCounter', {
        displayedRows: displayedRows,
        total: total,
        plural: plural
    });

    // Render all elements in the content area
    tableContent.innerHTML = '';
    tableContent.appendChild(tableActions);
    tableContent.appendChild(table);
    tableContent.appendChild(rowCounter);

    // Pagination button handlers
    const prevButton = tableActions.querySelector('.prev-page');
    const nextButton = tableActions.querySelector('.next-page');

    prevButton.addEventListener('click', () => {
        loadTableData(tableName, Math.max(0, currentOffset - limit), limit);
    });

    nextButton.addEventListener('click', () => {
        loadTableData(tableName, currentOffset + limit, limit);
    });
}

/**
 * Initializes drag-and-drop functionality for rearranging table accordions
 */
export function initDragAndDrop() {
    const container = document.getElementById('business-tables-container');
    window.dragging = false;

    document.querySelectorAll('.table-accordion').forEach(item => {
        item.addEventListener('dragstart', function (e) {
            window.dragging = true;
            this.classList.add('dragging');
            e.dataTransfer.setData('text/plain', this.dataset.table);
        });

        item.addEventListener('dragend', function () {
            this.classList.remove('dragging');
            setTimeout(() => { window.dragging = false; }, 50);
        });
    });

    container.addEventListener('dragover', function (e) {
        e.preventDefault();
        const draggable = document.querySelector('.dragging');
        if (!draggable) return;

        const afterElement = getDragAfterElement(container, e.clientY);
        if (afterElement == null) {
            container.appendChild(draggable);
        } else {
            container.insertBefore(draggable, afterElement);
        }
    });

    container.addEventListener('drop', function (e) {
        e.preventDefault();
        const draggable = document.querySelector('.dragging');
        if (draggable) {
            draggable.classList.remove('dragging');
        }
    });

    /**
     * Determines the element below the cursor for inserting the dragged item
     * @param {HTMLElement} container - The container where elements are dragged
     * @param {number} y - The vertical cursor position
     * @returns {HTMLElement|null} - The closest element to insert after
     */
    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.table-accordion:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
}