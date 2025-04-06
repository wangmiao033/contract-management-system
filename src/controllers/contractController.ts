import { Request, Response } from 'express';
import { Contract } from '../models/Contract';
import { User } from '../models/User';

export const createContract = async (req: Request, res: Response) => {
  try {
    const contract = new Contract({
      ...req.body,
      createdBy: req.user._id
    });

    await contract.save();
    res.status(201).json(contract);
  } catch (error) {
    res.status(500).json({ error: '创建合同失败' });
  }
};

export const getContracts = async (req: Request, res: Response) => {
  try {
    const contracts = await Contract.find()
      .populate('createdBy', 'username email')
      .populate('approvers.user', 'username email')
      .populate('signatures.user', 'username email')
      .sort({ createdAt: -1 });

    res.json(contracts);
  } catch (error) {
    res.status(500).json({ error: '获取合同列表失败' });
  }
};

export const getContractById = async (req: Request, res: Response) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('createdBy', 'username email')
      .populate('approvers.user', 'username email')
      .populate('signatures.user', 'username email');

    if (!contract) {
      return res.status(404).json({ error: '合同不存在' });
    }

    res.json(contract);
  } catch (error) {
    res.status(500).json({ error: '获取合同详情失败' });
  }
};

export const updateContract = async (req: Request, res: Response) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) {
      return res.status(404).json({ error: '合同不存在' });
    }

    // 只有创建者或管理员可以修改合同
    if (contract.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: '没有权限修改此合同' });
    }

    Object.assign(contract, req.body);
    contract.updatedAt = new Date();
    await contract.save();

    res.json(contract);
  } catch (error) {
    res.status(500).json({ error: '更新合同失败' });
  }
};

export const deleteContract = async (req: Request, res: Response) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) {
      return res.status(404).json({ error: '合同不存在' });
    }

    // 只有创建者或管理员可以删除合同
    if (contract.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: '没有权限删除此合同' });
    }

    await Contract.deleteOne({ _id: req.params.id });
    res.json({ message: '合同已删除' });
  } catch (error) {
    res.status(500).json({ error: '删除合同失败' });
  }
};

export const approveContract = async (req: Request, res: Response) => {
  try {
    const { comment } = req.body;
    const contract = await Contract.findById(req.params.id);
    if (!contract) {
      return res.status(404).json({ error: '合同不存在' });
    }

    // 检查用户是否是审批人
    const approverIndex = contract.approvers.findIndex(
      approver => approver.user.toString() === req.user._id.toString()
    );

    if (approverIndex === -1) {
      return res.status(403).json({ error: '您不是此合同的审批人' });
    }

    // 更新审批状态
    contract.approvers[approverIndex].status = 'approved';
    contract.approvers[approverIndex].comment = comment;
    contract.approvers[approverIndex].date = new Date();

    // 检查是否所有审批人都已审批
    const allApproved = contract.approvers.every(approver => approver.status === 'approved');
    if (allApproved) {
      contract.status = 'approved';
    }

    await contract.save();
    res.json(contract);
  } catch (error) {
    res.status(500).json({ error: '审批合同失败' });
  }
};

export const signContract = async (req: Request, res: Response) => {
  try {
    const { signature } = req.body;
    const contract = await Contract.findById(req.params.id);
    if (!contract) {
      return res.status(404).json({ error: '合同不存在' });
    }

    // 检查合同状态是否为已审批
    if (contract.status !== 'approved') {
      return res.status(400).json({ error: '合同尚未完成审批' });
    }

    // 添加签名
    contract.signatures.push({
      user: req.user._id,
      date: new Date(),
      signature
    });

    // 检查是否所有相关方都已签名
    const allSigned = contract.parties.length === contract.signatures.length;
    if (allSigned) {
      contract.status = 'signed';
    }

    await contract.save();
    res.json(contract);
  } catch (error) {
    res.status(500).json({ error: '签署合同失败' });
  }
}; 