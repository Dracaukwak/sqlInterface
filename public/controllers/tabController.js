// Gestion des onglets
export function initTabs() {
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
                window.loadBusinessTables();
            }
        });
    });
}
