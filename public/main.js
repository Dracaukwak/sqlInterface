import { initTabs } from './controllers/tabController.js';
import { initQueryExecution } from './controllers/queryController.js';
import { initBusinessTables } from './controllers/tableController.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialisation des composants
    initTabs();
    initQueryExecution();
    initBusinessTables();

    // Chargement automatique des tables métier au démarrage
    window.loadBusinessTables();
    document.querySelector('.tab[data-tab="business-tables"]').click();

    document.getElementById('toggle-theme').addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
    });

});
