/**
 * Common utility functions shared across modules
 * These utilities are core functionalities used by views, controllers and other utils
 */

import { translate as t } from './i18nManager.js';

/**
 * Escapes special HTML characters to prevent XSS attacks
 * @param {string} unsafe - Potentially dangerous string
 * @returns {string} - Safe escaped string
 */
export function escapeHtml(unsafe) {
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
 * Shows an error message in a container
 * @param {HTMLElement|string} container - Container to show error in or error message if single argument
 * @param {string} [message] - Error message to display
 * @returns {string|void} - Error message if called with a single argument
 */
export function showError(container, message) {
  // Support both (container, message) and (message) signatures for backward compatibility
  if (typeof container === 'string' && message === undefined) {
    console.error('Error:', container); // Log the error
    return container; // Return the message for functions that expect a return value
  }
  
  container.innerHTML = `<div class="error">${escapeHtml(message)}</div>`;
}

/**
 * Shows a loading indicator in a container
 * @param {HTMLElement} container - Container to show loading in
 * @param {string} message - Optional custom message (defaults to generic loading message)
 */
export function showLoading(container, message) {
  const loadingMessage = message || t('app.loading');
  container.innerHTML = `<div class="loading">${loadingMessage}</div>`;
}

/**
 * Shows an info message in a container
 * @param {HTMLElement} container - Container to show info in
 * @param {string} message - Info message to display
 */
export function showInfo(container, message) {
  container.innerHTML = `<div class="info">${escapeHtml(message)}</div>`;
}

/**
 * Copies text to clipboard with fallback for older browsers
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - Whether the copy was successful
 */
export async function copyTextToClipboard(text) {
  try {
    // Try to use the clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      return fallbackCopyTextToClipboard(text);
    }
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
}

/**
 * Fallback method for browsers that don't support the Clipboard API
 * @param {string} text - Text to copy to clipboard
 * @returns {boolean} - Whether the operation was successful
 */
function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  
  // Make the textarea out of viewport
  textArea.style.position = 'fixed';
  textArea.style.top = '-9999px';
  textArea.style.left = '-9999px';
  
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  let successful = false;
  try {
    successful = document.execCommand('copy');
  } catch (err) {
    console.error('Fallback: Copying text failed', err);
  }
  
  document.body.removeChild(textArea);
  return successful;
}