import { mainDb } from '../config/database.js';

export async function logQuery(
  userId: number, 
  query: string, 
  executionTime: number, 
  rowCount: number,
  flagFound: boolean = false
) {
  const stmt = mainDb.prepare(`
    INSERT INTO query_logs (user_id, query, execution_time, row_count, flag_found)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  stmt.run(userId, query, executionTime, rowCount, flagFound ? 1 : 0);
}

export async function getQueryLogsForUser(userId: number) {
  const stmt = mainDb.prepare(`
    SELECT 
      id,
      query,
      execution_time,
      row_count,
      flag_found,
      created_at
    FROM query_logs
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 1000
  `);
  
  return stmt.all(userId);
}

export async function getAllQueryLogs(limit: number = 1000, page: number = 1, filterFlagFound: boolean | null = null) {
  const offset = (page - 1) * limit;
  
  let query = `
    SELECT 
      ql.id,
      ql.user_id,
      u.username,
      ql.query,
      ql.execution_time,
      ql.row_count,
      ql.flag_found,
      ql.created_at
    FROM query_logs ql
    JOIN users u ON ql.user_id = u.id
  `;
  
  if (filterFlagFound !== null) {
    query += ` WHERE ql.flag_found = ${filterFlagFound ? 1 : 0}`;
  }
  
  query += `
    ORDER BY ql.created_at DESC
    LIMIT ? OFFSET ?
  `;
  
  const stmt = mainDb.prepare(query);
  return stmt.all(limit, offset);
}

export async function getQueryStats() {
  const totalStmt = mainDb.prepare(`SELECT COUNT(*) as total FROM query_logs`);
  const total = totalStmt.get().total;
  
  const flagFoundStmt = mainDb.prepare(`SELECT COUNT(*) as total FROM query_logs WHERE flag_found = 1`);
  const flagFound = flagFoundStmt.get().total;
  
  const userCountStmt = mainDb.prepare(`SELECT COUNT(DISTINCT user_id) as total FROM query_logs`);
  const userCount = userCountStmt.get().total;
  
  const avgTimeStmt = mainDb.prepare(`SELECT AVG(execution_time) as avg FROM query_logs`);
  const avgTime = avgTimeStmt.get().avg || 0;
  
  return {
    totalQueries: total,
    flagFoundQueries: flagFound,
    uniqueUsers: userCount,
    averageExecutionTime: avgTime
  };
}