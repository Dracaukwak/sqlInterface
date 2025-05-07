/**
 * Controller for handling localization in the UI
 * Note: This module is maintained for compatibility with existing code,
 * but all functionality is now delegated to i18nManager.js
 */
import i18nManager from '../utils/i18nManager.js';

/**
 * Initializes language selection and localization functionality
 * This function is maintained for compatibility, use i18nManager.initialize() directly in new code
 */
export function initLocalization() {
    return i18nManager.initialize();
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
 * @deprecated Use import { translate as t } from '../utils/i18nManager.js' directly
 * @param {string} key - Translation key (e.g., 'common.save')
 * @param {Object} params - Parameters for the translation (for placeholders)
 * @returns {string} - Translated string
 */
export function t(key, params = {}) {
    return i18nManager.translate(key, params);
}

/**
 * Gets the current locale code
 * @deprecated Use i18nManager.getLocale() directly
 * @returns {string} - Current locale code (e.g., 'en', 'fr')
 */
export function getCurrentLocale() {
    return i18nManager.getLocale();
}