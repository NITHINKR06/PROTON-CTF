import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/adminAuth.js';
import { 
  getAllQueryLogs, 
  getQueryStats 
} from '../services/queryLogService.js';
import { mainDb } from '../config/database.js';

const router = Router();

// Apply auth and admin middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// Get dashboard stats
router.get('/stats', async (req: AuthRequest, res) => {
  try {
    // Get query stats
    const queryStats = await getQueryStats();
    
    // Get user stats
    const userStmt = mainDb.prepare(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN is_admin = 1 THEN 1 ELSE 0 END) as admin_users
      FROM users
    `);
    const userStats = userStmt.get();
    
    // Get challenge stats
    const challengeStmt = mainDb.prepare(`
      SELECT 
        COUNT(*) as total_started,
        SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as total_completed
      FROM challenge_status
    `);
    const challengeStats = challengeStmt.get();
    
    // Get completion time stats
    const timeStmt = mainDb.prepare(`
      SELECT 
        AVG((completion_time - start_time) / 1000) as avg_completion_time,
        MIN((completion_time - start_time) / 1000) as min_completion_time,
        MAX((completion_time - start_time) / 1000) as max_completion_time
      FROM challenge_status
      WHERE completed = 1
    `);
    const timeStats = timeStmt.get();
    
    res.json({
      users: {
        total: userStats.total_users,
        admins: userStats.admin_users
      },
      challenges: {
        started: challengeStats.total_started,
        completed: challengeStats.total_completed,
        completion_rate: challengeStats.total_started > 0 
          ? (challengeStats.total_completed / challengeStats.total_started) * 100 
          : 0
      },
      completionTime: {
        average: timeStats.avg_completion_time || 0,
        fastest: timeStats.min_completion_time || 0,
        slowest: timeStats.max_completion_time || 0
      },
      queries: queryStats
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users
router.get('/users', async (req: AuthRequest, res) => {
  try {
    const stmt = mainDb.prepare(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.created_at,
        u.is_admin,
        cs.started,
        cs.start_time,
        cs.completed,
        cs.completion_time,
        cs.score,
        (SELECT COUNT(*) FROM query_logs ql WHERE ql.user_id = u.id) as query_count,
        (SELECT COUNT(*) FROM query_logs ql WHERE ql.user_id = u.id AND ql.flag_found = 1) as flag_found_count
      FROM users u
      LEFT JOIN challenge_status cs ON u.id = cs.user_id
      ORDER BY u.created_at DESC
    `);
    
    const users = stmt.all();
    res.json({ users });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get user details with queries
router.get('/users/:userId', async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Get user details
    const userStmt = mainDb.prepare(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.created_at,
        u.is_admin,
        cs.started,
        cs.start_time,
        cs.completed,
        cs.completion_time,
        cs.score
      FROM users u
      LEFT JOIN challenge_status cs ON u.id = cs.user_id
      WHERE u.id = ?
    `);
    
    const user = userStmt.get(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get user queries
    const queryStmt = mainDb.prepare(`
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
      LIMIT 100
    `);
    
    const queries = queryStmt.all(userId);
    
    // Get hint status
    const hintStmt = mainDb.prepare(`
      SELECT 
        hints_opened,
        first_hint_opened_at,
        second_hint_opened_at
      FROM hint_states
      WHERE user_id = ?
    `);
    
    const hintState = hintStmt.get(userId) || {
      hints_opened: '[]',
      first_hint_opened_at: null,
      second_hint_opened_at: null
    };
    
    res.json({
      user,
      queries,
      hintState: {
        hintsOpened: JSON.parse(hintState.hints_opened),
        firstHintOpenedAt: hintState.first_hint_opened_at,
        secondHintOpenedAt: hintState.second_hint_opened_at
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all queries with pagination
router.get('/queries', async (req: AuthRequest, res) => {
  try {
    const limit = parseInt(req.query.limit as string || '100');
    const page = parseInt(req.query.page as string || '1');
    const flagFound = req.query.flagFound !== undefined 
      ? req.query.flagFound === 'true' 
      : null;
    
    const logs = await getAllQueryLogs(limit, page, flagFound);
    
    res.json({ logs });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get settings
router.get('/settings', async (req: AuthRequest, res) => {
  try {
    const stmt = mainDb.prepare(`SELECT key, value, description FROM admin_settings`);
    const settings = stmt.all();
    
    // Convert to object
    const settingsObj = settings.reduce((acc: any, setting: any) => {
      acc[setting.key] = {
        value: setting.value,
        description: setting.description
      };
      return acc;
    }, {});
    
    res.json({ settings: settingsObj });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update setting
router.post('/settings/:key', async (req: AuthRequest, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    if (!value) {
      return res.status(400).json({ error: 'Value is required' });
    }
    
    // Check if setting exists
    const checkStmt = mainDb.prepare(`SELECT key FROM admin_settings WHERE key = ?`);
    const exists = checkStmt.get(key);
    
    if (!exists) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    
    // Update setting
    const updateStmt = mainDb.prepare(`UPDATE admin_settings SET value = ? WHERE key = ?`);
    updateStmt.run(value, key);
    
    res.json({ 
      success: true, 
      message: 'Setting updated successfully',
      key,
      value
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;