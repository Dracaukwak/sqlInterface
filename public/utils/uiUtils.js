/**
 * UI utilities for common interface operations
 * Centralizes UI manipulation functions used across the application
 */
import { t } from '../controllers/localizationController.js';

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
 * Shows an error message in a container
 * @param {HTMLElement} container - Container to show error in
 * @param {string} message - Error message to display
 */
export function showError(container, message) {
    container.innerHTML = `<div class="error">${message}</div>`;
}

/**
 * Shows an info message in a container
 * @param {HTMLElement} container - Container to show info in
 * @param {string} message - Info message to display
 */
export function showInfo(container, message) {
    container.innerHTML = `<div class="info">${message}</div>`;
}

/**
 * Activates a specific tab and shows its content
 * @param {string} tabId - ID of the tab to activate
 */
export function activateTab(tabId) {
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    const tabButton = document.querySelector(`.tab[data-tab="${tabId}"]`);
    if (tabButton) {
        tabButton.classList.add('active');
    }
    
    // Update tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const tabContent = document.getElementById(tabId);
    if (tabContent) {
        tabContent.classList.add('active');
    }
    
    // Scroll preservation logic
    const scrollPosition = window.scrollY;
    requestAnimationFrame(() => {
        window.scrollTo(0, scrollPosition);
        setTimeout(() => {
            window.scrollTo(0, scrollPosition);
        }, 50);
    });
}

/**
 * Sets up the theme toggle functionality
 * @returns {Function} - Function to toggle theme
 */
export function setupThemeToggle() {
    const themeToggle = document.getElementById('toggle-theme');
    if (!themeToggle) return () => {};
    
    const isDarkTheme = localStorage.getItem('darkTheme') === 'true';
    
    // Apply stored theme preference
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
        themeToggle.classList.remove('fa-moon');
        themeToggle.classList.add('fa-sun');
    }
    
    // Define the toggle function
    const toggleTheme = () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        
        // Save user preference
        localStorage.setItem('darkTheme', isDark);
        
        // Update icon based on theme
        if (isDark) {
            themeToggle.classList.remove('fa-moon');
            themeToggle.classList.add('fa-sun');
        } else {
            themeToggle.classList.remove('fa-sun');
            themeToggle.classList.add('fa-moon');
        }
    };
    
    // Add event listener
    themeToggle.addEventListener('click', toggleTheme);
    
    // Return the toggle function for programmatic use
    return toggleTheme;
}

/**
 * Sets up the hamburger menu functionality
 */
export function setupHamburgerMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    
    if (!menuToggle || !dropdownMenu) return;
    
    // Toggle dropdown menu visibility on hamburger icon click
    menuToggle.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent immediate closing
        dropdownMenu.classList.toggle('active');
        
        // Optional icon rotation for visual feedback
        menuToggle.style.transform = dropdownMenu.classList.contains('active')
            ? 'rotate(90deg)'
            : 'rotate(0)';
    });
    
    // Close the menu when clicking outside
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.hamburger-menu') && dropdownMenu.classList.contains('active')) {
            dropdownMenu.classList.remove('active');
            menuToggle.style.transform = 'rotate(0)';
        }
    });
}

/**
 * Updates an element's height to match the tallest of its siblings
 * @param {HTMLElement} wrapper - Container with children to normalize heights 
 */
export function normalizeContentHeight(wrapper) {
    if (!wrapper) return;
    
    let maxHeight = 0;
    const children = wrapper.children;
    
    // First pass: measure all children
    Array.from(children).forEach(child => {
        // Make temporarily visible to measure (but visually hidden)
        const wasVisible = child.style.display !== 'none';
        const originalVisibility = child.style.visibility;
        const originalPosition = child.style.position;
        const originalOpacity = child.style.opacity;
        
        if (!wasVisible) {
            child.style.visibility = 'hidden';
            child.style.position = 'relative';
            child.style.display = 'block';
            child.style.opacity = '0';
        }
        
        const height = child.scrollHeight;
        maxHeight = Math.max(maxHeight, height);
        
        // Restore original state
        if (!wasVisible) {
            child.style.visibility = originalVisibility;
            child.style.position = originalPosition;
            child.style.display = 'none';
            child.style.opacity = originalOpacity;
        }
    });
    
    // Set height with a small buffer
    wrapper.style.minHeight = (maxHeight + 20) + 'px';
}

/**
 * Creates a button element with specified attributes
 * @param {string} text - Button text
 * @param {string} className - CSS class name
 * @param {Function} onClick - Click event handler
 * @returns {HTMLElement} - Created button element
 */
export function createButton(text, className, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = className || '';
    
    if (onClick) {
        button.addEventListener('click', onClick);
    }
    
    return button;
}

/**
 * Enables click-to-copy functionality on table cells
 * @param {HTMLElement} tableElement - Table to enable copying on
 */
export function enableClickToCopy(tableElement) {
    tableElement.querySelectorAll('td.copyable').forEach(cell => {
        cell.addEventListener('click', async function(e) {
            // Get the text content of the cell
            const textToCopy = this.textContent.trim();
            
            try {
                // Try to use the clipboard API
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(textToCopy);
                } else {
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = textToCopy;
                    
                    // Make the textarea out of viewport
                    textArea.style.position = 'fixed';
                    textArea.style.top = '-9999px';
                    textArea.style.left = '-9999px';
                    
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    
                    try {
                        document.execCommand('copy');
                    } catch (err) {
                        console.error('Fallback: Copying text failed', err);
                        throw err;
                    }
                    
                    document.body.removeChild(textArea);
                }
                
                // Visual feedback that copying was successful
                this.classList.add('copy-success');
                
                setTimeout(() => {
                    this.classList.remove('copy-success');
                }, 300);
                
            } catch (err) {
                console.error('Failed to copy text: ', err);
                
                // Visual feedback that copying failed
                this.classList.add('copy-error');
                
                setTimeout(() => {
                    this.classList.remove('copy-error');
                }, 300);
            }
            
            // Prevent default action and propagation
            e.preventDefault();
            e.stopPropagation();
        });
        
        // Prevent text selection on double click
        cell.addEventListener('dblclick', function(e) {
            e.preventDefault();
        });
    });
}