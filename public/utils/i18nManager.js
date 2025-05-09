/**
 * i18n Manager - Facade for the global localization service
 * Centralizes all interactions with window.i18n into a cohesive API
 */
import { applyTranslations as applyTranslationsToDOM } from '../controllers/localizationController.js';

/**
 * Initializes the i18n system based on browser preferences and stored settings
 * @param {string} defaultLocale - Default locale if no preference found (defaults to 'en')
 * @returns {Promise<void>} - Promise that resolves when i18n is ready
 */
export async function initialize(defaultLocale = 'en') {
    try {
        // Check if the global i18n service exists
        if (!window.i18n) {
            console.error('Global localization service (window.i18n) not available! Make sure localizationService.js is loaded before i18nManager.js');
            return;
        }
        
        // If already initialized, just return
        if (window.i18n.isInitialized()) {
            return;
        }
        
        // Get browser language as a hint
        const browserLang = navigator.language.split('-')[0];
        // Get stored preference if available
        const storedLang = localStorage.getItem('locale');
        
        // Determine which language to use
        const initialLocale = storedLang || browserLang || defaultLocale;
        
        // Initialize the i18n service
        await window.i18n.init(initialLocale);
        
        // Apply translations to the DOM
        applyTranslationsToDOM();
        
        // Add global event listener for locale changes (only once)
        if (!window.localeChangeListenerSet) {
            window.addEventListener('localeChanged', onLocaleChanged);
            window.localeChangeListenerSet = true;
        }
        
        console.log(`i18n initialized with locale: ${getLocale()}`);
    } catch (error) {
        console.error('Failed to initialize i18n:', error);
    }
}

/**
 * Gère le changement de langue
 * @param {Event} event - L'événement de changement de langue
 */
function onLocaleChanged(event) {
    // Appliquer les traductions au DOM
    applyTranslationsToDOM();
    
    // Déclencher un événement personnalisé pour notifier d'autres composants
    // (comme le titre de l'aventure) qui doivent être mis à jour
    window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { locale: event.detail.locale }
    }));
}

/**
 * Gets text translation for a specific key
 * @param {string} key - Translation key (e.g., 'common.save')
 * @param {Object} params - Parameters for the translation (for placeholders)
 * @returns {string} - Translated text
 */
export function translate(key, params = {}) {
    return window.i18n.t(key, params);
}

/**
 * Gets the current locale code
 * @returns {string} - Current locale code (e.g., 'en', 'fr')
 */
export function getLocale() {
    return window.i18n.getCurrentLocale();
}

/**
 * Sets the application locale
 * @param {string} locale - Locale code to set
 * @returns {Promise<boolean>} - Success status
 */
export function setLocale(locale) {
    return window.i18n.setLocale(locale);
}

/**
 * Sets up the language selector dropdown if it exists in the DOM
 */
export function setupLanguageSelector() {
    const languageSelector = document.getElementById('language-selector');
    if (!languageSelector) return;
    
    // Set initial value of selector to current locale
    languageSelector.value = getLocale();
    
    // Replace element to remove any existing listeners
    const newSelector = languageSelector.cloneNode(true);
    languageSelector.parentNode.replaceChild(newSelector, languageSelector);
    
    // Handle language change events
    newSelector.addEventListener('change', async (event) => {
        const newLocale = event.target.value;
        await setLocale(newLocale);
    });
}

/**
 * Applies translations to the entire DOM
 * This is a convenience method that calls the controller function
 */
export function applyTranslations() {
    applyTranslationsToDOM();
}

export default {
    initialize,
    translate,
    getLocale,
    setLocale,
    setupLanguageSelector,
    applyTranslations
};