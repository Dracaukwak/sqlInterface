import { getTables, getTableData } from '../models/tableModel.js';
import { renderBusinessTables, renderTableData, initDragAndDrop } from '../views/tableView.js';
import { t } from '../controllers/localizationController.js';

/**
 * Initializes the "Business Tables" tab functionality
 */
export function initBusinessTables() {
    /**
     * Loads all business tables and displays them in the UI
     */
    window.loadBusinessTables = async function() {
        const tablesContainer = document.getElementById('business-tables-container');
        tablesContainer.innerHTML = `<div class="loading">${t('businessTables.loading')}</div>`;

        try {
            // Fetch list of tables and render them
            const data = await getTables();
            renderBusinessTables(data.tables);
            initDragAndDrop(); // Enable drag and drop interaction
        } catch (error) {
            tablesContainer.innerHTML = `<div class="error">${error.message}</div>`;
        }
    };

    /**
     * Loads and displays a specific table with pagination
     * Exposed globally to be reused during pagination or reopen
     */
    window.loadTableData = async function(tableName, offset = 0, limit = 10) {
        try {
            const data = await getTableData(tableName, offset, limit);
            renderTableData(tableName, data, offset, window.loadTableData);
        } catch (error) {
            const content = document.getElementById(`content-${tableName}`);
            content.innerHTML = `<div class="error">${error.message}</div>`;
        }
    };
}