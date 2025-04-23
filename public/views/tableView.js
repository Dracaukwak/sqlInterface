import { escapeHtml } from '../utils/helpers.js';

// Fonction pour rendre les tables métier
export function renderBusinessTables(tables) {
    const tablesContainer = document.getElementById('business-tables-container');
    tablesContainer.innerHTML = '';

    tables.forEach(tableName => {
        const tableAccordion = document.createElement('div');
        tableAccordion.className = 'table-accordion';
        tableAccordion.dataset.table = tableName;
        tableAccordion.setAttribute('draggable', 'true');

        // Créer l'en-tête de la table
        const tableHeader = document.createElement('div');
        tableHeader.className = 'table-header';
        tableHeader.innerHTML = `
            <div class="table-name">${escapeHtml(tableName)}</div>
            <div class="toggle-icon">▼</div>
        `;

        // Créer le contenu de la table
        const tableContent = document.createElement('div');
        tableContent.className = 'table-content';
        tableContent.id = `content-${tableName}`;
        tableContent.innerHTML = '<div class="loading">Loading table data...</div>';

        tableHeader.addEventListener('click', function () {
            if (window.dragging) return;
            tableContent.classList.toggle('active');
            const toggleIcon = tableHeader.querySelector('.toggle-icon');
            toggleIcon.textContent = tableContent.classList.contains('active') ? '▲' : '▼';

            if (tableContent.classList.contains('active') && tableContent.querySelector('.loading')) {
                window.loadTableData(tableName, 0, 10);
            }
        });

        tableAccordion.appendChild(tableHeader);
        tableAccordion.appendChild(tableContent);
        tablesContainer.appendChild(tableAccordion);
    });
}

// Fonction pour rendre les données d'une table avec pagination
export function renderTableData(tableName, data, currentOffset, loadTableData) {
    const tableContent = document.getElementById(`content-${tableName}`);
    const total = data.total || data.rows.length;
    const limit = data.limit || 10;
    const displayedRows = data.rows.length;

    const tableActions = document.createElement('div');
    tableActions.className = 'table-actions';
    tableActions.innerHTML = `
        <div class="pagination">
            <button class="prev-page" ${currentOffset === 0 ? 'disabled' : ''}>Previous</button>
            <button class="next-page" ${currentOffset + limit >= total ? 'disabled' : ''}>Next</button>
        </div>
    `;

    const table = document.createElement('table');

    // Ajouter une colonne pour les numéros de ligne (sans en-tête)
    let headerHtml = '<tr><th class="row-number-header"></th>';
    data.columns.forEach(column => {
        headerHtml += `<th>${escapeHtml(column)}</th>`;
    });
    headerHtml += '</tr>';

    let bodyHtml = '';
    data.rows.forEach((row, index) => {
        bodyHtml += '<tr>';
        // Ajouter le numéro de ligne
        bodyHtml += `<td class="row-number">${currentOffset + index + 1}</td>`;
        // Ajouter les cellules de données
        row.forEach(cell => {
            bodyHtml += `<td>${escapeHtml(cell !== null ? cell : 'NULL')}</td>`;
        });
        bodyHtml += '</tr>';
    });

    table.innerHTML = `<thead>${headerHtml}</thead><tbody>${bodyHtml}</tbody>`;

    // Créer le compteur de lignes
    const rowCounter = document.createElement('div');
    rowCounter.className = 'row-counter';
    rowCounter.textContent = `Affichage de ${displayedRows} ligne${displayedRows > 1 ? 's' : ''} sur ${total} au total`;

    tableContent.innerHTML = '';
    tableContent.appendChild(tableActions);
    tableContent.appendChild(table);
    tableContent.appendChild(rowCounter);

    const prevButton = tableActions.querySelector('.prev-page');
    const nextButton = tableActions.querySelector('.next-page');

    prevButton.addEventListener('click', () => {
        loadTableData(tableName, Math.max(0, currentOffset - limit), limit);
    });

    nextButton.addEventListener('click', () => {
        loadTableData(tableName, currentOffset + limit, limit);
    });
}

// Fonction pour initialiser le drag and drop
export function initDragAndDrop() {
    const container = document.getElementById('business-tables-container');
    window.dragging = false;

    document.querySelectorAll('.table-accordion').forEach(item => {
        item.addEventListener('dragstart', function (e) {
            window.dragging = true;
            this.classList.add('dragging');
            e.dataTransfer.setData('text/plain', this.dataset.table);
        });

        item.addEventListener('dragend', function () {
            this.classList.remove('dragging');
            setTimeout(() => { window.dragging = false; }, 50);
        });
    });

    container.addEventListener('dragover', function (e) {
        e.preventDefault();
        const draggable = document.querySelector('.dragging');
        if (!draggable) return;

        const afterElement = getDragAfterElement(container, e.clientY);
        if (afterElement == null) {
            container.appendChild(draggable);
        } else {
            container.insertBefore(draggable, afterElement);
        }
    });

    container.addEventListener('drop', function (e) {
        e.preventDefault();
        const draggable = document.querySelector('.dragging');
        if (draggable) {
            draggable.classList.remove('dragging');
        }
    });

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.table-accordion:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
}