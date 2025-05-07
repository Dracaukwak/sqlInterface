/**
 * Common initialization functions for both home and app pages
 * Handles shared functionality like theme, language, and menu interactions
 */

import i18nManager from '../utils/i18nManager.js';
import { setupThemeToggle, setupHamburgerMenu } from '../utils/uiUtils.js';

/**
 * Common initialization for all pages
 * Call this at the start of both home.js and app.js
 */
export async function initCommon() {
  try {
    // Ensure i18n is available
    if (!window.i18n) {
      console.error('i18n service not available!');
      return;
    }
    
    // Initialize the i18n system
    await i18nManager.initialize();
    
    // Initialize UI components
    setupThemeToggle();
    setupHamburgerMenu();
    i18nManager.setupLanguageSelector();
    
    console.log('Common initialization completed');
  } catch (error) {
    console.error('Error in common initialization:', error);
  }
}