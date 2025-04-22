import { initTabs } from './controllers/tabController.js';
import { initQueryExecution } from './controllers/queryController.js';
import { initBusinessTables } from './controllers/tableController.js';
import { getDatabaseInfo, formatDatabaseName } from './models/dbModel.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialisation des composants
    initTabs();
    initQueryExecution();
    initBusinessTables();

    // Chargement automatique des tables métier au démarrage
    window.loadBusinessTables();
    document.querySelector('.tab[data-tab="business-tables"]').click();

    // Chargement du nom de la base de données
    loadDatabaseName();

    // Gestion du thème
    const themeToggle = document.getElementById('toggle-theme');
    const isDarkTheme = localStorage.getItem('darkTheme') === 'true';
    
    // Appliquer le thème enregistré
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
        themeToggle.classList.remove('fa-moon');
        themeToggle.classList.add('fa-sun');
    }
    
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        
        // Enregistrer la préférence de l'utilisateur
        localStorage.setItem('darkTheme', isDark);
        
        // Changer l'icône en fonction du thème
        if (isDark) {
            themeToggle.classList.remove('fa-moon');
            themeToggle.classList.add('fa-sun');
        } else {
            themeToggle.classList.remove('fa-sun');
            themeToggle.classList.add('fa-moon');
        }
    });
});

// Fonction pour charger et afficher le nom de la base de données
async function loadDatabaseName() {
    try {
        const dbInfoElement = document.getElementById('database-name');
        
        // Récupérer les informations de la base de données
        const dbInfo = await getDatabaseInfo();
        
        // Formater le nom pour l'affichage (ex: sqlab_island -> Island)
        const formattedName = formatDatabaseName(dbInfo.name);
        
        // Mettre à jour le titre de la page
        document.title = `SQLab - ${formattedName}`;
        
        // Mettre à jour l'élément dans le HTML
        dbInfoElement.textContent = formattedName;
    } catch (error) {
        console.error('Erreur lors du chargement du nom de la base de données:', error);
        // En cas d'erreur, afficher un texte par défaut
        document.getElementById('database-name').textContent = 'Database';
    }
}