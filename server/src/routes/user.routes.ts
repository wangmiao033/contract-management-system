import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { auth, admin } from '../middleware/auth.middleware';
import User from '../models/user.model';
import bcrypt from 'bcryptjs';

const router = express.Router();

// 获取所有用户
const getUsersHandler: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取单个用户
const getUserHandler: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    res.json(user);
  } catch (error) {
    console.error('获取用户详情错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 创建用户
const createUserHandler: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password, role } = req.body;

    // 检查用户是否已存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: '该邮箱已被注册' });
    }

    // 创建新用户
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role: role || 'user',
    });

    await user.save();
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('创建用户错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 更新用户
const updateUserHandler: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password, role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 更新用户信息
    if (username) user.username = username;
    if (email) user.email = email;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    if (role) user.role = role;

    await user.save();
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('更新用户错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 删除用户
const deleteUserHandler: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    res.json({ message: '用户已删除' });
  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

router.get('/', auth, admin, getUsersHandler);
router.get('/:id', auth, getUserHandler);
router.post('/', auth, admin, createUserHandler);
router.put('/:id', auth, admin, updateUserHandler);
router.delete('/:id', auth, admin, deleteUserHandler);

export default router; 