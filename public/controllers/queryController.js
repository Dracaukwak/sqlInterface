import { executeQuery } from '../models/queryModel.js';
import { displayResults, showError } from '../views/queryView.js';

/**
 * Initializes the SQL query execution logic
 */
export function initQueryExecution() {
    // Get references to UI elements
    const queryInput = document.getElementById('query-input');
    const executeBtn = document.getElementById('execute-btn');
    const resultsContainer = document.getElementById('results'); // Stable container for output

    // Execute query on button click
    executeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent tab click from interfering
        executeQueryHandler();
    });

    // Execute query on Ctrl+Enter inside the textarea
    queryInput.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') executeQueryHandler();
    });

    /**
     * Handles query execution: fetch results and display them
     */
    async function executeQueryHandler() {
        const query = queryInput.value.trim();
        if (!query) {
            showError('Please enter a SQL query', resultsContainer);
            return;
        }

        try {
            const data = await executeQuery(query);

            // Reset results container to ensure clean output each time
            resultsContainer.innerHTML = `
                <h3>Results</h3>
                <div class="results-container">
                    <table id="results-table"></table>
                </div>
            `;

            // Display the results in the newly created table
            const resultsTable = document.getElementById('results-table');
            displayResults(data, resultsTable);

            // Automatically switch to the Execution tab to show results
            document.querySelector('.tab[data-tab="execution"]').click();
        } catch (error) {
            // Show error message if the query fails
            showError(error.message, resultsContainer);
        }
    }
}
