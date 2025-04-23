import { escapeHtml } from '../utils/helpers.js';

export function displayResults(data, tableElement) {
    // Ajouter une colonne pour les numéros de ligne (sans en-tête)
    let headers = `<th class="row-number-header"></th>` + data.columns.map(col => `<th>${escapeHtml(col)}</th>`).join('');
    
    // Ajouter un numéro de ligne à chaque rangée
    let rows = data.rows.map((row, index) => 
        `<tr>
            <td class="row-number">${index + 1}</td>
            ${row.map(cell => `<td>${escapeHtml(cell !== null ? cell : 'NULL')}</td>`).join('')}
        </tr>`
    ).join('');
    
    tableElement.innerHTML = `<thead><tr>${headers}</tr></thead><tbody>${rows}</tbody>`;
    
    // Ajouter le compteur de lignes en dessous du tableau
    const displayedRows = data.rows.length;
    const totalRows = data.totalRows || displayedRows;
    const rowCounter = document.createElement('div');
    rowCounter.className = 'row-counter';
    rowCounter.textContent = `Affichage de ${displayedRows} ligne${displayedRows > 1 ? 's' : ''} sur ${totalRows} au total`;
    
    // Insérer après le tableau
    tableElement.parentNode.insertBefore(rowCounter, tableElement.nextSibling);
}

export function showError(message, containerElement) {
    // Réinitialiser le conteneur avec le message d'erreur
    containerElement.innerHTML = `
        <h3>Résultats</h3>
        <div class="error">${escapeHtml(message)}</div>
    `;
}