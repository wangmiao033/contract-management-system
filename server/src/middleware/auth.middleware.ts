import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';

interface JwtPayload {
  id: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: '未授权' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: '未授权' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: '未授权' });
  }
};

export const admin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: '需要管理员权限' });
  }
  next();
}; 