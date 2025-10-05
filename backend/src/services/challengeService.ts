import { getUserChallengeDb } from '../config/database.js';
import { mainDb } from '../config/database.js';
import { validateSqlQuery } from '../utils/sqlValidator.js';
import { logQuery } from '../services/queryLogService.js';
import type { QueryResult } from '../types/index.js';

const FLAG_PATTERN = /FLAG\{[^}]+\}/i;
const CAESAR_FLAG_PATTERN = /SYNT\{[^}]+\}/i;  // ROT13 version of FLAG
const FLAG_POINTS = 500;
const MAX_ROWS = 100;
const QUERY_TIMEOUT = 5000;
const CORRECT_FLAG = 'FLAG{MASTER_SQL_INJECTION_2024}';
const CORRECT_FLAG_ROT13 = 'SYNT{ZNFGRE_FDY_VARWPGVBA_2024}';
const DUMMY_FLAG = 'FLAG{YOU_FOUND_ME_BUT_TRY_HARDER}';

export async function executeUserQuery(userId: number, query: string): Promise<QueryResult> {
  const validation = validateSqlQuery(query);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const userDb = await getUserChallengeDb(userId);
  const startTime = Date.now();

  try {
    const result = await Promise.race([
      executeQuery(userDb, query),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), QUERY_TIMEOUT)
      ),
    ]);

    const executionTime = Date.now() - startTime;
    const flagFound = checkForFlag(result.rows);

    // Log the query
    await logQuery(
      userId, 
      query, 
      executionTime, 
      result.rowCount,
      flagFound
    );

    if (flagFound) {
      await awardPoints(userId);
    }

    return {
      ...result,
      executionTime,
      flagFound,
      points: flagFound ? FLAG_POINTS : undefined,
    };
  } catch (error: any) {
    // Log failed query attempts too
    try {
      await logQuery(userId, query, 0, 0, false);
    } catch (logError) {
      console.error('Failed to log query error:', logError);
    }
    
    throw new Error(error.message || 'Query execution failed');
  }
}

// ... rest of the file remains the same

function executeQuery(db: any, query: string): Promise<{ columns: string[]; rows: any[][]; rowCount: number }> {
  return new Promise((resolve, reject) => {
    try {
      const result = db.prepare(query).all();
      const limitedRows = result.slice(0, MAX_ROWS);

      if (limitedRows.length === 0) {
        return resolve({ columns: [], rows: [], rowCount: 0 });
      }

      const columns = Object.keys(limitedRows[0]);
      const rowsArray = limitedRows.map((row: any) => columns.map(col => row[col]));

      resolve({
        columns,
        rows: rowsArray,
        rowCount: limitedRows.length,
      });
    } catch (error: any) {
      reject(new Error(`SQL Error: ${error.message}`));
    }
  });
}

function checkForFlag(rows: any[][]): boolean {
  // Check for the complete decoded flag or Caesar cipher version
  for (const row of rows) {
    for (const cell of row) {
      if (cell && typeof cell === 'string') {
        // Check for the exact correct flag
        if (cell === CORRECT_FLAG) {
          return true;
        }
        // Check for the ROT13 encoded flag (they found it but didn't decode)
        if (cell === CORRECT_FLAG_ROT13) {
          return true;
        }
        // Check for the dummy flag
        if (cell === DUMMY_FLAG) {
          return true;
        }
        // Also check if they managed to decode it correctly
        if (FLAG_PATTERN.test(cell) && cell.includes('MASTER_SQL_INJECTION_2024')) {
          return true;
        }
        // Check for Caesar cipher pattern
        if (CAESAR_FLAG_PATTERN.test(cell) && cell.includes('ZNFGRE_FDY_VARWPGVBA_2024')) {
          return true;
        }
      }
    }
  }
  return false;
}

async function awardPoints(userId: number): Promise<void> {
  const checkStmt = mainDb.prepare('SELECT user_id FROM scores WHERE user_id = ?');
  const existing = checkStmt.get(userId);

  if (existing) {
    return;
  }

  const stmt = mainDb.prepare(`
    INSERT INTO scores (user_id, points, solved_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
  `);

  stmt.run(userId, FLAG_POINTS);
}