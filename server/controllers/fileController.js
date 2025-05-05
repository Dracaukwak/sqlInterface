import fs from 'fs';
import path from 'path';

/**
 * Lists all TSV files available in the public/data folder
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
function listTsvFiles(req, res, next) {
  try {
    const dataDir = path.join(__dirname, '../../public/data');
    
    // Read all files from the data directory
    const files = fs.readdirSync(dataDir);
    
    // Filter only .tsv files and remove the extension
    const tsvFiles = files
      .filter(file => file.endsWith('.tsv'))
      .map(file => file.replace('.tsv', ''));
    
    res.json({ tables: tsvFiles });
  } catch (err) {
    next(err);
  }
}

export default {
  listTsvFiles
};
