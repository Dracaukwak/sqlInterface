/**
 * Controller for handling adventure context, tasks, and verification
 * Manages the display of episode statements and feedback
 */
import { executeQuery } from '../models/queryModel.js';
import { t } from './localizationController.js';

// Current episode state
let currentEpisode = null;
let currentFormula = null;

/**
 * Initializes the context and check functionality
 */
export function initContext() {
    // Get references to UI elements
    const episodeContainer = document.getElementById('episode-container');
    const checkBtn = document.getElementById('check-btn');
    const controlContainer = document.getElementById('control-container');
    const checkSolutionBtn = document.getElementById('check-solution-btn');
    
    // Initialize the context by attempting to load the first episode
    loadEpisode(null);
    
    // Add event listener for check button (tab icon)
    checkBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent tab click from interfering
        checkSolution();
    });
    
    // Add event listener for check solution button (in control tab)
    if (checkSolutionBtn) {
        checkSolutionBtn.addEventListener('click', () => {
            checkSolution();
        });
    }

    /**
     * Loads an episode by token or the first episode if token is null
     * @param {string|null} token - Episode token or null for first episode
     */
    async function loadEpisode(token) {
        try {
            // Display loading indicator
            episodeContainer.innerHTML = `<p class="loading">${t('context.loading')}</p>`;
            
            let response;
            if (token === null) {
                // Load first episode with initial call
                response = await executeQuery('SELECT decrypt(42)', 0, 10);
            } else {
                // Load next episode with provided token
                response = await executeQuery(`SELECT decrypt(${token})`, 0, 10);
            }
            
            // Check if we have a valid response with task
            if (response.rows?.length > 0 && response.rows[0]?.length > 0) {
                try {
                    // Parse the JSON response
                    const data = response.rows[0][0];
                    const episodeData = typeof data === 'string' ? JSON.parse(data) : data;
                    
                    // Update state
                    if (episodeData.task) {
                        currentEpisode = episodeData.task;
                        currentFormula = episodeData.formula?.code || null;
                        
                        // Display the episode in the container
                        episodeContainer.innerHTML = episodeData.task;
                    }
                    
                    // Display feedback if available
                    if (episodeData.feedback) {
                        controlContainer.innerHTML = episodeData.feedback;
                        // Auto-switch to the check tab to show feedback
                        document.querySelector('.tab[data-tab="control"]').click();
                    }
                } catch (error) {
                    console.error('Error parsing episode data:', error);
                    episodeContainer.innerHTML = `<p class="error">Error parsing episode data: ${error.message}</p>`;
                }
            } else {
                episodeContainer.innerHTML = `<p class="error">${t('context.loadError')}</p>`;
            }
        } catch (error) {
            console.error('Error loading episode:', error);
            episodeContainer.innerHTML = `<p class="error">${error.message}</p>`;
        }
    }

    /**
     * Checks the current solution by executing the query and validating the token
     */
    async function checkSolution() {
        try {
            // Get the current query
            const queryInput = document.getElementById('query-input');
            const query = queryInput.value.trim();
            
            // Make sure we have a query
            if (!query) {
                controlContainer.innerHTML = `<div class="error">${t('query.emptyError')}</div>`;
                return;
            }
            
            // Check if it's a special decrypt query
            if (/^SELECT\s+decrypt\s*\(\s*\d+\s*\)/i.test(query)) {
                // It's already a decrypt query, just execute it directly
                const response = await executeQuery(query, 0, 10);
                
                // If we get a valid response with task/feedback, it was a valid token
                if (response.rows?.length > 0 && response.rows[0]?.length > 0) {
                    try {
                        const data = response.rows[0][0];
                        const episodeData = typeof data === 'string' ? JSON.parse(data) : data;
                        
                        if (episodeData.task || episodeData.feedback) {
                            // Update the state with new episode data
                            loadEpisode(null); // Pass null to handle the already-loaded data
                            return;
                        }
                    } catch (error) {
                        console.error('Error parsing episode data during decrypt:', error);
                    }
                }
                
                // If we got here, the decrypt query didn't return a valid episode
                controlContainer.innerHTML = `<div class="error">Invalid token or decrypt command</div>`;
                return;
            }
            
            // Check if we have a formula for the current episode
            if (!currentFormula) {
                controlContainer.innerHTML = `<div class="error">${t('check.noFormula')}</div>`;
                return;
            }
            
            // Inject the formula into the query if it's not already there
            let enhancedQuery = query;
            if (!query.toLowerCase().includes(currentFormula.toLowerCase())) {
                enhancedQuery = addColumnToSelects(query, currentFormula);
                
                // Transparent formula injection - no UI update
                // queryInput.value = enhancedQuery;
            }
            
            // Execute the enhanced query
            const response = await executeQuery(enhancedQuery, 0, 10);
            
            // Display results in the execution tab first
            const executeBtn = document.getElementById('execute-btn');
            if (executeBtn) {
                executeBtn.click();
            }
            
            // Look for token in results
            if (response.columns && response.rows?.length > 0) {
                // Find the token column index
                const tokenIndex = response.columns.findIndex(col => col.toLowerCase() === 'token');
                
                if (tokenIndex !== -1) {
                    // Get the token value from the first row
                    const token = response.rows[0][tokenIndex];
                    
                    if (token) {
                        // Success - load the next episode with this token
                        loadEpisode(token);
                        return;
                    }
                }
                
                controlContainer.innerHTML = `<div class="error">${t('check.noTokenFound')}</div>`;
            } else {
                controlContainer.innerHTML = `<div class="error">${t('check.noTokenColumn')}</div>`;
            }
        } catch (error) {
            console.error('Error checking solution:', error);
            controlContainer.innerHTML = `<div class="error">${error.message}</div>`;
        }
    }
    
    // Add functions to window so they can be called from other modules
    window.loadEpisode = loadEpisode;
    window.checkSolution = checkSolution;
}