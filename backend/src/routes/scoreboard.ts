import { Router } from 'express';
import { mainDb } from '../config/database.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    // Get all users who have started the challenge
    const stmt = mainDb.prepare(`
      SELECT 
        u.id,
        u.username,
        cs.started,
        cs.start_time,
        cs.completed,
        cs.completion_time,
        cs.score,
        cs.attempts,
        cs.last_attempt_time,
        s.points,
        s.solved_at
      FROM users u
      LEFT JOIN challenge_status cs ON u.id = cs.user_id
      LEFT JOIN scores s ON u.id = s.user_id
      WHERE cs.started = 1 OR s.user_id IS NOT NULL
      ORDER BY 
        cs.completed DESC,
        s.points DESC, 
        (CASE 
          WHEN cs.completion_time IS NOT NULL AND cs.start_time IS NOT NULL 
          THEN (cs.completion_time - cs.start_time) 
          ELSE 999999999 
        END) ASC,
        cs.attempts ASC,
        cs.start_time ASC
    `);

    const users = stmt.all() as any[];

    const scoreboard = users.map((user, index) => {
      let timeTaken = null;
      let status = 'not_started';
      
      if (user.completed) {
        status = 'completed';
        if (user.completion_time && user.start_time) {
          // Calculate time taken in seconds
          timeTaken = Math.floor((user.completion_time - user.start_time) / 1000);
        }
      } else if (user.started) {
        status = 'attempting';
        // Calculate current elapsed time for users still attempting
        if (user.start_time) {
          timeTaken = Math.floor((Date.now() - user.start_time) / 1000);
        }
      }
      
      return {
        rank: user.completed ? index + 1 : null,
        username: user.username,
        points: user.points || 0,
        solvedAt: user.solved_at,
        timeTaken,
        status,
        attempts: user.attempts || 0,
        lastAttempt: user.last_attempt_time
      };
    });

    res.json({ scoreboard });
  } catch (error: any) {
    console.error('Scoreboard error:', error);
    res.status(500).json({ error: 'Failed to fetch scoreboard' });
  }
});

export default router;