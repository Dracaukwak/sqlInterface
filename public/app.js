/**
 * Main application controller
 * Initializes and coordinates all application components
 */
import { initTabs } from './controllers/tabController.js';
import { initQueryExecution } from './controllers/queryController.js';
import { initBusinessTables } from './controllers/tableController.js';
import { initNotes } from './controllers/notesController.js';
import dbService from './services/dbService.js';
import { initSchema } from './controllers/schemaController.js';
import { initContext } from './controllers/contextController.js';
import { initCommon } from './utils/commonInit.js';
import { applyTranslations, t } from './controllers/localizationController.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing app...');

    // Check if we have a selected database in localStorage
    const selectedDb = localStorage.getItem('selectedDb');
    if (!selectedDb) {
        // Redirect to home page if no database is selected
        window.location.href = 'index.html';
        return;
    }

    // Initialize common components (localization, theme, menu)
    await initCommon();

    // Apply translations again to ensure all elements are properly translated
    setTimeout(applyTranslations, 200);

    // Initialize core components: tabs, query handling, and business tables
    initTabs();
    initQueryExecution();
    initBusinessTables();
    initSchema();
    initNotes();
    initContext();

    // Automatically load business tables on page load
    window.loadBusinessTables();
    document.querySelector('.tab[data-tab="business-tables"]').click();

    // Load and display the adventure title in the UI
    loadAdventureTitle();
});

/**
 * Loads and displays the adventure title from the sqlab_info table
 * Also adds content type information
 */
async function loadAdventureTitle() {
    try {
        const titleElement = document.getElementById('database-name');

        // Show loading indicator
        titleElement.textContent = t('app.loading');

        // Get adventure title directly from sqlab_info table
        const adventureTitle = await dbService.getAdventureTitle();

        // Get content type display name
        const contentType = localStorage.getItem('contentType') || 'adventure';
        const contentLabel = contentType === 'exercises'
            ? t('home.exercisesOption')
            : t('home.adventureOption');

        // Update page title and displayed name with content type
        document.title = `${adventureTitle} - ${contentLabel}`;
        titleElement.textContent = `${adventureTitle} - ${contentLabel}`;
    } catch (error) {
        console.error('Error loading adventure title:', error);

        // Fallback text in case of error
        document.getElementById('database-name').textContent = t('database.unknown');
    }
}