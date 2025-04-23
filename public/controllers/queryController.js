import { executeQuery } from '../models/queryModel.js';
import { displayResults, showError } from '../views/queryView.js';

// Gestion de l'exécution des requêtes
export function initQueryExecution() {
    const queryInput = document.getElementById('query-input');
    const executeBtn = document.getElementById('execute-btn');
    const resultsContainer = document.getElementById('results'); // Utiliser le conteneur stable
    
    executeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Empêcher le clic sur l'onglet
        executeQueryHandler();
    });
    
    queryInput.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') executeQueryHandler();
    });

    async function executeQueryHandler() {
        const query = queryInput.value.trim();
        if (!query) {
            showError('Please enter a SQL query', resultsContainer);
            return;
        }

        try {
            const data = await executeQuery(query);
            
            // Toujours régénérer la structure pour avoir une référence fraîche
            resultsContainer.innerHTML = `
                <h3>Résultats</h3>
                <div class="results-container">
                    <table id="results-table"></table>
                </div>
            `;
            
            const resultsTable = document.getElementById('results-table');
            displayResults(data, resultsTable);
            
            // Activer automatiquement l'onglet d'exécution pour voir les résultats
            document.querySelector('.tab[data-tab="execution"]').click();
        } catch (error) {
            showError(error.message, resultsContainer);
        }
    }
}