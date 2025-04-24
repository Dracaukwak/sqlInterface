import { initTabs } from './controllers/tabController.js';
import { initQueryExecution } from './controllers/queryController.js';
import { initBusinessTables } from './controllers/tableController.js';
import { getAdventureTitle } from './models/dbModel.js';
import { initLocalization } from './controllers/localizationController.js';

// Initialize localization service immediately
window.i18n.init().catch(err => console.error('Failed to initialize localization:', err));

document.addEventListener('DOMContentLoaded', async () => {
    // Make sure localization is initialized first
    try {
        // If initialization hasn't completed yet, await it
        if (!window.i18n.initialized) {
            await window.i18n.initPromise;
        }
        
        // Initialize the UI components that handle localization
        initLocalization();
    } catch (error) {
        console.error('Error initializing localization:', error);
    }
    
    // Initialize core components: tabs, query handling, and business tables
    initTabs();
    initQueryExecution();
    initBusinessTables();

    // Automatically load business tables on page load
    window.loadBusinessTables();
    document.querySelector('.tab[data-tab="business-tables"]').click();

    // Load and display the adventure title in the UI
    loadAdventureTitle();

    // Theme toggle handling
    const themeToggle = document.getElementById('toggle-theme');
    const isDarkTheme = localStorage.getItem('darkTheme') === 'true';

    // Apply stored theme preference
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
        themeToggle.classList.remove('fa-moon');
        themeToggle.classList.add('fa-sun');
    }

    // Toggle dark/light theme and save preference
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');

        // Save user preference
        localStorage.setItem('darkTheme', isDark);

        // Update icon based on theme
        if (isDark) {
            themeToggle.classList.remove('fa-moon');
            themeToggle.classList.add('fa-sun');
        } else {
            themeToggle.classList.remove('fa-sun');
            themeToggle.classList.add('fa-moon');
        }
    });
    
    // Update title when language changes
    window.addEventListener('localeChanged', () => {
        loadAdventureTitle();
    });
});

/**
 * Loads and displays the adventure title from the sqlab_info table
 */
async function loadAdventureTitle() {
    try {
        const titleElement = document.getElementById('database-name');
        
        // Show loading indicator
        titleElement.textContent = window.i18n.t('app.loading');
        
        // Get adventure title directly from sqlab_info table
        const adventureTitle = await getAdventureTitle();
        
        // Update page title and displayed name
        document.title = `${window.i18n.t('app.title')} - ${adventureTitle}`;
        titleElement.textContent = adventureTitle;
    } catch (error) {
        console.error('Error loading adventure title:', error);
        
        // Fallback text in case of error
        document.getElementById('database-name').textContent = window.i18n.t('database.unknown');
    }
}