import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { auth } from '../middleware/auth.middleware';

const router = express.Router();

// 配置文件存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// 文件过滤器
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// 上传文件
router.post('/upload', auth, upload.single('file'), (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: '请选择文件' });
      return;
    }
    res.json({
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`,
    });
  } catch (error) {
    next(error);
  }
});

// 下载文件
router.get('/download/:filename', auth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = path.join(__dirname, '../../uploads', req.params.filename);
    res.download(file);
  } catch (error) {
    next(error);
  }
});

export default router; 