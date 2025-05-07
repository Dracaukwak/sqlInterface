/**
 * Controller for handling localization in the UI
 * Manages applying translations to DOM elements
 */
import i18nManager from '../utils/i18nManager.js';

/**
 * Initializes language selection and localization functionality
 * Sets up event listeners and applies initial translations
 */
export function initLocalization() {
    // Initialize i18n system
    i18nManager.initialize();
    
    // Setup language selector UI
    i18nManager.setupLanguageSelector();
    
    // Apply initial translations
    applyTranslations();
}

/**
 * Applies translations to all elements with data-i18n attributes
 * Updates text content, placeholders, and title attributes based on translation keys
 */
export function applyTranslations() {
    // Find all elements with data-i18n attribute (for text content)
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        
        if (key) {
            element.textContent = i18nManager.translate(key);
        }
    });
    
    // Find all elements with data-i18n-placeholder attribute (for input placeholders)
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        
        if (key) {
            element.placeholder = i18nManager.translate(key);
        }
    });
    
    // Find all elements with data-i18n-title attribute (for tooltips)
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        
        if (key) {
            element.title = i18nManager.translate(key);
        }
    });
    
    // Update HTML document title if needed
    const titleElement = document.querySelector('title[data-i18n]');
    if (titleElement) {
        const key = titleElement.getAttribute('data-i18n');
        if (key) {
            document.title = i18nManager.translate(key);
        }
    }
}

/**
 * Translates a string using the i18n service
 * Helper function to use in JavaScript files
 * 
 * @param {string} key - Translation key (e.g., 'common.save')
 * @param {Object} params - Parameters for the translation (for placeholders)
 * @returns {string} - Translated string
 */
export function t(key, params = {}) {
    return i18nManager.translate(key, params);
}

/**
 * Gets the current locale code
 * @returns {string} - Current locale code (e.g., 'en', 'fr')
 */
export function getCurrentLocale() {
    return i18nManager.getLocale();
}