import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import contractRoutes from './routes/contract.routes';
import userRoutes from './routes/user.routes';

// 加载环境变量
dotenv.config();

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 数据库连接
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/contract-management';
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('数据库连接成功');
  })
  .catch((error) => {
    console.error('数据库连接失败:', error);
  });

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/users', userRoutes);

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: '服务器错误' });
});

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
}); 