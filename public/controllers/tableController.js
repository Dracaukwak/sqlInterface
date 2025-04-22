import { getTables, getTableData } from '../models/tableModel.js';
import { renderBusinessTables, renderTableData, initDragAndDrop } from '../views/tableView.js';

// Gestion de l'onglet Tables Métier
export function initBusinessTables() {
    window.loadBusinessTables = async function() {
        const tablesContainer = document.getElementById('business-tables-container');
        tablesContainer.innerHTML = '<div class="loading">Chargement des tables...</div>';

        try {
            const data = await getTables();
            renderBusinessTables(data.tables);
            initDragAndDrop();
        } catch (error) {
            tablesContainer.innerHTML = `<div class="error">${error.message}</div>`;
        }
    };

    // Exposition explicite de la fonction loadTableData au niveau global
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

 
