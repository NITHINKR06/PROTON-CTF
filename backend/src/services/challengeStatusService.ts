import { mainDb } from '../config/database.js';

// Define dummy flag
const DUMMY_FLAG = 'FLAG{YOU_FOUND_ME_BUT_TRY_HARDER}';

// Get dynamic flag from database
async function getDynamicFlag(): Promise<{ flag: string; points: number }> {
  const configStmt = mainDb.prepare('SELECT flag, points FROM challenge_config WHERE id = 1');
  const config = configStmt.get();
  
  if (config) {
    return { flag: config.flag, points: config.points };
  }
  
  // Fallback to default if not found
  return { 
    flag: 'FLAG{MASTER_SQL_INJECTION_2024}', 
    points: 500 
  };
}

// Track flag attempt
async function trackFlagAttempt(userId: number, flag: string, isDummy: boolean, isCorrect: boolean) {
  const stmt = mainDb.prepare(`
    INSERT INTO flag_attempts (user_id, flag_submitted, is_dummy, is_correct)
    VALUES (?, ?, ?, ?)
  `);
  
  stmt.run(userId, flag, isDummy ? 1 : 0, isCorrect ? 1 : 0);
}

// Get user's flag attempts
async function getUserFlagAttempts(userId: number) {
  const stmt = mainDb.prepare(`
    SELECT flag_submitted, is_dummy, is_correct, submitted_at
    FROM flag_attempts
    WHERE user_id = ?
    ORDER BY submitted_at DESC
  `);
  
  return stmt.all(userId);
}

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

  // Get dynamic flag configuration
  const { flag: correctFlag, points } = await getDynamicFlag();

  // Check if challenge is started
  const statusStmt = mainDb.prepare(`
    SELECT 
      started,
      start_time,
      completed,
      attempts,
      last_attempt_time
    FROM challenge_status
    WHERE user_id = ?
  `);
  
  const status = statusStmt.get(userId);
  
  if (!status || !status.started) {
    // Auto-start the challenge if not started
    await startChallengeForUser(userId);
    const newStatus = statusStmt.get(userId);
    if (!newStatus) {
      return {
        success: false,
        message: 'Failed to start challenge'
      };
    }
  }
  
  if (status && status.completed) {
    return {
      success: false,
      message: 'You have already completed this challenge'
    };
  }
  
  // Update attempt count
  const updateAttemptsStmt = mainDb.prepare(`
    UPDATE challenge_status
    SET 
      attempts = COALESCE(attempts, 0) + 1,
      last_attempt_time = ?
    WHERE user_id = ?
  `);
  
  const now = Date.now();
  updateAttemptsStmt.run(now, userId);
  
  // Check if it's the dummy flag
  if (flag.trim() === DUMMY_FLAG) {
    // Track dummy flag attempt
    await trackFlagAttempt(userId, flag, true, false);
    
    // Get previous attempts to see if they already tried the dummy
    const attempts = await getUserFlagAttempts(userId);
    const previousDummyAttempts = attempts.filter(a => a.is_dummy === 1).length;
    
    if (previousDummyAttempts === 1) {
      return {
        success: false,
        isDummy: true,
        message: '🎭 Nice try! But this is just a decoy flag. The real flag is hidden deeper. Look for clues in the admin_panel table about how sensitive data is protected.',
        hint: 'Check the cipher_method in admin_panel table'
      };
    } else if (previousDummyAttempts > 1) {
      return {
        success: false,
        isDummy: true,
        message: '🔍 You already found this dummy flag! The real flag is encrypted. Check system_internal_config table and remember the cipher method from admin_panel.',
        hint: 'ROT13 cipher is being used'
      };
    } else {
      return {
        success: false,
        isDummy: true,
        message: '🎯 Good job finding a flag! But wait... this seems too easy. This might be a decoy. Real hackers dig deeper. Try harder!',
        hint: 'Explore hidden tables'
      };
    }
  }
  
  // Check if flag is correct
  if (flag.trim() !== correctFlag) {
    // Track incorrect attempt
    await trackFlagAttempt(userId, flag, false, false);
    
    return {
      success: false,
      message: 'Incorrect flag. Keep trying!'
    };
  }
  
  // Track correct flag submission
  await trackFlagAttempt(userId, flag, false, true);
  
  // Flag is correct, mark as completed
  const timeTaken = now - (status?.start_time || now);
  
  // Update challenge status
  const updateStmt = mainDb.prepare(`
    UPDATE challenge_status
    SET 
      completed = 1,
      completion_time = ?,
      score = ?
    WHERE user_id = ?
  `);
  
  updateStmt.run(now, points, userId);
  
  // Add to scoreboard if not already there
  const checkScoreStmt = mainDb.prepare('SELECT user_id FROM scores WHERE user_id = ?');
  const existingScore = checkScoreStmt.get(userId);
  
  if (!existingScore) {
    const scoreStmt = mainDb.prepare(`
      INSERT INTO scores (user_id, points, solved_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `);
    
    scoreStmt.run(userId, points);
  }
  
  return {
    success: true,
    message: 'Congratulations! You have successfully completed the challenge!',
    completionTime: now,
    timeTaken: timeTaken,
    score: points
  };
}
