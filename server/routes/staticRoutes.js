import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Recreate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Route for home page (now serves the selection page)
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Route for the main application interface
router.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/app.html'));
});

export default router;