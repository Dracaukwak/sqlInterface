import { executeQuery } from '../models/queryModel.js';
import { displayResults } from '../views/queryView.js';
import { showError } from '../utils/paginationUtils.js';
import { t } from '../controllers/localizationController.js';
import { DEFAULT_PAGE_LIMIT, DEFAULT_PAGE_OFFSET } from '../utils/constants.js';
import { addColumnToSelects } from '../utils/sqlUtils.js';

/**
 * Initializes the SQL query execution logic with pagination support
 */
export function initQueryExecution() {
    // Get references to UI elements
    const queryInput = document.getElementById('query-input');
    const executeBtn = document.getElementById('execute-btn');
    const resultsContainer = document.getElementById('results');
    
    // Variables to store current query and pagination state
    let currentQuery = '';
    let currentOffset = DEFAULT_PAGE_OFFSET;
    let currentLimit = DEFAULT_PAGE_LIMIT;

    // Execute query on button click
    executeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent tab click from interfering
        
        // Reset offset when executing a new query
        currentOffset = DEFAULT_PAGE_OFFSET;
        executeQueryHandler();
    });

    // Execute query on Ctrl+Enter inside the textarea
    queryInput.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            // Reset offset when executing a new query
            currentOffset = DEFAULT_PAGE_OFFSET;
            executeQueryHandler();
        }
    });

    /**
     * Handles query execution: fetch results and display them
     */
    async function executeQueryHandler() {
        const query = queryInput.value.trim();
        if (!query) {
            showError(t('query.emptyError'), resultsContainer);
            return;
        }

        // Store the current query for pagination
        currentQuery = query;
        
        try {
            // Execute the query with pagination parameters
            const data = await executeQuery(query, currentOffset, currentLimit);

            // Reset results container to ensure clean output each time
            resultsContainer.innerHTML = `
                <div class="results-container">
                    <table id="results-table"></table>
                </div>
            `;

            // Get the newly created table element
            const resultsTable = document.getElementById('results-table');
            
            // Display the results in the table with pagination
            displayResults(
                data, 
                resultsTable, 
                resultsContainer.querySelector('.results-container'), 
                onPageChange
            );

            // Automatically switch to the Execution tab to show results
            document.querySelector('.tab[data-tab="execution"]').click();
        } catch (error) {
            // Show error message if the query fails
            showError(error.message, resultsContainer);
        }
    }
    
    /**
     * Callback function for pagination changes
     * @param {number} newOffset - New offset to use
     * @param {number} limit - Number of rows to retrieve
     */
    const onPageChange = (newOffset, limit) => {
        currentOffset = newOffset;
        currentLimit = limit;
        executeQueryWithPagination();
    };
    
    /**
     * Helper function to execute the current query with updated pagination
     */
    async function executeQueryWithPagination() {
        try {
            // Execute the stored query with new pagination parameters
            const data = await executeQuery(currentQuery, currentOffset, currentLimit);
            
            // Get existing table and container
            const resultsTable = document.getElementById('results-table');
            const container = resultsContainer.querySelector('.results-container');
            
            // Display the updated results
            displayResults(data, resultsTable, container, onPageChange);
        } catch (error) {
            // Show error message if the query fails
            showError(error.message, resultsContainer);
        }
    }
}