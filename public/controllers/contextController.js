/**
 * Controller for handling adventure context, tasks, and verification
 */
import { executeQuery } from '../models/queryModel.js';
import { t } from './localizationController.js';

// Current episode state
let currentEpisode = null;
let currentFormula = null;
let currentEpisodeNumber = null;

// Utility functions
const showControlError = (controlContainer, message) => {
    controlContainer.innerHTML = `<div class="error">${message}</div>`;
    document.querySelector('.tab[data-tab="control"]').click();
    if (currentEpisode) {
        episodeContainer.innerHTML = currentEpisode;
    }
};

const goToControlTab = () => document.querySelector('.tab[data-tab="control"]').click();

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
    
    // Start with first episode
    loadInitialEpisode();
    
    /**
     * Initial load of the first episode
     */
    async function loadInitialEpisode() {
        try {
            episodeContainer.innerHTML = `<p class="loading">${t('context.loading')}</p>`;
            const response = await executeQuery('SELECT decrypt(42)', 0, 10);
            processEpisodeResponse(response);
        } catch (error) {
            console.error('Error loading initial episode:', error);
            episodeContainer.innerHTML = `<p class="error">${error.message}</p>`;
        }
    }

    /**
     * Loads the next episode using the provided token
     */
    async function loadNextEpisode(token) {
        try {
            episodeContainer.innerHTML = `<p class="loading">${t('context.loading')}</p>`;
            const response = await executeQuery(`SELECT decrypt(${token})`, 0, 10);
            processEpisodeResponse(response);
        } catch (error) {
            console.error('Error loading next episode:', error);
            episodeContainer.innerHTML = `<p class="error">${error.message}</p>`;
        }
    }

    /**
     * Processes the response from a decrypt query
     */
    function processEpisodeResponse(response) {
        if (!response.rows?.length || !response.rows[0]?.length) {
            episodeContainer.innerHTML = `<p class="error">${t('context.loadError')}</p>`;
            return;
        }
        
        try {
            const data = response.rows[0][0];
            let episodeData;
            if (typeof data === 'string') {
                episodeData = JSON.parse(data);
            } else {
                episodeData = data;
            }
            handleEpisodeData(episodeData);
        } catch (error) {
            console.error('Error parsing episode data:', error);
            episodeContainer.innerHTML = `<p class="error">Error parsing episode data: ${error.message}</p>`;
        }
    }

    /**
     * Handles different types of episode data responses
     */
    function handleEpisodeData(episodeData) {
        // First determine if this is a hint
        const isHint = episodeData.feedback && !episodeData.task && 
                      episodeData.feedback.includes('<div class=\'hint\'>');
        
        if (isHint) {
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
            const match = episodeData.task.match(/<div class='task_number'>(\d+)<\/div>/);
            if (match && match[1]) {
                currentEpisodeNumber = parseInt(match[1]);
            }
            
            episodeContainer.innerHTML = episodeData.task;
        }
        
        // Display feedback if available
        if (episodeData.feedback) {
            controlContainer.innerHTML = episodeData.feedback;
            goToControlTab();
        }
    }

    /**
     * Displays a hint for the current query
     */
    async function displayHintForQuery(query) {
        try {
            const hashResponse = await executeQuery(`SELECT decrypt(hash(${JSON.stringify(query)}))`, 0, 10);
            
            if (hashResponse.rows?.length > 0 && hashResponse.rows[0]?.length > 0) {
                const hintData = hashResponse.rows[0][0];
                
                try {
                    let hintObj;
                    if (typeof hintData === 'string') {
                        hintObj = JSON.parse(hintData);
                    } else {
                        hintObj = hintData;
                    }
                    
                    if (hintObj.feedback) {
                        handleEpisodeData(hintObj);
                        return true;
                    }
                } catch (e) {
                    showControlError(controlContainer, hintData);
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Error fetching hint:', error);
            return false;
        }
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
                processEpisodeResponse(response);
                return;
            }
            
            // Validate formula exists
            if (!currentFormula) {
                showControlError(controlContainer, t('check.noFormula'));
                return;
            }
            
            // Execute query with formula
            let enhancedQuery = query;
            if (!query.toLowerCase().includes(currentFormula.toLowerCase())) {
                enhancedQuery = addColumnToSelects(query, currentFormula);
            }
            
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
                const hintFound = await displayHintForQuery(query);
                if (!hintFound) {
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
    
    // Export functions to window
    window.loadEpisode = loadNextEpisode;
    window.checkSolution = checkSolution;
}