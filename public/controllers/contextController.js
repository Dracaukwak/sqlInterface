/**
 * Controller for handling adventure context, tasks, and verification
 * Connects episode model and UI interactions
 */
import { executeQuery } from '../models/queryModel.js';
import {
    loadEpisodeByToken,
    processEpisodeResponse,
    isHint,
    extractEpisodeNumber,
    getHintForQuery,
    enhanceQueryWithFormula
} from '../models/episodeModel.js';
import sessionManager from '../utils/sessionManager.js';
import { showError, showLoading, activateTab } from '../utils/uiUtils.js';
import { translate as t } from '../utils/i18nManager.js';


// Current episode state
let currentEpisode = null;
let currentFormula = null;
let currentEpisodeNumber = null;
let currentEpisodeToken = null;

// UI utility functions
const showControlError = (controlContainer, message) => {
    showError(controlContainer, message);
    activateTab('control');
    if (currentEpisode) {
        document.getElementById('episode-container').innerHTML = currentEpisode;
    }
};

const goToControlTab = () => activateTab('control');
/**
 * Initializes the context and check functionality
 */
export function initContext() {
    // Get references to UI elements
    const episodeContainer = document.getElementById('episode-container');
    const controlContainer = document.getElementById('control-container');

    // Initialize event listeners
    document.getElementById('check-btn').addEventListener('click', e => {
        e.stopPropagation();
        checkSolution();
    });

    const checkSolutionBtn = document.getElementById('check-solution-btn');
    if (checkSolutionBtn) {
        checkSolutionBtn.addEventListener('click', checkSolution);
    }

    // Add home button event listener
    document.getElementById('home-button').addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    // Try to restore session state
    restoreSessionState();

    // Start with the entry episode stored in localStorage or fallback to default
    loadInitialEpisode();

    /**
     * Initial load of the first episode
     */
    async function loadInitialEpisode() {
        try {
            showLoading(episodeContainer, t('context.loading'));

            // Check if we have a current episode token first (for resuming a session)
            const resumeToken = localStorage.getItem('currentEpisodeToken');

            if (resumeToken) {
                // Resume from saved token
                console.log('Resuming from saved token:', resumeToken);
                await loadNextEpisode(resumeToken);
                return;
            }

            // Try to get entry token from localStorage
            const entryToken = localStorage.getItem('entryToken');

            if (entryToken) {
                // Use stored entry token
                console.log('Starting with entry token:', entryToken);
                await loadNextEpisode(entryToken);
            } else {
                // Fallback to default (42)
                console.log('Using default token: 42');
                await loadNextEpisode('42');
            }
        } catch (error) {
            console.error('Error loading initial episode:', error);
            showError(episodeContainer, error.message);
        }
    }


    /**
     * Loads the next episode using the provided token
     */
    async function loadNextEpisode(token) {
        try {
            showLoading(episodeContainer, t('context.loading'));

            // Save the token for resume functionality
            currentEpisodeToken = token;
            localStorage.setItem('currentEpisodeToken', token);

            // Load episode data using the model
            const episodeData = await loadEpisodeByToken(token);
            handleEpisodeData(episodeData);

            // Save the session after loading new episode
            sessionManager.saveCurrentSessionState();
        } catch (error) {
            console.error('Error loading next episode:', error);
            showError(episodeContainer, error.message);
        }
    }

    /**
     * Handles different types of episode data responses
     */
    function handleEpisodeData(episodeData) {
        // First determine if this is a hint
        if (isHint(episodeData)) {
            // Display hint without changing episode
            controlContainer.innerHTML = episodeData.feedback;
            goToControlTab();
            if (currentEpisode) {
                episodeContainer.innerHTML = currentEpisode;
            }
            return;
        }

        // Update formula if provided
        if (episodeData.formula?.code) {
            currentFormula = episodeData.formula.code;
        }

        // Update episode if provided
        if (episodeData.task) {
            currentEpisode = episodeData.task;

            // Extract episode number if available
            const extractedNumber = extractEpisodeNumber(episodeData.task);
            if (extractedNumber) {
                currentEpisodeNumber = extractedNumber;
                // Save to localStorage for session resuming
                localStorage.setItem('currentEpisodeNumber', currentEpisodeNumber);
            }

            episodeContainer.innerHTML = episodeData.task;
        }

        // Display feedback if available
        if (episodeData.feedback) {
            controlContainer.innerHTML = episodeData.feedback;
            goToControlTab();
        }

        // Save session state after processing episode data
        sessionManager.saveCurrentSessionState();
    }

    /**
     * Checks the current solution
     */
    async function checkSolution() {
        try {
            // Get current query
            const queryInput = document.getElementById('query-input');
            const query = queryInput.value.trim();

            if (!query) {
                showControlError(controlContainer, t('query.emptyError'));
                return;
            }

            // Check for special decrypt query
            if (/^SELECT\s+decrypt\s*\(\s*\d+\s*\)/i.test(query)) {
                const response = await executeQuery(query, 0, 10);
                const episodeData = await processEpisodeResponse(response);
                handleEpisodeData(episodeData);
                return;
            }

            // Validate formula exists
            if (!currentFormula) {
                showControlError(controlContainer, t('check.noFormula'));
                return;
            }

            // Enhance query with formula if needed
            const enhancedQuery = enhanceQueryWithFormula(query, currentFormula);

            // Execute the query
            const response = await executeQuery(enhancedQuery, 0, 10);

            // Show results in execution tab
            const executeBtn = document.getElementById('execute-btn');
            if (executeBtn) {
                executeBtn.click();
            }

            // Check for token in results
            if (response.columns && response.rows?.length > 0) {
                const tokenIndex = response.columns.findIndex(col => col.toLowerCase() === 'token');

                if (tokenIndex !== -1) {
                    const token = response.rows[0][tokenIndex];
                    if (token) {
                        loadNextEpisode(token);
                        return;
                    }
                }

                // No token found, try to get hint
                const hintData = await getHintForQuery(query);
                if (hintData && hintData.feedback) {
                    handleEpisodeData(hintData);
                } else {
                    showControlError(controlContainer, t('check.noTokenFound'));
                }
            } else {
                showControlError(controlContainer, t('check.noTokenColumn'));
            }
        } catch (error) {
            console.error('Error checking solution:', error);
            showControlError(controlContainer, error.message);
        }
    }

    /**
     * Restores session state from localStorage
     */
    function restoreSessionState() {
        // Try to restore current episode token
        const savedToken = localStorage.getItem('currentEpisodeToken');
        if (savedToken) {
            currentEpisodeToken = savedToken;
        }

        // Try to restore current episode number
        const savedEpisodeNumber = localStorage.getItem('currentEpisodeNumber');
        if (savedEpisodeNumber) {
            currentEpisodeNumber = parseInt(savedEpisodeNumber);
        }
    }

    // Export functions to window
    window.loadEpisode = loadNextEpisode;
    window.checkSolution = checkSolution;
}