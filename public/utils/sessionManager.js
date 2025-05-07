/**
 * Session manager module that centralizes all session-related operations
 * Handles saving, retrieving, and managing user sessions across the application
 */

/**
 * Saves a session with current state information
 * @param {string} database - Selected database name
 * @param {string} content - Selected content identifier
 * @param {string} contentType - Type of content (adventure/exercises)
 * @param {string|number} episodeNumber - Current episode number
 * @param {string} token - Current episode token
 * @param {string} entryToken - Initial entry token for the content
 */
function saveSession(database, content, contentType, episodeNumber, token, entryToken) {
    if (!database || !content) {
        return; // Don't save incomplete session data
    }

    // Create session key
    const sessionKey = `${database}_${content}`;
    
    // Get all existing sessions
    const sessions = getAllSessions();
    
    // Update or add the session
    sessions[sessionKey] = {
        database: database,
        content: content, 
        contentType: contentType,
        entryToken: entryToken,
        currentToken: token,
        episodeNumber: episodeNumber,
        timestamp: Date.now()
    };
    
    // Save to localStorage
    localStorage.setItem('sqlabSessions', JSON.stringify(sessions));
    
    // Also update current session variables for immediate use
    localStorage.setItem('currentEpisodeToken', token);
    localStorage.setItem('currentEpisodeNumber', episodeNumber);
    
    console.log('Session saved:', sessions[sessionKey]);
}

/**
 * Retrieves a specific session by database and content
 * @param {string} database - Database name
 * @param {string} content - Content identifier
 * @returns {Object|null} - Session data or null if not found
 */
function getSession(database, content) {
    if (!database || !content) return null;
    
    const sessionKey = `${database}_${content}`;
    const sessions = getAllSessions();
    
    return sessions[sessionKey] || null;
}

/**
 * Gets all saved sessions from localStorage
 * @returns {Object} - Object containing all saved sessions
 */
function getAllSessions() {
    try {
        const savedSessionsStr = localStorage.getItem('sqlabSessions');
        return savedSessionsStr ? JSON.parse(savedSessionsStr) : {};
    } catch (error) {
        console.error('Error loading saved sessions:', error);
        return {};
    }
}

/**
 * Gets the most recently accessed session
 * @returns {Object|null} - Most recent session or null if none found
 */
function getMostRecentSession() {
    const sessions = getAllSessions();
    let mostRecent = null;
    let mostRecentTime = 0;
    
    for (const key in sessions) {
        const session = sessions[key];
        if (session.timestamp && session.timestamp > mostRecentTime) {
            mostRecentTime = session.timestamp;
            mostRecent = {
                database: session.database,
                content: session.content,
                ...session
            };
        }
    }
    
    return mostRecent;
}

/**
 * Saves current application state for the active session
 * This is a convenience method that pulls data from localStorage
 */
function saveCurrentSessionState() {
    const database = localStorage.getItem('selectedDb');
    const content = localStorage.getItem('selectedContent');
    const contentType = localStorage.getItem('contentType');
    const episodeNumber = localStorage.getItem('currentEpisodeNumber');
    const token = localStorage.getItem('currentEpisodeToken');
    const entryToken = localStorage.getItem('entryToken');
    
    saveSession(database, content, contentType, episodeNumber, token, entryToken);
}

/**
 * Restores session data from a saved session to active localStorage variables
 * @param {Object} session - Session data to restore
 */
function restoreSession(session) {
    if (!session) return;
    
    localStorage.setItem('selectedDb', session.database);
    localStorage.setItem('selectedContent', session.content);
    localStorage.setItem('contentType', session.contentType || 'adventure');
    
    if (session.entryToken) {
        localStorage.setItem('entryToken', session.entryToken);
    }
    
    if (session.currentToken) {
        localStorage.setItem('currentEpisodeToken', session.currentToken);
    }
    
    if (session.episodeNumber) {
        localStorage.setItem('currentEpisodeNumber', session.episodeNumber);
    }
}

export default {
    saveSession,
    getSession,
    getAllSessions,
    getMostRecentSession,
    saveCurrentSessionState,
    restoreSession
};