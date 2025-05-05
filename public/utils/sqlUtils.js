/**
 * SQL utilities for parsing and manipulating SQL queries
 */

// Try to use the NodeSQLParser if available
let parser;
try {
  const Parser = window.NodeSQLParser?.Parser;
  if (Parser) {
    parser = new Parser();
  }
} catch (e) {
  console.warn('SQL Parser not available, using fallback methods');
}

/**
 * Splits SQL text into separate statements
 * @param {string} sqlText - SQL text to split
 * @returns {string[]} - Array of SQL statements
 */
function splitStatements(sqlText) {
  if (!sqlText || typeof sqlText !== 'string') {
    return [];
  }
  return sqlText
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

/**
 * Adds a column to SELECT statements in SQL query
 * @param {string} sqlText - SQL query text
 * @param {string} colName - Column to add (formula)
 * @returns {string} - Modified SQL query with column added
 */
export function addColumnToSelects(sqlText, colName = 'added_column') {
  if (!sqlText || typeof sqlText !== 'string') {
    return sqlText;
  }
  
  const stmts = splitStatements(sqlText);
  const out = [];

  stmts.forEach(stmt => {
    // Try using the parser if available
    if (parser) {
      try {
        let ast = parser.astify(stmt, { parseOptions: { includeLocations: true } });
        if (Array.isArray(ast)) ast = ast[0];
        
        if (ast.type !== 'select' || !Array.isArray(ast.columns) || ast.columns.length === 0) {
          out.push(stmt + ';');
          return;
        }
        
        const lastCol = ast.columns[ast.columns.length - 1];
        const loc = lastCol?.loc ?? lastCol.expr?.loc;
        
        if (loc && loc.end && loc.end.offset !== undefined) {
          const insertOffset = loc.end.offset;
          const before = stmt.slice(0, insertOffset);
          const after = stmt.slice(insertOffset);
          const insertText = ', ' + colName;
          
          out.push(before + insertText + after + ';');
          return;
        }
      } catch (e) {
        console.warn('Error parsing SQL with parser, using fallback method', e);
        // Fall through to fallback method
      }
    }
    
    // Fallback method - add after the last comma or after SELECT
    let result = stmt;
    
    // Check if the query already has a column list
    const selectMatch = /\bSELECT\s+(.+?)\s+FROM\b/i.exec(stmt);
    
    if (selectMatch) {
      const columnList = selectMatch[1];
      const fromPos = selectMatch.index + 'SELECT '.length + columnList.length;
      
      // Don't add if formula is already there
      if (!columnList.includes(colName)) {
        // If there's a * as the only selection, replace with *, formula
        if (columnList.trim() === '*') {
          result = stmt.substring(0, selectMatch.index + 'SELECT '.length) + 
                  '*, ' + colName + 
                  stmt.substring(fromPos);
        } else {
          // Otherwise insert formula after column list
          result = stmt.substring(0, fromPos) + 
                  ', ' + colName + 
                  stmt.substring(fromPos);
        }
      }
    }
    
    out.push(result + ';');
  });

  return out.join('\n');
}

/**
 * Extracts table aliases from SQL query
 * @param {string} sqlText - SQL query text
 * @returns {string[]} - Array of table aliases
 */
export function extractTableAliases(sqlText) {
  if (!parser || !sqlText) {
    return [];
  }
  
  try {
    const stmts = splitStatements(sqlText);
    const tables = [];
    
    stmts.forEach(stmt => {
      let ast = parser.astify(stmt);
      if (Array.isArray(ast)) ast = ast[0];
      
      if (ast.type === 'select' && Array.isArray(ast.from)) {
        ast.from.forEach(src => {
          if (src.table) {
            tables.push(src.as || src.table);
          }
        });
      }
    });
    
    return tables;
  } catch (e) {
    console.warn('Error extracting table aliases', e);
    return [];
  }
}

// For backward compatibility with non-module usage
window.sqlUtils = {
  addColumnToSelects,
  extractTableAliases
};