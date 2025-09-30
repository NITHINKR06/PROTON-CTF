const MAX_QUERY_LENGTH = 500;
const BLOCKED_KEYWORDS = [
  'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER', 'TRUNCATE', 
  'REPLACE', 'PRAGMA', 'ATTACH', 'DETACH', 'VACUUM', 'ANALYZE', 'REINDEX',
  'SAVEPOINT', 'RELEASE', 'ROLLBACK', 'COMMIT', 'BEGIN', 'TRANSACTION'
];
const BLOCKED_FUNCTIONS = ['load_extension', 'readfile', 'writefile', 'char', 'load'];
const BLOCKED_TABLES = ['sqlite_master', 'sqlite_sequence', 'sqlite_stat1'];

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateSqlQuery(query: string): ValidationResult {
  // Check length
  if (query.length > MAX_QUERY_LENGTH) {
    return {
      valid: false,
      error: `Query too long. Maximum ${MAX_QUERY_LENGTH} characters allowed.`
    };
  }

  const upperQuery = query.toUpperCase();
  const lowerQuery = query.toLowerCase();

  // Check for blocked keywords
  for (const keyword of BLOCKED_KEYWORDS) {
    if (upperQuery.includes(keyword)) {
      return {
        valid: false,
        error: `Keyword '${keyword}' is not allowed.`
      };
    }
  }

  // Check for blocked functions
  for (const func of BLOCKED_FUNCTIONS) {
    if (lowerQuery.includes(func.toLowerCase())) {
      return {
        valid: false,
        error: `Function '${func}' is not allowed.`
      };
    }
  }

  // Check for blocked tables (case-insensitive)
  for (const table of BLOCKED_TABLES) {
    if (lowerQuery.includes(table.toLowerCase())) {
      return {
        valid: false,
        error: `Direct access to system tables is not allowed.`
      };
    }
  }

  // Must start with SELECT
  if (!upperQuery.trim().startsWith('SELECT')) {
    return {
      valid: false,
      error: 'Only SELECT queries are allowed.'
    };
  }

  // Block semicolons (prevent multiple statements)
  if (query.includes(';')) {
    return {
      valid: false,
      error: 'Multiple statements are not allowed.'
    };
  }

  // Block comments to prevent comment-based attacks
  if (query.includes('--') || query.includes('/*') || query.includes('*/')) {
    return {
      valid: false,
      error: 'Comments are not allowed in queries.'
    };
  }

  return { valid: true };
}