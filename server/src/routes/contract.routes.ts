import { Router } from 'express';
import { Request, Response } from 'express';
import { Contract } from '../models/contract.model';

const router = Router();

// 获取所有合同
router.get('/', async (req: Request, res: Response) => {
  try {
    const contracts = await Contract.find().populate('createdBy', 'username');
    res.json(contracts);
  } catch (error) {
    console.error('获取合同列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取单个合同
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('createdBy', 'username')
      .populate('approvers.user', 'username')
      .populate('signatures.user', 'username');

    if (!contract) {
      return res.status(404).json({ message: '合同不存在' });
    }

    res.json(contract);
  } catch (error) {
    console.error('获取合同详情错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 创建合同
router.post('/', async (req: Request, res: Response) => {
  try {
    const contract = new Contract({
      ...req.body,
      createdBy: req.user._id, // 从认证中间件获取
      status: 'draft',
    });

    await contract.save();
    res.status(201).json(contract);
  } catch (error) {
    console.error('创建合同错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新合同
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) {
      return res.status(404).json({ message: '合同不存在' });
    }

    // 只有创建者或管理员可以更新合同
    if (contract.createdBy.toString() !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权限更新此合同' });
    }

    Object.assign(contract, req.body);
    await contract.save();
    res.json(contract);
  } catch (error) {
    console.error('更新合同错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 审批合同
router.post('/:id/approve', async (req: Request, res: Response) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) {
      return res.status(404).json({ message: '合同不存在' });
    }

    const approver = contract.approvers.find(
      (a) => a.user.toString() === req.user._id
    );

    if (!approver) {
      return res.status(403).json({ message: '您不是此合同的审批人' });
    }

    approver.status = 'approved';
    approver.comment = req.body.comment;
    approver.approvedAt = new Date();

    // 检查是否所有审批人都已审批
    const allApproved = contract.approvers.every((a) => a.status === 'approved');
    if (allApproved) {
      contract.status = 'approved';
    }

    await contract.save();
    res.json(contract);
  } catch (error) {
    console.error('审批合同错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 签署合同
router.post('/:id/sign', async (req: Request, res: Response) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) {
      return res.status(404).json({ message: '合同不存在' });
    }

    if (contract.status !== 'approved') {
      return res.status(400).json({ message: '合同尚未审批通过' });
    }

    const signature = {
      user: req.user._id,
      signedAt: new Date(),
    };

    contract.signatures.push(signature);
    contract.status = 'signed';
    await contract.save();
    res.json(contract);
  } catch (error) {
    console.error('签署合同错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

export default router; 