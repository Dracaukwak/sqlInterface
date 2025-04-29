import { escapeHtml } from '../utils/helpers.js';
import { t } from '../controllers/localizationController.js';
import { renderPaginatedTable } from '../utils/paginationUtils.js';

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
            <div class="table-columns" id="columns-${tableName}">
                <span class="loading-columns">${t('businessTables.loadingColumns') || 'Loading columns...'}</span>
            </div>
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
    const limit = data.limit || 10;

    // Also update the column names in the header when data is loaded
    const columnsElement = document.getElementById(`columns-${tableName}`);
    if (columnsElement && data.columns && data.columns.length > 0) {
        columnsElement.innerHTML = data.columns.map(column =>
            `<span class="column-name">${escapeHtml(column)}</span>`
        ).join(', ');
    }

    // Create table element
    const table = document.createElement('table');
    tableContent.innerHTML = '';
    tableContent.appendChild(table);

    // Use the shared pagination utility to render the table
    renderPaginatedTable(
        data, 
        table, 
        tableContent, 
        (newOffset, newLimit) => loadTableData(tableName, newOffset, newLimit)
    );
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