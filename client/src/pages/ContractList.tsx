import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Button,
  Menu,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';

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
}

const ContractList: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const response = await api.get('/contracts');
      setContracts(response.data);
    } catch (error) {
      console.error('获取合同列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    handleFilterClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'signed':
        return 'primary';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return '草稿';
      case 'pending':
        return '待审批';
      case 'approved':
        return '已审批';
      case 'signed':
        return '已签署';
      case 'rejected':
        return '已拒绝';
      default:
        return status;
    }
  };

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">合同列表</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/contracts/new')}
        >
          新建合同
        </Button>
      </Box>

      <Box display="flex" gap={2} mb={3}>
        <TextField
          placeholder="搜索合同..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1 }}
        />
        <IconButton onClick={handleFilterClick}>
          <FilterIcon />
        </IconButton>
      </Box>

      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
      >
        <MenuItem onClick={() => handleStatusFilter('all')}>全部</MenuItem>
        <MenuItem onClick={() => handleStatusFilter('draft')}>草稿</MenuItem>
        <MenuItem onClick={() => handleStatusFilter('pending')}>待审批</MenuItem>
        <MenuItem onClick={() => handleStatusFilter('approved')}>已审批</MenuItem>
        <MenuItem onClick={() => handleStatusFilter('signed')}>已签署</MenuItem>
        <MenuItem onClick={() => handleStatusFilter('rejected')}>已拒绝</MenuItem>
      </Menu>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>合同编号</TableCell>
              <TableCell>合同名称</TableCell>
              <TableCell>合同类型</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>开始日期</TableCell>
              <TableCell>结束日期</TableCell>
              <TableCell>创建人</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredContracts.map((contract) => (
              <TableRow key={contract._id}>
                <TableCell>{contract.contractNumber}</TableCell>
                <TableCell>{contract.title}</TableCell>
                <TableCell>{contract.type}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(contract.status)}
                    color={getStatusColor(contract.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{new Date(contract.startDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(contract.endDate).toLocaleDateString()}</TableCell>
                <TableCell>{contract.createdBy.username}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => navigate(`/contracts/${contract._id}`)}
                  >
                    查看
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ContractList; 