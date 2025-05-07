import { getTables, getTableData } from '../models/tableModel.js';
import { renderBusinessTables, renderTableData, initDragAndDrop } from '../views/tableView.js';
import { translate as t } from '../utils/i18nManager.js';
import { showError } from '../utils/paginationUtils.js';
import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_LIMIT, DRAG_END_DELAY } from '../utils/constants.js';

/**
 * Initializes the "Business Tables" tab functionality
 */
export function initBusinessTables() {
    /**
     * Loads all business tables and displays them in the UI
     */
    window.loadBusinessTables = async function () {
        const tablesContainer = document.getElementById('business-tables-container');
        tablesContainer.innerHTML = `<div class="loading">${t('businessTables.loading')}</div>`;

        try {
            // Fetch list of tables and render them
            const data = await getTables();

            // Filter out system tables that start with "sqlab_"
            const filteredTables = data.tables.filter(tableName => !tableName.startsWith('sqlab_'));

            // Render only the filtered tables
            renderBusinessTables(filteredTables);
            initDragAndDrop(); // Enable drag and drop interaction
        } catch (error) {
            showError(error.message, tablesContainer);
        }
    };

    /**
     * Loads and displays a specific table with pagination
     * Exposed globally to be reused during pagination or reopen
     */
    window.loadTableData = async function (tableName, offset = DEFAULT_PAGE_OFFSET, limit = DEFAULT_PAGE_LIMIT) {
        try {
            const data = await getTableData(tableName, offset, limit);
            renderTableData(tableName, data, offset, window.loadTableData);
        } catch (error) {
            const content = document.getElementById(`content-${tableName}`);
            showError(error.message, content);
        }
    };
}