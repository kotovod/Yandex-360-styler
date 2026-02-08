import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export interface AuthRequest extends Request {
  userId?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    console.log('🔐 Auth middleware:', {
      hasHeader: !!authHeader,
      header: authHeader?.substring(0, 20) + '...',
      jwtSecret: config.jwtSecret.substring(0, 10) + '...'
    });
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No auth header or wrong format');
      return res.status(401).json({ error: 'Не авторизован' });
    }

    const token = authHeader.substring(7);
    console.log('🔑 Token to verify:', token.substring(0, 20) + '...');
    
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
    console.log('✅ Token verified, userId:', decoded.userId);
    
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.log('❌ Token verification failed:', error);
    return res.status(401).json({ error: 'Недействительный токен' });
  }
}
