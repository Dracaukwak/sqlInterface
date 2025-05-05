// server.js - Entry point for the Express application
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { DEFAULT_SERVER_PORT } from '../public/utils/constants.js';

// Import routes
import apiRoutes from './routes/apiRoutes.js';
import staticRoutes from './routes/staticRoutes.js';

// Import middlewares
import bigIntHandler from './middlewares/bigIntHandler.js';

const app = express();
const port = process.env.PORT || DEFAULT_SERVER_PORT;

import { fileURLToPath } from 'url';

// Recreate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure global middlewares
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/data', express.static(path.join(__dirname, '../public/data')));

// Custom middleware for BigInt handling
app.use(bigIntHandler);

// Configure routes
app.use('/', apiRoutes);
app.use('/', staticRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    error: `Server error: ${err.message}`
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});