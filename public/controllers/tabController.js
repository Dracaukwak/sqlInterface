/**
 * Initializes the tab navigation system
 */
export function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove "active" class from all tabs
            tabs.forEach(t => t.classList.remove('active'));

            // Add "active" class to the clicked tab
            tab.classList.add('active');

            // Hide all tab content sections
            tabContents.forEach(content => content.classList.remove('active'));

            // Show the content corresponding to the selected tab
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');

            // If "Business Tables" tab is activated, reload the tables
            if (tabId === 'business-tables') {
                window.loadBusinessTables();
            }
        });
    });
}
