import { Router } from 'express';
import { adminMiddleware } from '../middleware/adminAuth.js';
import { AuthRequest } from '../middleware/auth.js';
import { mainDb } from '../config/database.js';
import { z } from 'zod';

const router = Router();

// Schema for flag update
const updateFlagSchema = z.object({
  flag: z.string().min(1).regex(/^FLAG\{.+\}$/, 'Flag must be in format FLAG{...}'),
  points: z.number().min(1).optional(),
});

// Get current flag configuration
router.get('/flag', adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const stmt = mainDb.prepare('SELECT flag, points, updated_at FROM challenge_config WHERE id = 1');
    const config = stmt.get();
    
    if (!config) {
      return res.status(404).json({ error: 'Flag configuration not found' });
    }
    
    res.json(config);
  } catch (error: any) {
    console.error('Error fetching flag config:', error);
    res.status(500).json({ error: 'Failed to fetch flag configuration' });
  }
});

// Update flag configuration
router.put('/flag', adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const { flag, points } = updateFlagSchema.parse(req.body);
    
    // Update the flag configuration
    const updateStmt = mainDb.prepare(`
      UPDATE challenge_config 
      SET flag = ?, 
          points = COALESCE(?, points),
          updated_at = CURRENT_TIMESTAMP,
          updated_by = ?
      WHERE id = 1
    `);
    
    updateStmt.run(flag, points || null, req.user!.id);
    
    // Get the updated configuration
    const stmt = mainDb.prepare('SELECT flag, points, updated_at FROM challenge_config WHERE id = 1');
    const updatedConfig = stmt.get();
    
    res.json({
      success: true,
      message: 'Flag configuration updated successfully',
      config: updatedConfig
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid input', 
        details: error.errors 
      });
    }
    
    console.error('Error updating flag config:', error);
    res.status(500).json({ error: 'Failed to update flag configuration' });
  }
});

export default router;
