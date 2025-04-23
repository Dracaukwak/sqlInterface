/**
 * Escapes special HTML characters to prevent XSS attacks
 * @param {string} unsafe - Potentially dangerous string
 * @returns {string} - Safe escaped string
 */
function escapeHtml(unsafe) {
  if (unsafe === null || unsafe === undefined) {
    return '';
  }
  
  return String(unsafe).replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[m]);
}

/**
 * Formats the database name for display
 * @param {string} dbName - Raw database name
 * @returns {string} - Formatted name for display
 */
function formatDatabaseName(dbName) {
  if (!dbName) return 'Unknown';

  // If name starts with "sqlab_", extract the part after
  if (dbName.toLowerCase().startsWith('sqlab_')) {
    const adventureName = dbName.substring(6); // 'sqlab_'.length === 6
    // Capitalize first letter
    return adventureName.charAt(0).toUpperCase() + adventureName.slice(1);
  }

  return dbName;
}

module.exports = {
  escapeHtml,
  formatDatabaseName
};
