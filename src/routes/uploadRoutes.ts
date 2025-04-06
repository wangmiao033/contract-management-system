import express from 'express';
import { upload } from '../middleware/upload';
import { auth } from '../middleware/auth';

const router = express.Router();

// 所有上传路由都需要认证
router.use(auth);

// 上传单个文件
router.post('/single', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '请选择要上传的文件' });
  }

  res.json({
    message: '文件上传成功',
    file: {
      name: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype
    }
  });
});

// 上传多个文件
router.post('/multiple', upload.array('files', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: '请选择要上传的文件' });
  }

  const files = (req.files as Express.Multer.File[]).map(file => ({
    name: file.originalname,
    path: file.path,
    size: file.size,
    mimetype: file.mimetype
  }));

  res.json({
    message: '文件上传成功',
    files
  });
});

export default router; 