/**
 * Common initialization functions for both home and app pages
 * Handles shared functionality like theme, language, and menu interactions
 */

// Import translation function from localizationController
import { applyTranslations } from '../controllers/localizationController.js';

/**
 * Initializes localization for the page
 * @returns {Promise<void>} Promise that resolves when localization is ready
 */
export async function initLocalization() {
  try {
    // Explicitly initialize i18n if it hasn't been already
    if (!window.i18n.isInitialized()) {
      console.log('Initializing i18n service');
      
      // Get browser language as a hint for initialization
      const browserLang = navigator.language.split('-')[0];
      await window.i18n.init(browserLang);
    }
    
    // Ensure initPromise is completed before proceeding
    if (window.i18n.initPromise) {
      await window.i18n.initPromise;
    }
    
    // Apply translations to all elements with data-i18n attributes
    applyTranslations();
    
    // Set up language selector if it exists
    setupLanguageSelector();
    
    console.log('Localization initialized with locale:', window.i18n.getCurrentLocale());
  } catch (error) {
    console.error('Error initializing localization:', error);
  }
}

/**
 * Sets up the language selector dropdown if it exists
 */
function setupLanguageSelector() {
  const languageSelector = document.getElementById('language-selector');
  if (!languageSelector) return;
  
  // Set initial value of selector to current locale
  languageSelector.value = window.i18n.getCurrentLocale();
  
  // Remove existing event listeners and recreate them
  // This prevents duplication of event listeners
  const newSelector = languageSelector.cloneNode(true);
  languageSelector.parentNode.replaceChild(newSelector, languageSelector);
  
  // Handle language change from the selector
  newSelector.addEventListener('change', async (event) => {
    const newLocale = event.target.value;
    await window.i18n.setLocale(newLocale);
  });
}

/**
 * Initializes theme toggle functionality
 */
export function initThemeToggle() {
  const themeToggle = document.getElementById('toggle-theme');
  if (!themeToggle) return;
  
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
}

/**
 * Initializes hamburger menu functionality
 */
export function initHamburgerMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const dropdownMenu = document.querySelector('.dropdown-menu');
  
  if (!menuToggle || !dropdownMenu) return;
  
  // Toggle dropdown menu visibility on hamburger icon click
  menuToggle.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent immediate closing
    dropdownMenu.classList.toggle('active');
    
    // Optional icon rotation for visual feedback
    menuToggle.style.transform = dropdownMenu.classList.contains('active')
      ? 'rotate(90deg)'
      : 'rotate(0)';
  });
  
  // Close the menu when clicking outside
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.hamburger-menu') && dropdownMenu.classList.contains('active')) {
      dropdownMenu.classList.remove('active');
      menuToggle.style.transform = 'rotate(0)';
    }
  });
}

/**
 * Common initialization for all pages
 * Call this at the start of both home.js and app.js
 */
export async function initCommon() {
  // Ensure initPromise exists before continuing
  if (!window.i18n || !window.i18n.initPromise) {
    // If i18n is not loaded yet, wait a bit and retry
    console.log('Waiting for i18n to be available...');
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (!window.i18n) {
      console.error('i18n service not available after waiting!');
      return;
    }
  }

  await initLocalization();
  initThemeToggle();
  initHamburgerMenu();
  
  // Listen for locale changes to update translations - ensure just once
  if (!window.localeChangeListenerSet) {
    window.addEventListener('localeChanged', applyTranslations);
    window.localeChangeListenerSet = true;
  }
}