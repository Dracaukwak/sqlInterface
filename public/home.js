/**
 * Home page controller
 * Handles database and content selection
 */
import { initCommon } from './utils/commonInit.js';
import { translate as t } from './utils/i18nManager.js';
import dbService from './services/dbService.js';

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Initializing home page...');

  // Initialize common components (localization, theme, menu)
  await initCommon();

  // Elements
  const databaseOptions = document.querySelectorAll('.database-options .option-card');
  const contentOptionsContainers = document.querySelectorAll('.content-options');
  const startButton = document.getElementById('start-button');
  const loadingOverlay = document.querySelector('.loading-overlay');

  // State
  let selectedDb = null;
  let selectedContent = null;
  let contentType = null;
  let tocData = null;

  // Event listeners for database selection
  databaseOptions.forEach(option => {
    option.addEventListener('click', async function () {
      // Remove selected class from all options
      databaseOptions.forEach(opt => opt.classList.remove('selected'));

      // Add selected class to clicked option
      this.classList.add('selected');

      // Reset content selection
      resetContentSelection();

      // Store selected database
      selectedDb = this.getAttribute('data-db');

      // Show corresponding content options
      showContentOptions(selectedDb);

      try {
        // Load TOC data for selected database
        await loadTocData(selectedDb);
      } catch (error) {
        console.error('Error loading TOC data:', error);
      }
    });
  });

  /**
   * Shows content options for the selected database
   * @param {string} dbName - Selected database name
   */
  function showContentOptions(dbName) {
    // Hide all content options first
    contentOptionsContainers.forEach(container => {
      container.classList.remove('visible');
    });

    // Show content options for selected database
    const targetContainer = document.querySelector(`.content-options[data-db="${dbName}"]`);
    if (targetContainer) {
      targetContainer.classList.add('visible');

      // Add event listeners to content options
      const contentOptions = targetContainer.querySelectorAll('.option-card');
      contentOptions.forEach(option => {
        option.addEventListener('click', function () {
          // Remove selected class from all options
          contentOptions.forEach(opt => opt.classList.remove('selected'));

          // Add selected class to clicked option
          this.classList.add('selected');

          // Store selected content and kind
          selectedContent = this.getAttribute('data-content');
          contentType = this.getAttribute('data-kind');

          // Enable start button
          startButton.classList.add('active');
        });
      });
    }
  }

  /**
   * Resets content selection state
   */
  function resetContentSelection() {
    // Reset content selection
    selectedContent = null;
    contentType = null;

    // Remove selected class from all content options
    document.querySelectorAll('.content-options .option-card').forEach(opt => {
      opt.classList.remove('selected');
    });

    // Disable start button
    startButton.classList.remove('active');
  }

  /**
   * Loads table of contents data for the selected database
   * @param {string} dbName - Selected database name
   */
  async function loadTocData(dbName) {
    try {
      // Get TOC data using the unified service
      const data = await dbService.getTocData(dbName);
      tocData = data.toc;
      console.log('TOC data loaded:', tocData);
    } catch (error) {
      console.error('Error loading TOC data:', error);
      throw error;
    }
  }

  // Start button listener
  startButton.addEventListener('click', async function () {
    if (!selectedDb || !selectedContent) {
      return; // Button should be disabled anyway
    }

    try {
      // Show loading overlay
      loadingOverlay.style.display = 'flex';

      // Save selections to localStorage
      localStorage.setItem('selectedDb', selectedDb);
      localStorage.setItem('selectedContent', selectedContent);
      localStorage.setItem('contentType', contentType);

      // Get entry token for selected content
      const entryToken = getEntryToken();
      if (entryToken) {
        localStorage.setItem('entryToken', entryToken);
        // Clear any previous episode data
        localStorage.removeItem('currentEpisodeToken');
        localStorage.removeItem('currentEpisodeNumber');
      }

      // Set database for the session using unified service
      await dbService.setDatabase(selectedDb);

      // Redirect to main interface
      window.location.href = 'app.html';
    } catch (error) {
      console.error('Error starting application:', error);
      // Hide loading overlay
      loadingOverlay.style.display = 'none';
      // Show error message
      alert(`Error starting application: ${error.message}`);
    }
  });

  /**
   * Gets the entry token for the selected content
   * @returns {string} Entry token or null if not found
   */
  function getEntryToken() {
    if (!tocData || !selectedContent) {
      return null;
    }

    try {
      const contentSection = tocData[selectedContent];
      if (contentSection && contentSection.tasks && contentSection.tasks.length > 0) {
        // Return first entry token from tasks
        return contentSection.tasks[0].access;
      }
    } catch (error) {
      console.error('Error getting entry token:', error);
    }

    return null;
  }
});