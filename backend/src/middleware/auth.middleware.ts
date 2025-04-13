import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication token missing' });
    }
    
    // Special handling for demo token
    if (token === 'demo-token') {
      console.log('Demo token detected, granting access with demo user');
      
      // Attach demo user to request
      req.user = {
        id: 1,
        name: 'מנהל מערכת',
        email: 'admin@example.com',
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date()
      };
      
      return next();
    }
    
    // Verify token
    const secret = process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production';
    
    // @ts-ignore
    jwt.verify(token, secret, (err: Error | null, decoded: any) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }
      
      // Attach user to request
      req.user = decoded as User;
      next();
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Middleware to check if user has admin role
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  next();
};

/**
 * Middleware to check if user has manager role or higher
 */
export const isManager = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Manager access required' });
  }
  
  next();
};

/**
 * Middleware to check if user is accessing their own resource or has admin role
 */
export const isSelfOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  const userId = parseInt(req.params.id);
  
  if (isNaN(userId)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }
  
  if (req.user.id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  next();
};
