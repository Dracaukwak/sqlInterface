/**
 * Simplified Node SQL Parser for browser use
 * This is a minimal implementation to support the SQLab interface
 */
(function(root) {
    // Basic SQL token types
    const TOKEN_TYPES = {
      WHITESPACE: 'WHITESPACE',
      WORD: 'WORD',
      STRING: 'STRING',
      OPERATOR: 'OPERATOR',
      COMMA: 'COMMA',
      PARENTHESIS: 'PARENTHESIS',
      STAR: 'STAR',
      COMMENT: 'COMMENT',
      SEMICOLON: 'SEMICOLON'
    };
  
    // Very basic lexer to tokenize SQL
    const tokenize = function(sql) {
      const tokens = [];
      let current = 0;
      
      while (current < sql.length) {
        let char = sql[current];
        
        // Handle whitespace
        if (/\s/.test(char)) {
          let value = '';
          
          while (/\s/.test(char) && current < sql.length) {
            value += char;
            char = sql[++current];
          }
          
          tokens.push({ type: TOKEN_TYPES.WHITESPACE, value });
          continue;
        }
        
        // Handle words/identifiers
        if (/[a-z0-9_]/i.test(char)) {
          let value = '';
          
          while (/[a-z0-9_]/i.test(char) && current < sql.length) {
            value += char;
            char = sql[++current];
          }
          
          tokens.push({ type: TOKEN_TYPES.WORD, value });
          continue;
        }
        
        // Handle strings
        if (char === "'" || char === '"') {
          const quote = char;
          let value = char;
          char = sql[++current];
          
          while (char !== quote && current < sql.length) {
            value += char;
            char = sql[++current];
          }
          
          // Add closing quote
          if (current < sql.length) {
            value += char;
            current++;
          }
          
          tokens.push({ type: TOKEN_TYPES.STRING, value });
          continue;
        }
        
        // Handle operators
        if (/[+\-*/%=<>!~&|^]/.test(char)) {
          let value = char;
          char = sql[++current];
          
          // Handle multi-char operators
          while (/[+\-*/%=<>!~&|^]/.test(char) && current < sql.length) {
            value += char;
            char = sql[++current];
          }
          
          tokens.push({ type: TOKEN_TYPES.OPERATOR, value });
          continue;
        }
        
        // Handle commas
        if (char === ',') {
          tokens.push({ type: TOKEN_TYPES.COMMA, value: ',' });
          current++;
          continue;
        }
        
        // Handle parentheses
        if (char === '(' || char === ')') {
          tokens.push({ type: TOKEN_TYPES.PARENTHESIS, value: char });
          current++;
          continue;
        }
        
        // Handle star
        if (char === '*') {
          tokens.push({ type: TOKEN_TYPES.STAR, value: '*' });
          current++;
          continue;
        }
        
        // Handle semicolon
        if (char === ';') {
          tokens.push({ type: TOKEN_TYPES.SEMICOLON, value: ';' });
          current++;
          continue;
        }
        
        // Skip any other character
        current++;
      }
      
      return tokens;
    };
  
    // Basic SQL parser
    const Parser = function() {
      this.astify = function(sql, options) {
        // This is a very simplified parser that only
        // extracts the basic structure of a SELECT statement
        
        const tokens = tokenize(sql);
        
        // Find the position of the FROM keyword
        let selectEndPos = -1;
        let fromPos = -1;
        
        for (let i = 0; i < tokens.length; i++) {
          const token = tokens[i];
          if (token.type === TOKEN_TYPES.WORD && 
              token.value.toUpperCase() === 'FROM') {
            fromPos = i;
            break;
          }
        }
        
        // If we found FROM, set selectEndPos to the token before it
        if (fromPos > 0) {
          selectEndPos = fromPos - 1;
          
          // Skip any whitespace before FROM
          while (selectEndPos > 0 && 
                 tokens[selectEndPos].type === TOKEN_TYPES.WHITESPACE) {
            selectEndPos--;
          }
        }
        
        // Reconstruct the token position info
        let currentPos = 0;
        const tokenPositions = tokens.map(token => {
          const startPos = currentPos;
          currentPos += token.value.length;
          return {
            token,
            start: startPos,
            end: currentPos
          };
        });
        
        // Find the last column in the SELECT clause
        let lastColumn = null;
        if (selectEndPos > 0) {
          lastColumn = {
            type: 'column_ref',
            loc: {
              end: {
                offset: tokenPositions[selectEndPos].end
              }
            }
          };
        }
        
        // Create a very simplified AST
        return {
          type: 'select',
          columns: lastColumn ? [lastColumn] : [],
          from: [],
          _tokenPositions: tokenPositions
        };
      };
    };
  
    // Export the Parser as a global
    root.NodeSQLParser = {
      Parser: Parser
    };
  })(typeof self !== 'undefined' ? self : this);