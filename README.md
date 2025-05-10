![SQLab Interface Logo](./assets/logo/SQLabLogo.png)

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
- **Multiple Languages**: Currently supports English and French

## Getting Started

### Prerequisites

- Node.js (v12 or higher)
- NPM (v6 or higher)
- MariaDB/MySQL database with a SQLab adventure loaded

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/sqlabInterface.git
   cd sqlab-interface
   ```

2. Configure the database connection:
   Edit the `server/services/databaseService.js` file to update your database credentials:
   ```javascript
   const pool = mariadb.createPool({
     host: 'localhost',
     port: 3307,
     database: 'sqlab_island',  // Change to your SQLab database
     user: 'root',              // Update with your username
     password: 'pass',          // Update with your password
     connectionLimit: 5
   });
   ```

3. Start the server:
   ```
   node server/server.js
   ```

4. Access the interface in your browser:
   ```
   http://localhost:3000
   ```

## Database Configuration

To configure your database connection:

1. Open the `config.js` file in the `server` directory
2. Update the following settings to match your environment:
   ```javascript
   const dbConfig = {
     host: 'localhost',     // Your database host
     port: 3306,            // Your database port 
     database: 'sqlab_island', // Your database name
     user: 'root',          // Your database username
     password: 'pass',   // Your database password
     connectionLimit: 5     // Maximum number of connections
   };

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
/
├── public/             # Client-side code and assets
│   ├── controllers/    # Client-side controllers
│   ├── models/         # Client-side data handling
│   ├── styles/         # CSS stylesheets
│   ├── utils/          # Utility functions
│   ├── views/          # UI rendering components
│   ├── index.html      # Main application page
│   ├── main.js         # Main client-side JavaScript
├── server/             # Server-side code
│   ├── controllers/    # Express controllers
│   ├── middlewares/    # Custom middlewares
│   ├── routes/         # Express routes
│   ├── services/       # Business logic and DB services
│   ├── utils/          # Server utilities
│   └── server.js       # Main Express server 
├── README.md           # Project documentation
└── package.json        # Project dependencies and scripts
```

## Troubleshooting

- **Database Connection Error**: Verify that your MariaDB/MySQL server is running and credentials are correct
- **Port Error**: If port 3000 is already in use, modify the `port` variable in `server/config.js`
- **File Access Issues**: Make sure to run the server from the project's root directory