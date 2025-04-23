/**
 * Escapes special HTML characters in a string to prevent XSS attacks
 * @param {string} unsafe - The raw string that may contain HTML
 * @returns {string} - The sanitized string with HTML entities
 */
export function escapeHtml(unsafe) {
    return String(unsafe || '').replace(/[&<>"']/g, m => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    })[m]);
}
