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
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Chip,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import api from '../utils/axios';

interface User {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  createdAt: string;
}

interface FormData {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    role: 'user' as 'admin' | 'user',
  });
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('获取用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        role: user.role,
      });
    } else {
      setSelectedUser(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'user' as 'admin' | 'user',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (selectedUser) {
        await api.put(`/users/${selectedUser._id}`, formData);
      } else {
        await api.post('/users', formData);
      }
      handleClose();
      fetchUsers();
    } catch (error) {
      console.error('保存用户失败:', error);
    }
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('确定要删除这个用户吗？')) {
      try {
        await api.delete(`/users/${userId}`);
        fetchUsers();
      } catch (error) {
        console.error('删除用户失败:', error);
      }
    }
  };

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
        <Typography variant="h4">用户管理</Typography>
        {user?.role === 'admin' && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            新建用户
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>用户名</TableCell>
              <TableCell>邮箱</TableCell>
              <TableCell>角色</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>创建时间</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role === 'admin' ? '管理员' : '普通用户'}
                    color={user.role === 'admin' ? 'primary' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.status === 'active' ? '启用' : '禁用'}
                    color={user.status === 'active' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleOpen(user)}
                    disabled={user.role === 'admin'}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(user._id)}
                    disabled={user.role === 'admin'}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {selectedUser ? '编辑用户' : '新建用户'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="用户名"
              name="username"
              value={formData.username}
              onChange={handleChange}
              margin="normal"
              disabled={!!selectedUser}
            />
            <TextField
              fullWidth
              label="邮箱"
              name="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              disabled={!!selectedUser}
            />
            <TextField
              fullWidth
              label="密码"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              helperText={selectedUser ? '留空表示不修改密码' : ''}
            />
            <TextField
              fullWidth
              select
              label="角色"
              name="role"
              value={formData.role}
              onChange={handleChange}
              margin="normal"
              disabled={user?.role !== 'admin'}
            >
              <MenuItem value="user">普通用户</MenuItem>
              <MenuItem value="admin">管理员</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>取消</Button>
          <Button onClick={handleSubmit} variant="contained">
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserList; 