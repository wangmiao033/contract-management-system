import express from 'express';
import {
  createContract,
  getContracts,
  getContractById,
  updateContract,
  deleteContract,
  approveContract,
  signContract
} from '../controllers/contractController';
import { auth } from '../middleware/auth';

const router = express.Router();

// 所有合同路由都需要认证
router.use(auth);

// 合同CRUD操作
router.post('/', createContract);
router.get('/', getContracts);
router.get('/:id', getContractById);
router.patch('/:id', updateContract);
router.delete('/:id', deleteContract);

// 合同审批和签署
router.post('/:id/approve', approveContract);
router.post('/:id/sign', signContract);

export default router; 