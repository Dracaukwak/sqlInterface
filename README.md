# SQLab Interface

A web-based interface for SQLab adventures, allowing users to explore and interact with SQL-based puzzle games in an intuitive environment.

## Overview

SQLab Interface provides a modern, browser-based GUI for SQLab adventures - educational text-based games where players solve puzzles using SQL queries. This interface connects to the SQLab database and offers a more streamlined experience than generic database tools.

## Features

- **SQL Query Execution**: Write and execute SQL queries with a dedicated editor
- **Table Explorer**: Browse tables with pagination and view their contents
- **Dark/Light Mode**: Toggle between dark and light themes for comfortable viewing
- **Responsive Design**: Clean, intuitive layout that works across various screen sizes
- **Drag and Drop Interface**: Rearrange tables for customized workspace organization

## Getting Started

### Prerequisites

- Node.js (v12 or higher)
- NPM (v6 or higher)
- MariaDB/MySQL database with a SQLab adventure loaded

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/sqlab-interface.git
   cd sqlab-interface
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure the database connection:
   Edit the `server.js` file to update your database credentials:
   ```javascript
   const pool = mariadb.createPool({
     host: 'localhost',
     port: 3307,
     database: 'sqlab_island',  // Change to your SQLab database
     user: 'root',              // Update with your username
     password: 'student',       // Update with your password
     connectionLimit: 5
   });
   ```

4. Start the server:
   ```
   node server.js
   ```

5. Access the interface in your browser:
   ```
   http://localhost:3000
   ```

## Usage

1. **Executing Queries**:
   - Enter your SQL query in the text area at the top of the screen
   - Click the "Play" button or press Ctrl+Enter to execute
   - View results in the Execution tab

2. **Exploring Tables**:
   - Click on the "Business Tables" tab to see all available tables
   - Click on a table name to expand and view its contents
   - Use pagination controls to navigate through large tables

3. **Using Dark Mode**:
   - Click the moon/sun icon in the top right to toggle between light and dark themes

## Project Structure

```
├── controllers/        # Controls application logic
├── models/             # Handles data and database operations
├── public/             # Static assets and client-side code
│   ├── data/           # TSV data files
│   └── styles/         # CSS stylesheets
├── views/              # Handles UI rendering
├── utils/              # Utility functions
├── server.js           # Main Express server
└── index.html          # Main application page
```

## Compatible SQLab Adventures

This interface works with all SQLab adventures, including:

- SQLab Island (English)
- SQLab Sessform (French)
- SQLab Corbeau (French)
- SQLab Club (English)

## Future Enhancements

- Integration with the SQLab decryption mechanism for puzzle progression
- Schema visualization for database tables
- Query history and saving functionality
- Support for collaborative play

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Based on the SQLab project by [original author]
- Inspired by SQL educational tools like SQL Island by Johannes Schildgen
