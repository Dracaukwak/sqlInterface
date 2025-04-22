document.addEventListener('DOMContentLoaded', function () {
    // Initialiser les onglets
    initTabs();

    // Initialiser l'exécution des requêtes
    initQueryExecution();

    // Initialiser l'onglet Tables Métier
    initBusinessTables();

    // Charger automatiquement les tables au démarrage
    loadBusinessTables();

    // Activer l'onglet Tables Métier par défaut
    document.querySelector('.tab[data-tab="business-tables"]').classList.add('active');
    document.getElementById('business-tables').classList.add('active');
});

// Gestion des onglets
function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Retirer la classe active de tous les onglets
            tabs.forEach(t => t.classList.remove('active'));

            // Ajouter la classe active à l'onglet cliqué
            tab.classList.add('active');

            // Cacher tous les contenus d'onglet
            tabContents.forEach(content => content.classList.remove('active'));

            // Afficher le contenu de l'onglet correspondant
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');

            // Si l'onglet Tables Métier est activé, charger les tables (pour s'assurer qu'elles sont bien là)
            if (tabId === 'business-tables') {
                loadBusinessTables();
            }
        });
    });
}

// Gestion de l'exécution des requêtes
function initQueryExecution() {
    const queryInput = document.getElementById('query-input');
    const executeBtn = document.getElementById('execute-btn');
    const resultsTable = document.getElementById('results-table');
    const statusDiv = document.getElementById('status');

    executeBtn.addEventListener('click', function () {
        executeQuery();
    });

    queryInput.addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.key === 'Enter') {
            executeQuery();
        }
    });

    function executeQuery() {
        const query = queryInput.value.trim();

        if (!query) {
            showError('Please enter a SQL query');
            return;
        }

        statusDiv.textContent = 'Executing query...';

        // Envoyer la requête au serveur
        fetch('/execute-query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: query })
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        throw new Error(data.error || 'Server error');
                    });
                }
                return response.json();
            })
            .then(data => {
                displayResults(data, resultsTable);
                const rowCount = data.rows ? data.rows.length : 0;
                statusDiv.textContent = `Query executed successfully. ${rowCount} rows returned.`;

                // Si nous sommes dans l'onglet Tables, basculer vers l'onglet Exécution
                const activeTab = document.querySelector('.tab.active');
                if (activeTab && activeTab.getAttribute('data-tab') !== 'execution') {
                    document.querySelector('.tab[data-tab="execution"]').click();
                }
            })
            .catch(error => {
                showError(error.message);
            });
    }
}

// Affichage des résultats de requête
function displayResults(data, tableElement) {
    if (data.error) {
        showError(data.error);
        return;
    }

    if (!data.columns || !data.rows) {
        showError('Invalid data format returned');
        return;
    }

    // Créer l'en-tête du tableau
    let headerHtml = '<tr>';
    data.columns.forEach(column => {
        headerHtml += `<th>${escapeHtml(column)}</th>`;
    });
    headerHtml += '</tr>';

    // Créer le corps du tableau
    let bodyHtml = '';
    data.rows.forEach(row => {
        bodyHtml += '<tr>';
        row.forEach(cell => {
            bodyHtml += `<td>${escapeHtml(cell !== null ? cell : 'NULL')}</td>`;
        });
        bodyHtml += '</tr>';
    });

    tableElement.innerHTML = `<thead>${headerHtml}</thead><tbody>${bodyHtml}</tbody>`;
}

// Fonction pour afficher les erreurs
function showError(message) {
    const statusDiv = document.getElementById('status');

    // Message plus convivial si l'erreur concerne BigInt
    if (message && message.includes('BigInt')) {
        message = "Erreur de format de données: Conversion automatique des grands nombres en cours...";

        // Réessayer après un court délai
        setTimeout(() => {
            location.reload();
        }, 2000);
    }

    statusDiv.innerHTML = `<div class="error">${escapeHtml(message)}</div>`;
}

