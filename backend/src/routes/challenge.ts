import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { queryLimiter, hintLimiter } from '../middleware/rateLimiter.js';
import { validate, querySchema, hintSchema } from '../middleware/validation.js';
import { executeUserQuery } from '../services/challengeService.js';
import { getHintsForUser, unlockHint } from '../services/hintService.js';
import { 
  startChallengeForUser, 
  getChallengeStatusForUser, 
  submitFlagForUser 
} from '../services/challengeStatusService.js';
import { z } from 'zod';

const router = Router();

// Submit SQL query
router.post('/query', authMiddleware, queryLimiter, validate(querySchema), async (req: AuthRequest, res) => {
  try {
    const { query } = req.body;
    const result = await executeUserQuery(req.user!.id, query);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get hints
router.get('/hints', authMiddleware, hintLimiter, (req: AuthRequest, res) => {
  try {
    const hints = getHintsForUser(req.user!.id);
    res.json({ hints });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Unlock hint
router.post('/hints/unlock', authMiddleware, hintLimiter, validate(hintSchema), (req: AuthRequest, res) => {
  try {
    const { hintId } = req.body;
    const hints = unlockHint(req.user!.id, hintId);
    res.json({ hints });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Start the challenge (start timing)
router.post('/start', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const result = await startChallengeForUser(req.user!.id);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get challenge status
router.get('/status', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const status = await getChallengeStatusForUser(req.user!.id);
    res.json(status);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Submit flag for verification
const flagSchema = z.object({
  flag: z.string().min(1),
});

router.post('/submit-flag', authMiddleware, validate(flagSchema), async (req: AuthRequest, res) => {
  try {
    const { flag } = req.body;
    const result = await submitFlagForUser(req.user!.id, flag);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;