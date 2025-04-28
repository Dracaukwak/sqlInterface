/**
 * Database configuration
 * Modify these settings to match your database setup
 */
const dbConfig = {
    host: 'localhost',
    port: 3307,
    database: 'sqlab_database',
    user: 'username',
    password: 'password',
    connectionLimit: 5
  };
  
  module.exports = {
    dbConfig
  };