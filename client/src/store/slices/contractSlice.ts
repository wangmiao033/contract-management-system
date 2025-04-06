import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

interface Contract {
  _id: string;
  title: string;
  contractNumber: string;
  type: string;
  status: 'draft' | 'pending' | 'approved' | 'signed' | 'rejected';
  startDate: string;
  endDate: string;
  createdBy: {
    username: string;
  };
  parties: Array<{
    name: string;
    type: string;
    contact: string;
  }>;
  approvers: Array<{
    user: {
      username: string;
    };
    status: 'pending' | 'approved' | 'rejected';
    comment?: string;
  }>;
  signatures: Array<{
    user: {
      username: string;
    };
    signedAt: string;
  }>;
  attachments: string[];
}

interface ContractState {
  contracts: Contract[];
  currentContract: Contract | null;
  loading: boolean;
  error: string | null;
}

const initialState: ContractState = {
  contracts: [],
  currentContract: null,
  loading: false,
  error: null,
};

// 获取合同列表
export const fetchContracts = createAsyncThunk(
  'contracts/fetchAll',
  async () => {
    const response = await api.get('/contracts');
    return response.data;
  }
);

// 获取单个合同
export const fetchContract = createAsyncThunk(
  'contracts/fetchOne',
  async (id: string) => {
    const response = await api.get(`/contracts/${id}`);
    return response.data;
  }
);

// 创建合同
export const createContract = createAsyncThunk(
  'contracts/create',
  async (contractData: Partial<Contract>) => {
    const response = await api.post('/contracts', contractData);
    return response.data;
  }
);

// 更新合同
export const updateContract = createAsyncThunk(
  'contracts/update',
  async ({ id, data }: { id: string; data: Partial<Contract> }) => {
    const response = await api.put(`/contracts/${id}`, data);
    return response.data;
  }
);

// 审批合同
export const approveContract = createAsyncThunk(
  'contracts/approve',
  async ({ id, comment }: { id: string; comment?: string }) => {
    const response = await api.post(`/contracts/${id}/approve`, { comment });
    return response.data;
  }
);

// 签署合同
export const signContract = createAsyncThunk(
  'contracts/sign',
  async (id: string) => {
    const response = await api.post(`/contracts/${id}/sign`);
    return response.data;
  }
);

const contractSlice = createSlice({
  name: 'contracts',
  initialState,
  reducers: {
    clearCurrentContract: (state) => {
      state.currentContract = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 获取合同列表
      .addCase(fetchContracts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContracts.fulfilled, (state, action) => {
        state.loading = false;
        state.contracts = action.payload;
      })
      .addCase(fetchContracts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取合同列表失败';
      })
      // 获取单个合同
      .addCase(fetchContract.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContract.fulfilled, (state, action) => {
        state.loading = false;
        state.currentContract = action.payload;
      })
      .addCase(fetchContract.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取合同详情失败';
      })
      // 创建合同
      .addCase(createContract.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createContract.fulfilled, (state, action) => {
        state.loading = false;
        state.contracts.push(action.payload);
      })
      .addCase(createContract.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '创建合同失败';
      })
      // 更新合同
      .addCase(updateContract.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateContract.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.contracts.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.contracts[index] = action.payload;
        }
        if (state.currentContract?._id === action.payload._id) {
          state.currentContract = action.payload;
        }
      })
      .addCase(updateContract.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '更新合同失败';
      })
      // 审批合同
      .addCase(approveContract.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveContract.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.contracts.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.contracts[index] = action.payload;
        }
        if (state.currentContract?._id === action.payload._id) {
          state.currentContract = action.payload;
        }
      })
      .addCase(approveContract.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '审批合同失败';
      })
      // 签署合同
      .addCase(signContract.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signContract.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.contracts.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.contracts[index] = action.payload;
        }
        if (state.currentContract?._id === action.payload._id) {
          state.currentContract = action.payload;
        }
      })
      .addCase(signContract.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '签署合同失败';
      });
  },
});

export const { clearCurrentContract } = contractSlice.actions;
export default contractSlice.reducer; 