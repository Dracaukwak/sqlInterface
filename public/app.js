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
import { translate as t } from './utils/i18nManager.js';

// Variables globales pour stocker le titre de l'aventure
let currentAdventureTitle = '';
let currentContentType = '';

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
    
    // Ajouter un écouteur d'événement pour le changement de langue
    window.addEventListener('localeChanged', updateAdventureTitle);
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

        // Get adventure title using the unified service
        const adventureTitle = await dbService.getAdventureTitle();
        currentAdventureTitle = adventureTitle;

        // Get content type display name
        currentContentType = localStorage.getItem('contentType') || 'adventure';
        const contentLabel = currentContentType === 'exercises'
            ? t('home.exercisesOption')
            : t('home.adventureOption');

        // Update page title and displayed name with content type
        document.title = `${adventureTitle} - ${contentLabel}`;
        titleElement.textContent = `${adventureTitle} - ${contentLabel}`;
        
        // Retirer l'attribut data-i18n pour éviter qu'il soit modifié lors du changement de langue
        titleElement.removeAttribute('data-i18n');
    } catch (error) {
        console.error('Error loading adventure title:', error);

        // Fallback text in case of error
        document.getElementById('database-name').textContent = t('database.unknown');
    }
}

/**
 * Met à jour le titre de l'aventure après un changement de langue
 */
function updateAdventureTitle() {
    if (currentAdventureTitle) {
        const titleElement = document.getElementById('database-name');
        const contentLabel = currentContentType === 'exercises'
            ? t('home.exercisesOption')
            : t('home.adventureOption');
            
        document.title = `${currentAdventureTitle} - ${contentLabel}`;
        titleElement.textContent = `${currentAdventureTitle} - ${contentLabel}`;
    }
}