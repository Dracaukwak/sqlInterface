import express from 'express';
const router = express.Router();

// Import controllers
import databaseController from '../controllers/databaseController.js';
import queryController from '../controllers/queryController.js';
import tableController from '../controllers/tableController.js';

// Routes for database information
router.get('/database-info', databaseController.getDatabaseInfo);

// Routes for database selection and TOC data
router.post('/set-database', databaseController.setDatabase);
router.post('/get-toc', databaseController.getTocData);

// Routes for query execution
router.post('/execute-query', queryController.executeQuery);

// Routes for table management
router.get('/list-tables', tableController.listTables);
router.get('/table-data/:tableName', tableController.getTableData);

export default router;