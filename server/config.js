/**
 * Database configuration
 * Modify these settings to match your database setup
 */
const dbConfig = {
    host: 'localhost',
    port: 3307,
    database: 'sqlab_',
    user: 'root',
    password: 'student',
    connectionLimit: 5
  };
  
  module.exports = {
    dbConfig
  };