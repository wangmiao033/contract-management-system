import express from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/userController';
import { auth } from '../middleware/auth';

const router = express.Router();

// 公开路由
router.post('/register', register);
router.post('/login', login);

// 需要认证的路由
router.get('/profile', auth, getProfile);
router.patch('/profile', auth, updateProfile);

export default router; 