// Fonction pour échapper les caractères HTML
function escapeHtml(unsafe) {
    if (unsafe === null || unsafe === undefined) return '';
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Gestion de l'onglet Tables Métier
function initBusinessTables() {
    const tablesContainer = document.getElementById('business-tables-container');

    window.loadBusinessTables = function () {
        const tablesContainer = document.getElementById('business-tables-container');
        tablesContainer.innerHTML = '<div class="loading">Chargement des tables...</div>';

        fetch('/list-tables')
            .then(response => {
                // Vérifier si la réponse est OK avant d'essayer de la parser
                if (!response.ok) {
                    throw new Error(`Database error: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.tables && data.tables.length > 0) {
                    renderBusinessTables(data.tables);
                    initDragAndDrop();
                } else {
                    tablesContainer.innerHTML = '<div class="error">No tables found</div>';
                }
            })
            .catch(error => {
                console.error('Error loading tables from DB, trying TSV files:', error);
                // Essayer de charger les tables à partir des fichiers TSV
                fetch('/list-tsv-files')
                    .then(response => {
                        // Vérifier également si cette réponse est OK
                        if (!response.ok) {
                            throw new Error(`TSV files error: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log('TSV data received:', data);
                        if (data.tables && data.tables.length > 0) {
                            renderBusinessTables(data.tables);
                            initDragAndDrop();
                        } else {
                            tablesContainer.innerHTML = '<div class="error">No tables found in TSV files</div>';
                        }
                    })
                    .catch(tsvError => {
                        console.error('TSV loading error:', tsvError);
                        tablesContainer.innerHTML = `<div class="error">Error loading tables: ${error.message}<br>TSV fallback: ${tsvError.message}</div>`;
                    });
            });
    };

    // Fonction pour rendre les tables métier
    function renderBusinessTables(tables) {
        tablesContainer.innerHTML = '';

        tables.forEach(tableName => {
            const tableAccordion = document.createElement('div');
            tableAccordion.className = 'table-accordion';
            tableAccordion.dataset.table = tableName;

            // CRUCIAL: Définir l'attribut draggable à true
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

            // Gérer l'événement click sur l'en-tête
            tableHeader.addEventListener('click', function () {
                // Ne pas traiter le clic si on est en train de faire un drag
                if (window.dragging) return;

                // Toggle l'affichage du contenu
                tableContent.classList.toggle('active');
                const toggleIcon = tableHeader.querySelector('.toggle-icon');
                toggleIcon.textContent = tableContent.classList.contains('active') ? '▲' : '▼';

                // Charger les données si nécessaire
                if (tableContent.classList.contains('active') && tableContent.querySelector('.loading')) {
                    loadTableData(tableName, 0, 10);
                }
            });

            tableAccordion.appendChild(tableHeader);
            tableAccordion.appendChild(tableContent);
            tablesContainer.appendChild(tableAccordion);
        });
    }

    // Fonction pour charger les données d'une table avec pagination
    function loadTableData(tableName, offset = 0, limit = 10) {
        const tableContent = document.getElementById(`content-${tableName}`);

        fetch(`/table-data/${tableName}?offset=${offset}&limit=${limit}`)
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        throw new Error(data.error || 'Server error');
                    });
                }
                return response.json();
            })
            .then(data => {
                if (data.error) {
                    // Vérifier si l'erreur concerne BigInt
                    if (data.error.includes('BigInt')) {
                        tableContent.innerHTML = `<div class="error">Erreur de format de données: Conversion des grands nombres en cours...</div>`;
                        // Réessayer après un court délai
                        setTimeout(() => {
                            loadTableData(tableName, offset, limit);
                        }, 1000);
                        return;
                    }

                    tableContent.innerHTML = `<div class="error">${escapeHtml(data.error)}</div>`;
                    return;
                }

                renderTableData(tableName, data, offset);
            })
            .catch(error => {
                // Vérifier si l'erreur concerne BigInt
                if (error.message && error.message.includes('BigInt')) {
                    tableContent.innerHTML = `<div class="error">Erreur de format de données: Conversion des grands nombres en cours...</div>`;
                    // Réessayer après un court délai
                    setTimeout(() => {
                        loadTableData(tableName, offset, limit);
                    }, 1000);
                    return;
                }

                // Tenter de charger depuis un fichier TSV en cas d'erreur
                tableContent.innerHTML = `<div class="info">Tentative de chargement depuis un fichier TSV...</div>`;

                // Essayer de charger le fichier TSV correspondant
                if (window.tsvLoader) {
                    window.tsvLoader.loadTsvFile(`/data/${tableName}.tsv`)
                        .then(tsvData => {
                            // Adapter le format des données TSV pour la pagination
                            const paginatedData = {
                                columns: tsvData.columns,
                                rows: tsvData.rows.slice(offset, offset + limit),
                                total: tsvData.rows.length,
                                offset: offset,
                                limit: limit
                            };

                            renderTableData(tableName, paginatedData, offset);
                        })
                        .catch(tsvError => {
                            tableContent.innerHTML = `<div class="error">Impossible de charger les données: ${escapeHtml(error.message)}<br>TSV fallback: ${escapeHtml(tsvError.message)}</div>`;
                        });
                } else {
                    tableContent.innerHTML = `<div class="error">Erreur de chargement des données: ${escapeHtml(error.message)}</div>`;
                }
            });
    }

    // Fonction pour rendre les données d'une table
    function renderTableData(tableName, data, currentOffset) {
        const tableContent = document.getElementById(`content-${tableName}`);
        const total = data.total || data.rows.length;
        const limit = data.limit || 10;

        // Créer les actions de pagination
        const tableActions = document.createElement('div');
        tableActions.className = 'table-actions';
        tableActions.innerHTML = `
            <div class="info">
                Showing rows ${currentOffset + 1} - ${Math.min(currentOffset + limit, total)} of ${total}
            </div>
            <div class="pagination">
                <button class="prev-page" ${currentOffset === 0 ? 'disabled' : ''}>Previous</button>
                <button class="next-page" ${currentOffset + limit >= total ? 'disabled' : ''}>Next</button>
            </div>
        `;

        // Créer le tableau
        const table = document.createElement('table');

        // Créer l'en-tête du tableau
        let headerHtml = '<tr>';
        data.columns.forEach(column => {
            headerHtml += `<th>${escapeHtml(column)}</th>`;
        });
        headerHtml += '</tr>';

        // Créer le corps du tableau
        let bodyHtml = '';
        data.rows.forEach(row => {
            bodyHtml += '<tr>';
            row.forEach(cell => {
                bodyHtml += `<td>${escapeHtml(cell !== null ? cell : 'NULL')}</td>`;
            });
            bodyHtml += '</tr>';
        });

        table.innerHTML = `<thead>${headerHtml}</thead><tbody>${bodyHtml}</tbody>`;

        // Vider et ajouter les éléments au conteneur
        tableContent.innerHTML = '';
        tableContent.appendChild(tableActions);
        tableContent.appendChild(table);

        
        // Gérer la pagination
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
    function initDragAndDrop() {
        console.log("Initializing drag and drop...");
        const container = document.getElementById('business-tables-container');
        window.dragging = false;

        // Appliquer les événements à chaque accordéon
        document.querySelectorAll('.table-accordion').forEach(item => {
            // EVENT DRAGSTART: Quand l'utilisateur commence à faire glisser
            item.addEventListener('dragstart', function (e) {
                console.log("Drag started on:", this.dataset.table);
                window.dragging = true;
                this.classList.add('dragging');
                e.dataTransfer.setData('text/plain', this.dataset.table);
            });

            // EVENT DRAGEND: Quand l'utilisateur relâche l'élément
            item.addEventListener('dragend', function () {
                console.log("Drag ended");
                this.classList.remove('dragging');
                setTimeout(() => { window.dragging = false; }, 50);
            });
        });

        // EVENT DRAGOVER: Autorise le drop sur le conteneur
        container.addEventListener('dragover', function (e) {
            e.preventDefault(); // CRUCIAL: permet le drop

            const draggable = document.querySelector('.dragging');
            if (!draggable) return;

            const afterElement = getDragAfterElement(container, e.clientY);

            if (afterElement == null) {
                container.appendChild(draggable);
            } else {
                container.insertBefore(draggable, afterElement);
            }
        });

        // EVENT DROP: Quand l'utilisateur relâche l'élément sur une zone valide
        container.addEventListener('drop', function (e) {
            e.preventDefault();
            console.log("Drop event");
            const draggable = document.querySelector('.dragging');
            if (draggable) {
                draggable.classList.remove('dragging');
            }
        });

        // Trouve l'élément après lequel placer l'élément déplacé
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
}