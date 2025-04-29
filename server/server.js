// server.js - Entry point for the Express application
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { DEFAULT_SERVER_PORT } = require('../public/utils/constants');

// Import routes
const apiRoutes = require('./routes/apiRoutes');
const staticRoutes = require('./routes/staticRoutes');

// Import middlewares
const bigIntHandler = require('./middlewares/bigIntHandler');

const app = express();
const port = process.env.PORT || DEFAULT_SERVER_PORT;

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