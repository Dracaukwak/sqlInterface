/**
 * Initializes the tab navigation system with improved scroll position handling
 */
export function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Wrap all tab contents in a container with fixed height if not already done
    if (!document.querySelector('.tab-content-wrapper')) {
        const tabContentWrapper = document.createElement('div');
        tabContentWrapper.className = 'tab-content-wrapper';
        
        // Get the first tab content element
        const firstTabContent = tabContents[0];
        
        // Insert the wrapper before the first tab content
        firstTabContent.parentNode.insertBefore(tabContentWrapper, firstTabContent);
        
        // Move all tab content elements into the wrapper
        tabContents.forEach(content => {
            tabContentWrapper.appendChild(content);
        });
    }
    
    // Function to calculate and set the minimum height
    const updateTabContentWrapperHeight = () => {
        const wrapper = document.querySelector('.tab-content-wrapper');
        if (!wrapper) return;
        
        let maxHeight = 0;
        
        // Find the tallest content
        tabContents.forEach(content => {
            // Make temporarily visible to measure
            const wasActive = content.classList.contains('active');
            if (!wasActive) {
                content.style.visibility = 'hidden';
                content.style.position = 'relative';
                content.style.display = 'block';
                content.style.opacity = '0';
            }
            
            const height = content.scrollHeight;
            if (height > maxHeight) {
                maxHeight = height;
            }
            
            // Restore original state
            if (!wasActive) {
                content.style.visibility = '';
                content.style.position = '';
                content.style.display = '';
                content.style.opacity = '';
            }
        });
        
        // Set minimum height with some buffer
        wrapper.style.minHeight = (maxHeight + 20) + 'px';
    };
    
    // Update heights initially and whenever window resizes
    updateTabContentWrapperHeight();
    window.addEventListener('resize', updateTabContentWrapperHeight);
    
    // Variable to track last scroll position
    let lastScrollPosition = 0;
    
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            // Save current scroll position
            lastScrollPosition = window.scrollY;
            
            // Get the clicked tab ID
            const tabId = tab.getAttribute('data-tab');
            
            // Remove "active" class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add "active" class to the clicked tab
            tab.classList.add('active');
            
            // Hide all tab content sections
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Show the content corresponding to the selected tab
            const selectedContent = document.getElementById(tabId);
            selectedContent.classList.add('active');
            
            // If "Business Tables" tab is activated, reload the tables
            if (tabId === 'business-tables') {
                window.loadBusinessTables();
            }
            
            // Use requestAnimationFrame to ensure DOM updates first
            requestAnimationFrame(() => {
                // Restore scroll position
                window.scrollTo(0, lastScrollPosition);
                
                // Do it again after a brief delay to handle any post-render adjustments
                setTimeout(() => {
                    window.scrollTo(0, lastScrollPosition);
                    
                    // Update height in case content has changed
                    updateTabContentWrapperHeight();
                }, 50);
            });
        });
    });
}