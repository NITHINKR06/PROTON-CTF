import { Router } from 'express';
import { registerUser, loginUser } from '../services/authService.js';
import { generateToken } from '../utils/jwt.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validate, registerSchema, loginSchema } from '../middleware/validation.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await registerUser(username, email, password);
    const token = generateToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ user, token });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', authLimiter, validate(loginSchema), async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
    const user = await loginUser(usernameOrEmail, password);
    const token = generateToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ user, token });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

router.get('/me', authMiddleware, (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

export default router;