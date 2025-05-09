/**
 * Controller for handling schema display
 */
import dbService from '../services/dbService.js';
import { translate as t } from '../utils/i18nManager.js';
import { showLoading, showInfo, showError } from '../utils/commonUtils.js';

/**
 * Initializes the Schema tab functionality
 */
export function initSchema() {
    // Get the schema container
    const schemaContainer = document.getElementById('schema-container');
    
    // Load schema when the schema tab is clicked
    document.querySelector('.tab[data-tab="schema"]').addEventListener('click', loadSchema);
    
    /**
     * Loads and displays the relational schema
     */
    async function loadSchema() {
        // Show loading message
        showLoading(schemaContainer, t('schema.loading'));
        
        try {
            // Use the unified dbService to get the schema
            const schemaSvg = await dbService.getRelationalSchema();
            
            if (!schemaSvg) {
                showInfo(schemaContainer, t('schema.notAvailable'));
                return;
            }
            
            // Display the SVG directly in the container
            schemaContainer.innerHTML = schemaSvg;
            
            // Adjust SVG to fit the container
            const svg = schemaContainer.querySelector('svg');
            if (svg) {
                svg.style.maxWidth = '100%';
                svg.style.height = 'auto';
                svg.style.display = 'block';
                svg.style.margin = '0 auto';
            }
        } catch (error) {
            console.error('Error loading schema:', error);
            showError(schemaContainer, error.message);
        }
    }
}