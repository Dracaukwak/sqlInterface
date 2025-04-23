import { initTabs } from './controllers/tabController.js';
import { initQueryExecution } from './controllers/queryController.js';
import { initBusinessTables } from './controllers/tableController.js';
import { getDatabaseInfo, formatDatabaseName } from './models/dbModel.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize core components: tabs, query handling, and business tables
    initTabs();
    initQueryExecution();
    initBusinessTables();

    // Automatically load business tables on page load
    window.loadBusinessTables();
    document.querySelector('.tab[data-tab="business-tables"]').click();

    // Load and display the database name in the UI
    loadDatabaseName();

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
});

/**
 * Loads and displays the formatted database name in the header and page title
 */
async function loadDatabaseName() {
    try {
        const dbInfoElement = document.getElementById('database-name');

        // Fetch database info from the backend
        const dbInfo = await getDatabaseInfo();

        // Format the name (e.g. sqlab_island -> Island)
        const formattedName = formatDatabaseName(dbInfo.name);

        // Update page title and displayed name
        document.title = `SQLab - ${formattedName}`;
        dbInfoElement.textContent = formattedName;
    } catch (error) {
        console.error('Error while loading database name:', error);

        // Fallback text in case of error
        document.getElementById('database-name').textContent = 'Database';
    }
}
