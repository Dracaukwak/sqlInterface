import { escapeHtml } from '../utils/helpers.js';

export function displayResults(data, tableElement) {
    let headers = data.columns.map(col => `<th>${escapeHtml(col)}</th>`).join('');
    let rows = data.rows.map(row => `<tr>${row.map(cell => `<td>${escapeHtml(cell || 'NULL')}</td>`).join('')}</tr>`).join('');
    tableElement.innerHTML = `<thead><tr>${headers}</tr></thead><tbody>${rows}</tbody>`;
}

export function showError(message, element) {
    element.innerHTML = `<div class="error">${escapeHtml(message)}</div>`;
}