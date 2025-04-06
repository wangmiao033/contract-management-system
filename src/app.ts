import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import userRoutes from './routes/userRoutes';
import contractRoutes from './routes/contractRoutes';
import uploadRoutes from './routes/uploadRoutes';

// 加载环境变量
dotenv.config();

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 路由
app.use('/api/users', userRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/upload', uploadRoutes);

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

// 连接MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/contract-management';
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('已连接到MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB连接错误:', error);
  });

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
}); 