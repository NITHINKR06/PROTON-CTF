import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import type { UserSession } from '../types/index.js';

export interface AuthRequest extends Request {
  user?: UserSession;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  // Check for token in cookies first
  let token = req.cookies.token;
  
  // If not in cookies, check Authorization header
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const user = verifyToken(token);

  if (!user) {
    res.clearCookie('token');
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = user;
  next();
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  // Check for token in cookies first
  let token = req.cookies.token;
  
  // If not in cookies, check Authorization header
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (token) {
    const user = verifyToken(token);
    if (user) {
      req.user = user;
    }
  }

  next();
}