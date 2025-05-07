/**
 * Home page controller
 * Handles database and content selection, loads content info
 * And implements session saving/restoration
 */
import { initCommon } from './utils/commonInit.js';
import sessionManager from './utils/sessionManager.js';
import { t } from './controllers/localizationController.js';

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Initializing home page...');

  // Initialize common components (localization, theme, menu)
  await initCommon();

  // Elements
  const databaseOptions = document.querySelectorAll('.database-options .option-card');
  const contentOptionsContainers = document.querySelectorAll('.content-options');
  const startButton = document.getElementById('start-button');
  const resumeButton = document.getElementById('resume-button');
  const sessionInfoContainer = document.getElementById('session-info');
  const loadingOverlay = document.querySelector('.loading-overlay');

  // State
  let selectedDb = null;
  let selectedContent = null;
  let contentType = null;
  let tocData = null;
  let savedSessions = loadSavedSessions();

  // Check for saved sessions and update UI
  checkForSavedSessions();

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

        // Check if there's a saved session for this database
        checkResumeAvailability();
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

          // Check if there's a saved session for this specific content
          checkResumeAvailability();
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

    // Disable and hide resume button
    if (resumeButton) {
      resumeButton.classList.remove('active');
    }

    // Hide session info
    if (sessionInfoContainer) {
      sessionInfoContainer.classList.remove('visible');
    }
  }

  /**
   * Loads table of contents data for the selected database
   * @param {string} dbName - Selected database name
   */
  async function loadTocData(dbName) {
    try {
      // Set up request to temporarily use the selected database
      const response = await fetch('/get-toc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ database: dbName })
      });

      if (!response.ok) {
        throw new Error(`Failed to load TOC data: ${response.status}`);
      }

      // Parse response
      const data = await response.json();
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

      // Set database for the session
      await setDatabase(selectedDb);

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

  // Resume button listener (if it exists)
  if (resumeButton) {
    resumeButton.addEventListener('click', async function () {
      if (!selectedDb || !selectedContent) {
        return; // Button should be disabled anyway
      }

      try {
        // Show loading overlay
        loadingOverlay.style.display = 'flex';

        // Get saved session data
        const session = sessionManager.getSession(selectedDb, selectedContent);

        if (!session) {
          throw new Error('No saved session found');
        }

        // Restore the session
        sessionManager.restoreSession(session);

        // Set database for the session
        await setDatabase(selectedDb);

        // Redirect to main interface
        window.location.href = 'app.html';
      } catch (error) {
        console.error('Error resuming session:', error);
        // Hide loading overlay
        loadingOverlay.style.display = 'none';
        // Show error message
        alert(`Error resuming session: ${error.message}`);
      }
    });

  }

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
      if (contentSection && contentSection.open_tasks && contentSection.open_tasks.length > 0) {
        // Return first entry token from open_tasks
        return contentSection.open_tasks[0].entry_token;
      }
    } catch (error) {
      console.error('Error getting entry token:', error);
    }

    return null;
  }

  /**
   * Sets the database for the session
   * @param {string} dbName - Database name to set
   * @returns {Promise<void>}
   */
  async function setDatabase(dbName) {
    try {
      const response = await fetch('/set-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ database: dbName })
      });

      if (!response.ok) {
        throw new Error(`Failed to set database: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error setting database:', error);
      throw error;
    }
  }

  /**
   * Checks for saved sessions and updates UI accordingly
   */
  function checkForSavedSessions() {
    // If we have any saved sessions, pre-select the database and content
    if (Object.keys(savedSessions).length > 0) {
      const lastSession = getMostRecentSession();
      if (lastSession) {
        // Find and select the database option
        const dbOption = document.querySelector(`.option-card[data-db="${lastSession.database}"]`);
        if (dbOption) {
          dbOption.click(); // This will trigger the database selection logic

          // After loading the content options, select the content option
          setTimeout(() => {
            const contentOption = document.querySelector(`.content-options[data-db="${lastSession.database}"] .option-card[data-content="${lastSession.content}"]`);
            if (contentOption) {
              contentOption.click(); // This will trigger the content selection logic
            }
          }, 500); // Small delay to ensure content options are loaded
        }
      }
    }
  }

  /**
   * Gets the most recent session from saved sessions
   * @returns {Object|null} The most recent session data or null if none found
   */
  function getMostRecentSession() {
    return sessionManager.getMostRecentSession();
  }

  /**
   * Loads saved sessions from localStorage
   * @returns {Object} An object containing all saved sessions
   */
  function loadSavedSessions() {
    return sessionManager.getAllSessions();
  }

  /**
   * Checks if a resume is available for the current selection and updates UI
   */
  function checkResumeAvailability() {
    if (!selectedDb || !selectedContent || !resumeButton || !sessionInfoContainer) {
      return;
    }

    const sessionKey = `${selectedDb}_${selectedContent}`;
    const sessionData = savedSessions[sessionKey];

    if (sessionData && sessionData.episodeNumber) {
      // Enable resume button
      resumeButton.classList.add('active');

      // Update and show session info
      const dbLabel = document.querySelector(`.option-card[data-db="${selectedDb}"] .option-title`).textContent;
      const contentLabel = contentType === 'exercises' ?
        t('home.exercisesOption') :
        t('home.adventureOption');
      // Format date
      const lastAccessDate = new Date(sessionData.timestamp);
      const formattedDate = lastAccessDate.toLocaleString();

      // Update session info
      document.getElementById('session-database').textContent = dbLabel;
      document.getElementById('session-content').textContent = contentLabel;
      document.getElementById('session-episode').textContent = sessionData.episodeNumber;
      document.getElementById('session-date').textContent = formattedDate;

      // Show session info
      sessionInfoContainer.classList.add('visible');
    } else {
      // Disable resume button
      resumeButton.classList.remove('active');

      // Hide session info
      sessionInfoContainer.classList.remove('visible');
    }
  }
});