# SQLab Interface

![SQLab Interface Logo](./assets/logo/SQLabLogo.png)

A web-based interface for SQLab adventures, allowing users to explore and interact with SQL-based puzzle games in an intuitive environment.

## Overview

SQLab Interface provides a modern, browser-based GUI for SQLab adventures - educational text-based games where players solve puzzles using SQL queries. This interface connects to the SQLab database and offers a more streamlined experience than generic database tools.

## Features

- **Home Page Selection**: Choose between different databases and content types (adventures or exercises)
- **Progress Saving**: Automatically saves your session progress to resume later
- **SQL Query Execution**: Write and execute SQL queries with a dedicated editor
- **Table Explorer**: Browse tables with pagination and view their contents
- **Dark/Light Mode**: Toggle between dark and light themes for comfortable viewing
- **Responsive Design**: Clean, intuitive layout that works across various screen sizes
- **Drag and Drop Interface**: Rearrange tables for customized workspace organization
- **Multiple Languages**: Currently supports English and French

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- NPM (v6 or higher)
- MariaDB/MySQL database with a SQLab adventure loaded

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/sqlabInterface.git
   cd sqlab-interface
   ```

2. Install dependencies:
   ```
   npm install
   ```


4. Start the server:
   ```
   node server\server.js
   ```

5. Access the interface in your browser:
   ```
   http://localhost:3000
   ```

## Usage

### Home Page

1. **Select Database**: Choose from available SQLab databases (e.g., SQLab Island, SQLab SessForm)
2. **Select Content Type**: Choose between Adventure mode or Exercises (when available)
3. **Start or Resume**: Start a new session or resume a previously saved session

### Adventure Interface

1. **Navigate Episodes**: Progress through the adventure by solving SQL puzzles
2. **Executing Queries**:
   - Enter your SQL query in the text area at the top of the screen
   - Click the "Play" button or press Ctrl+Enter to execute
   - View results in the Execution tab

3. **Exploring Tables**:
   - Click on the "Tables" tab to see all available tables
   - Click on a table name to expand and view its contents
   - Use pagination controls to navigate through large tables

4. **Using Schema**:
   - View the database schema in the Schema tab
   - Helps understand relationships between tables

5. **Taking Notes**:
   - Use the Notes tab to write and save your thoughts
   - Notes are stored locally and persist between sessions

6. **Checking Solutions**:
   - Click the "Check" button to verify your solution
   - The system will tell you if your query solves the current puzzle

7. **Using Dark Mode**:
   - Click the moon/sun icon in the dropdown menu to toggle between light and dark themes

## Project Structure

```
/
├── public/                # Client-side code and assets
│   ├── controllers/       # Client-side controllers
│   ├── data/              # TSV data files
│   ├── locales/           # Translation files (en.json, fr.json)
│   ├── models/            # Client-side data handling
│   ├── styles/            # CSS stylesheets
│   │   ├── home.css       # Home page specific styles
│   │   ├── header.css     # Shared header styles
│   │   └── main.css       # Main application styles
│   ├── utils/             # Utility functions
│   │   ├── commonInit.js  # Shared initialization logic
│   │   └── constants.js   # Application constants
│   ├── views/             # UI rendering components
│   ├── app.html           # Main application page
│   ├── index.html         # Home/selection page
│   ├── app.js             # Application main JavaScript
│   ├── home.js            # Home page JavaScript
│   └── tsv-loader.js      # Utility for loading TSV files
├── server/                # Server-side code
│   ├── controllers/       # Express controllers
│   ├── middlewares/       # Custom middlewares
│   ├── routes/            # Express routes
│   │   ├── apiRoutes.js   # API endpoints
│   │   └── staticRoutes.js# Static file routes
│   ├── services/          # Business logic and DB services
│   │   └── databaseService.js # Database interaction
│   ├── utils/             # Server utilities
|   └── server.js          # Main Express server 
├── README.md              # Project documentation
└── package.json           # Project dependencies and scripts
```

## Session Management

SQLab Interface automatically saves your progress as you navigate through adventures or exercises. This allows you to:

- Resume from where you left off
- Switch between different adventures/exercises without losing progress
- See which episode you were on when returning to the application

Session data is stored in your browser's localStorage and includes:
- The current database and content type
- The current episode number
- The token needed to load your position

## Localization

The application supports multiple languages through a robust localization system:

- Language detection based on browser preferences
- Manual language selection via dropdown menu
- Persistent language preferences
- All UI elements and messages are localized

To add a new language:
1. Create a new JSON file in the `public/locales` directory (e.g., `de.json`)
2. Add all translation keys and translations in the same structure as existing files
3. Add the language option to the language selector in `index.html` and `app.html`

## Customization

### Adding New Databases

To add support for new SQLab databases:
1. Add the database options to the home page selection in `index.html`
2. Create the appropriate content type options for the new database

### Styling

The application uses a modular CSS approach with CSS variables for theming:
- Edit `variables.css` to change colors, spacing, and other design elements
- Override specific component styles in their respective CSS files

## Troubleshooting

- **Database Connection Error**: Verify that your MariaDB/MySQL server is running and credentials are correct
- **Port Error**: If port 3000 is already in use, modify the `port` variable in `server.js`
- **Missing Translations**: Check that all translation keys exist in your language files
- **File Access Issues**: Make sure to run the server from the project's root directory

