// Fonction pour charger des données TSV à partir d'un fichier externe
class TsvLoader {
    constructor() {
        this.loadedData = {};
    }

    /**
     * Charge un fichier TSV et retourne les données sous forme de tableau d'objets
     * @param {string} url - L'URL du fichier TSV à charger
     * @returns {Promise<Array>} - Promesse résolue avec les données du fichier
     */
    async loadTsvFile(url) {
        // Vérifier si les données sont déjà en cache
        if (this.loadedData[url]) {
            return this.loadedData[url];
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load TSV file: ${response.status} ${response.statusText}`);
            }

            const text = await response.text();
            const data = this.parseTsv(text);
            
            // Mettre en cache les données
            this.loadedData[url] = data;
            
            return data;
        } catch (error) {
            console.error('Error loading TSV file:', error);
            throw error;
        }
    }

    /**
     * Parse le contenu TSV et retourne un tableau d'objets
     * @param {string} text - Le contenu du fichier TSV
     * @returns {Array} - Tableau d'objets avec les données du TSV
     */
    parseTsv(text) {
        // Diviser par lignes
        const lines = text.trim().split('\n');
        
        // Extraire les en-têtes (première ligne)
        const headers = lines[0].split('\t');
        
        // Traiter les données
        const data = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split('\t');
            
            // Créer un objet avec les en-têtes comme clés
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || null;
            });
            
            data.push(row);
        }
        
        return {
            columns: headers,
            rows: data.map(row => headers.map(header => row[header]))
        };
    }

    /**
     * Convertit un tableau d'objets en format compatible avec l'API
     * @param {Array} data - Les données à convertir
     * @returns {Object} - Données formatées pour l'affichage
     */
    formatDataForDisplay(data) {
        return {
            columns: data.columns,
            rows: data.rows
        };
    }
}

// Exporter l'instance du loader
window.tsvLoader = new TsvLoader();
