import mongoose from 'mongoose';
import { User } from './models/user.model';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/contract-management';

async function initDb() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('数据库连接成功');

    // 检查是否已存在管理员用户
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    if (!adminExists) {
      // 创建管理员用户
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = new User({
        username: 'Admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
      });
      await admin.save();
      console.log('管理员用户创建成功');
    }

    // 检查是否已存在测试用户
    const userExists = await User.findOne({ email: 'user@example.com' });
    if (!userExists) {
      // 创建测试用户
      const hashedPassword = await bcrypt.hash('user123', 10);
      const user = new User({
        username: 'Test User',
        email: 'user@example.com',
        password: hashedPassword,
        role: 'user',
      });
      await user.save();
      console.log('测试用户创建成功');
    }

    console.log('数据库初始化完成');
    process.exit(0);
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  }
}

initDb(); 