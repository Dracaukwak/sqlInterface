/**
 * Controller for handling adventure context, tasks, and verification
 * Also implements progress saving functionality
 */
import { executeQuery } from '../models/queryModel.js';
import { t } from './localizationController.js';

// Current episode state
let currentEpisode = null;
let currentFormula = null;
let currentEpisodeNumber = null;
let currentEpisodeToken = null;

// Utility functions
const showControlError = (controlContainer, message) => {
    controlContainer.innerHTML = `<div class="error">${message}</div>`;
    document.querySelector('.tab[data-tab="control"]').click();
    if (currentEpisode) {
        document.getElementById('episode-container').innerHTML = currentEpisode;
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
            episodeContainer.innerHTML = `<p class="loading">${t('context.loading')}</p>`;
            
            // Check if we have a current episode token first (for resuming a session)
            const resumeToken = localStorage.getItem('currentEpisodeToken');
            
            if (resumeToken) {
                // Resume from saved token
                console.log('Resuming from saved token:', resumeToken);
                const response = await executeQuery(`SELECT decrypt(${resumeToken})`, 0, 10);
                processEpisodeResponse(response);
                return;
            }
            
            // Try to get entry token from localStorage
            const entryToken = localStorage.getItem('entryToken');
            
            if (entryToken) {
                // Use stored entry token
                console.log('Starting with entry token:', entryToken);
                const response = await executeQuery(`SELECT decrypt(${entryToken})`, 0, 10);
                processEpisodeResponse(response);
            } else {
                // Fallback to default (42)
                console.log('Using default token: 42');
                const response = await executeQuery('SELECT decrypt(42)', 0, 10);
                processEpisodeResponse(response);
            }
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
            
            // Save the token for resume functionality
            currentEpisodeToken = token;
            localStorage.setItem('currentEpisodeToken', token);
            
            // Execute decrypt query
            const response = await executeQuery(`SELECT decrypt(${token})`, 0, 10);
            processEpisodeResponse(response);
            
            // Save the session after loading new episode
            saveSessionState();
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
        saveSessionState();
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
    
    /**
     * Saves the current session state to localStorage
     */
    function saveSessionState() {
        if (!currentEpisodeNumber || !currentEpisodeToken) {
            return; // Don't save if we don't have an episode
        }
        
        const selectedDb = localStorage.getItem('selectedDb');
        const selectedContent = localStorage.getItem('selectedContent');
        const contentType = localStorage.getItem('contentType');
        const entryToken = localStorage.getItem('entryToken');
        
        if (!selectedDb || !selectedContent) {
            return; // Don't save if we don't have db/content selection
        }
        
        // Create session key
        const sessionKey = `${selectedDb}_${selectedContent}`;
        
        // Load existing sessions
        let sessions = {};
        try {
            const savedSessionsStr = localStorage.getItem('sqlabSessions');
            if (savedSessionsStr) {
                sessions = JSON.parse(savedSessionsStr);
            }
        } catch (e) {
            console.error('Error loading saved sessions:', e);
        }
        
        // Update or add session
        sessions[sessionKey] = {
            database: selectedDb,
            content: selectedContent,
            contentType: contentType,
            entryToken: entryToken,
            currentToken: currentEpisodeToken,
            episodeNumber: currentEpisodeNumber,
            timestamp: Date.now()
        };
        
        // Save back to localStorage
        localStorage.setItem('sqlabSessions', JSON.stringify(sessions));
        console.log('Session saved:', sessions[sessionKey]);
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