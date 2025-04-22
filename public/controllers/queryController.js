
import { executeQuery } from '../models/queryModel.js';
import { displayResults, showError, setStatus } from '../views/queryView.js';

// Gestion de l'exécution des requêtes
export function initQueryExecution() {
    const queryInput = document.getElementById('query-input');
    const executeBtn = document.getElementById('execute-btn');
    const resultsTable = document.getElementById('results-table');
    const statusDiv = document.getElementById('status');

    executeBtn.addEventListener('click', () => executeQueryHandler());
    queryInput.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') executeQueryHandler();
    });

    async function executeQueryHandler() {
        const query = queryInput.value.trim();
        if (!query) {
            showError('Please enter a SQL query', statusDiv);
            return;
        }

        setStatus('Executing query...', statusDiv);

        try {
            const data = await executeQuery(query);
            displayResults(data, resultsTable);
            setStatus(`Query executed successfully. ${data.rows.length} rows returned.`, statusDiv);
            document.querySelector('.tab[data-tab="execution"]').click();
        } catch (error) {
            showError(error.message, statusDiv);
        }
    }
}
