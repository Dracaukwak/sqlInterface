// server.js - A simple Express server that connects to MariaDB
const express = require('express');
const bodyParser = require('body-parser');
const mariadb = require('mariadb');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/data', express.static(path.join(__dirname, 'public/data')));

// Database connection pool
const pool = mariadb.createPool({
  host: 'localhost',
  port: 3307,
  database: 'sqlab_island',
  user: 'root',  // Update with your username
  password: 'student',  // Update with your password
  connectionLimit: 5
});

// API endpoint pour obtenir les informations de la base de données
app.get('/database-info', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();

    // Obtenir le nom de la base de données actuelle
    const dbInfoQuery = "SELECT DATABASE() as name";
    const dbInfo = await conn.query(dbInfoQuery);

    // Obtenir l'hôte de la base de données
    const hostInfoQuery = "SELECT @@hostname as host";
    const hostInfo = await conn.query(hostInfoQuery);

    // Formater le nom de l'aventure
    const dbName = dbInfo[0].name;
    const adventureName = formatAdventureName(dbName);

    // Construire l'objet de réponse
    const info = {
      name: dbName,
      host: hostInfo[0].host || 'localhost',
      port: 3307,
      adventure: adventureName
    };

    res.json(info);
  } catch (err) {
    console.error('Error fetching database info:', err);
    res.status(500).json({
      error: `Database error: ${err.message}`,
      name: 'Non connecté',
      host: 'localhost',
      adventure: 'Unknown'
    });
  } finally {
    if (conn) conn.release();
  }
});

// Fonction d'aide pour formater le nom de l'aventure
function formatAdventureName(dbName) {
  if (!dbName) return 'Unknown';

  // Si le nom commence par "sqlab_", extraire la partie après
  if (dbName.toLowerCase().startsWith('sqlab_')) {
    const adventureName = dbName.substring(6); // 'sqlab_'.length === 6
    // Mettre la première lettre en majuscule
    return adventureName.charAt(0).toUpperCase() + adventureName.slice(1);
  }

  return dbName;
}
// API endpoint to execute queries
app.post('/execute-query', async (req, res) => {
  const { query } = req.body;
  let conn;
  try {
    // Get connection from pool
    conn = await pool.getConnection();

    // Execute the query
    const rows = await conn.query(query);

    // Format the results
    const results = {
      columns: rows.length > 0 ? Object.keys(rows[0]) : [],
      rows: rows.map(row => {
        return Object.values(row).map(value => {
          // Convert BigInt to String to avoid serialization issues
          if (typeof value === 'bigint') {
            return value.toString();
          }
          return value;
        });
      }),
      totalRows: rows.length // Ajouter le nombre total de lignes
    };

    res.json(results);
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({
      error: `Database error: ${err.message}`
    });
  } finally {
    // Release connection back to the pool
    if (conn) conn.release();
  }
});

// New API endpoint to get list of tables
app.get('/list-tables', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();

    // Query to get all tables in the database
    const tables = await conn.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'sqlab_island' 
      ORDER BY table_name
    `);

    // Ensure we handle any BigInt values properly
    res.json({
      tables: tables.map(table => {
        // Convert any potential BigInt values to strings
        if (typeof table.table_name === 'bigint') {
          return table.table_name.toString();
        }
        return table.table_name;
      })
    });
  } catch (err) {
    console.error('Error fetching tables:', err);
    res.status(500).json({
      error: `Database error: ${err.message}`
    });
  } finally {
    if (conn) conn.release();
  }
});

// API endpoint to get table data with pagination
app.get('/table-data/:tableName', async (req, res) => {
  const { tableName } = req.params;
  const { offset = 0, limit = 10 } = req.query;

  let conn;
  try {
    conn = await pool.getConnection();

    // Get total count first
    const countQuery = `SELECT COUNT(*) as total FROM ${tableName}`;
    const countResult = await conn.query(countQuery);

    // Fix for BigInt in total count
    let total;
    if (typeof countResult[0].total === 'bigint') {
      total = countResult[0].total.toString();
    } else {
      total = countResult[0].total;
    }

    // Then get the data with pagination
    const dataQuery = `SELECT * FROM ${tableName} LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;
    const rows = await conn.query(dataQuery);

    // Format the results - with specific handling for BigInt values
    const results = {
      tableName,
      total,
      offset: parseInt(offset),
      limit: parseInt(limit),
      columns: rows.length > 0 ? Object.keys(rows[0]) : [],
      rows: rows.map(row => {
        return Object.values(row).map(value => {
          // Convert BigInt to String to avoid serialization issues
          if (typeof value === 'bigint') {
            return value.toString();
          }
          // Handle null values explicitly
          if (value === null) {
            return null;
          }
          return value;
        });
      })
    };

    res.json(results);
  } catch (err) {
    console.error(`Error fetching data from table ${tableName}:`, err);
    res.status(500).json({
      error: `Database error: ${err.message}`
    });
  } finally {
    if (conn) conn.release();
  }
});

// API endpoint to list TSV files in the data directory
app.get('/list-tsv-files', (req, res) => {
  const dataDir = path.join(__dirname, 'public/data');

  try {
    // Read all files in the data directory
    const files = fs.readdirSync(dataDir);

    // Filter only .tsv files and remove the extension
    const tsvFiles = files
      .filter(file => file.endsWith('.tsv'))
      .map(file => file.replace('.tsv', ''));

    res.json({ tables: tsvFiles });
  } catch (err) {
    console.error('Error listing TSV files:', err);
    res.status(500).json({
      error: `File system error: ${err.message}`
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});