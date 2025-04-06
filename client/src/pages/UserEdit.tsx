import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  MenuItem,
  Alert,
} from '@mui/material';
import api from '../utils/axios';

interface User {
  _id: string;
  username: string;
  email: string;
  password?: string;
  role: string;
  department: string;
  position: string;
}

const UserEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User>({
    _id: '',
    username: '',
    email: '',
    password: '',
    role: 'user',
    department: '',
    position: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await api.get(`/users/${id}`);
      setUser({ ...response.data, password: '' });
    } catch (error: any) {
      setError(error.response?.data?.message || '获取用户信息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userData = { ...user };
      if (!userData.password) {
        delete userData.password;
      }

      if (id) {
        await api.put(`/users/${id}`, userData);
      } else {
        await api.post('/users', userData);
      }
      navigate('/users');
    } catch (error: any) {
      setError(error.response?.data?.message || '保存用户失败');
    }
  };

  if (loading) {
    return <Typography>加载中...</Typography>;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {id ? '编辑用户' : '新建用户'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="用户名"
                  name="username"
                  value={user.username}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="邮箱"
                  name="email"
                  type="email"
                  value={user.email}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="密码"
                  name="password"
                  type="password"
                  value={user.password}
                  onChange={handleChange}
                  required={!id}
                  helperText={id ? '留空表示不修改密码' : ''}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="角色"
                  name="role"
                  select
                  value={user.role}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="admin">管理员</MenuItem>
                  <MenuItem value="user">普通用户</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="部门"
                  name="department"
                  value={user.department}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="职位"
                  name="position"
                  value={user.position}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/users')}
                  >
                    取消
                  </Button>
                  <Button type="submit" variant="contained">
                    保存
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default UserEdit; 