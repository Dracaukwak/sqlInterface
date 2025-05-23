/**
 * Controller for managing table interactions
 */
import dbService from '../services/dbService.js';
import { renderBusinessTables, renderTableData, initDragAndDrop } from '../views/tableView.js';
import { showError } from '../utils/commonUtils.js';
import { DEFAULT_PAGE_OFFSET, DEFAULT_PAGE_LIMIT } from '../utils/constants.js';

/**
 * Initializes the "Business Tables" tab functionality
 */
export function initBusinessTables() {
  /**
   * Loads all business tables and displays them in the UI
   */
  window.loadBusinessTables = async function () {
    const tablesContainer = document.getElementById('business-tables-container');
    
    try {
      // Use the unified service to fetch tables
      const tables = await dbService.getTables();
      
      // Render the tables
      renderBusinessTables(tables);
      initDragAndDrop(); // Enable drag and drop interaction
    } catch (error) {
      showError(tablesContainer, error.message);
    }
  };

  /**
   * Loads and displays a specific table with pagination
   * Exposed globally to be reused during pagination or reopen
   */
  window.loadTableData = async function (tableName, offset = DEFAULT_PAGE_OFFSET, limit = DEFAULT_PAGE_LIMIT) {
    try {
      // Use the unified service to fetch table data
      const data = await dbService.getTableData(tableName, offset, limit);
      renderTableData(tableName, data, offset, window.loadTableData);
    } catch (error) {
      const content = document.getElementById(`content-${tableName}`);
      showError(content, error.message);
    }
  };
}