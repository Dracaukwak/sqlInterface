const express = require('express');
const router = express.Router();

// Import controllers
const databaseController = require('../controllers/databaseController');
const queryController = require('../controllers/queryController');
const tableController = require('../controllers/tableController');
const fileController = require('../controllers/fileController');

// Routes for database information
router.get('/database-info', databaseController.getDatabaseInfo);

// Routes for query execution
router.post('/execute-query', queryController.executeQuery);

// Routes for table management
router.get('/list-tables', tableController.listTables);
router.get('/table-data/:tableName', tableController.getTableData);

// Routes for TSV files
router.get('/list-tsv-files', fileController.listTsvFiles);

module.exports = router;
