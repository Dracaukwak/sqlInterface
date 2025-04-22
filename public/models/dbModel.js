// Modèle pour récupérer les informations sur la base de données

/**
 * Récupère les informations de la base de données connectée
 * @returns {Promise<Object>} - Promesse résolue avec les informations de la base
 */
export async function getDatabaseInfo() {
    try {
        // Exécute une requête pour obtenir le nom de la base de données actuelle
        const response = await fetch('/database-info');
        
        if (!response.ok) {
            throw new Error('Impossible de récupérer les informations de la base de données');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erreur lors de la récupération des infos de la base de données:', error);
        // En cas d'erreur, retourner un objet par défaut
        return { 
            name: 'Non connecté',
            host: 'localhost',
            adventure: 'Unknown'
        };
    }
}

/**
 * Formate le nom de la base de données pour l'affichage
 * Transforme "sqlab_island" en "Island", "sqlab_corbeau" en "Corbeau", etc.
 * @param {string} dbName - Nom brut de la base de données
 * @returns {string} - Nom formaté pour l'affichage
 */
export function formatDatabaseName(dbName) {
    if (!dbName) return 'Unknown';
    
    // Si le nom commence par "sqlab_", extraire la partie après
    if (dbName.toLowerCase().startsWith('sqlab_')) {
        const adventureName = dbName.substring(6); // 'sqlab_'.length === 6
        // Mettre la première lettre en majuscule
        return adventureName.charAt(0).toUpperCase() + adventureName.slice(1);
    }
    
    return dbName;
}
