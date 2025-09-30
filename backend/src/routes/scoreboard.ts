import { Router } from 'express';
import { mainDb } from '../config/database.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const stmt = mainDb.prepare(`
      SELECT 
        u.username,
        s.points,
        s.solved_at,
        cs.start_time,
        cs.completion_time
      FROM scores s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN challenge_status cs ON s.user_id = cs.user_id
      ORDER BY s.points DESC, 
        (CASE WHEN cs.completion_time IS NULL OR cs.start_time IS NULL 
          THEN 999999999 
          ELSE (cs.completion_time - cs.start_time) / 1000 
        END) ASC
    `);

    const scores = stmt.all() as any[];

    const scoreboard = scores.map((score, index) => {
      let timeTaken = null;
      
      if (score.completion_time && score.start_time) {
        // Calculate time taken in seconds
        timeTaken = Math.floor((score.completion_time - score.start_time) / 1000);
      }
      
      return {
        rank: index + 1,
        username: score.username,
        points: score.points,
        solvedAt: score.solved_at,
        timeTaken
      };
    });

    res.json({ scoreboard });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch scoreboard' });
  }
});

export default router;