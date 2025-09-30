import { mainDb } from '../config/database.js';

// The correct flag
const CORRECT_FLAG = 'FLAG{SQL_INJECTION_MASTER_CHALLENGE_COMPLETE}';
const FLAG_POINTS = 500;

// Initialize tables function (will be called when needed)
async function ensureTablesExist() {
  // Make sure mainDb is initialized
  if (!mainDb) {
    console.error('Database not initialized yet');
    throw new Error('Database not initialized');
  }

  // Create challenge status table if it doesn't exist
  mainDb.exec(`
    CREATE TABLE IF NOT EXISTS challenge_status (
      user_id INTEGER PRIMARY KEY,
      started INTEGER DEFAULT 0,
      start_time INTEGER,
      completed INTEGER DEFAULT 0,
      completion_time INTEGER,
      score INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
}

export async function startChallengeForUser(userId: number) {
  // Make sure tables exist
  await ensureTablesExist();

  // Check if challenge already started
  const checkStmt = mainDb.prepare(`
    SELECT started, start_time, completed
    FROM challenge_status
    WHERE user_id = ?
  `);
  
  const status = checkStmt.get(userId);
  
  if (status && status.started && !status.completed) {
    // Challenge already started but not completed
    return {
      isStarted: true,
      startTime: status.start_time,
      message: 'Challenge already in progress'
    };
  }
  
  const now = Date.now();
  
  if (status && status.started) {
    // Update existing record
    const updateStmt = mainDb.prepare(`
      UPDATE challenge_status
      SET start_time = ?
      WHERE user_id = ?
    `);
    
    updateStmt.run(now, userId);
  } else {
    // Create new record
    const insertStmt = mainDb.prepare(`
      INSERT INTO challenge_status (user_id, started, start_time, completed)
      VALUES (?, 1, ?, 0)
    `);
    
    insertStmt.run(userId, now);
  }
  
  return {
    isStarted: true,
    startTime: now,
    message: 'Challenge started'
  };
}

export async function getChallengeStatusForUser(userId: number) {
  // Make sure tables exist
  await ensureTablesExist();

  const stmt = mainDb.prepare(`
    SELECT 
      started,
      start_time,
      completed,
      completion_time,
      score
    FROM challenge_status
    WHERE user_id = ?
  `);
  
  const status = stmt.get(userId);
  
  if (!status) {
    return {
      isStarted: false,
      startTime: null,
      completed: false,
      completionTime: null,
      score: null
    };
  }
  
  return {
    isStarted: Boolean(status.started),
    startTime: status.start_time,
    completed: Boolean(status.completed),
    completionTime: status.completion_time,
    score: status.score
  };
}

export async function submitFlagForUser(userId: number, flag: string) {
  // Make sure tables exist
  await ensureTablesExist();

  // Check if challenge is started
  const statusStmt = mainDb.prepare(`
    SELECT 
      started,
      start_time,
      completed
    FROM challenge_status
    WHERE user_id = ?
  `);
  
  const status = statusStmt.get(userId);
  
  if (!status || !status.started) {
    return {
      success: false,
      message: 'You need to start the challenge first'
    };
  }
  
  if (status.completed) {
    return {
      success: false,
      message: 'You have already completed this challenge'
    };
  }
  
  // Check if flag is correct
  if (flag.trim() !== CORRECT_FLAG) {
    return {
      success: false,
      message: 'Incorrect flag. Keep trying!'
    };
  }
  
  // Flag is correct, mark as completed
  const now = Date.now();
  const timeTaken = now - status.start_time;
  
  // Update challenge status
  const updateStmt = mainDb.prepare(`
    UPDATE challenge_status
    SET 
      completed = 1,
      completion_time = ?,
      score = ?
    WHERE user_id = ?
  `);
  
  updateStmt.run(now, FLAG_POINTS, userId);
  
  // Add to scoreboard if not already there
  const checkScoreStmt = mainDb.prepare('SELECT user_id FROM scores WHERE user_id = ?');
  const existingScore = checkScoreStmt.get(userId);
  
  if (!existingScore) {
    const scoreStmt = mainDb.prepare(`
      INSERT INTO scores (user_id, points, solved_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `);
    
    scoreStmt.run(userId, FLAG_POINTS);
  }
  
  return {
    success: true,
    message: 'Congratulations! You have successfully completed the challenge!',
    completionTime: now,
    timeTaken: timeTaken,
    score: FLAG_POINTS
  };
}