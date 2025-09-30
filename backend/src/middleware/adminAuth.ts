import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';

export function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  // Check if user is authenticated
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Check if user is an admin
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  next();
}