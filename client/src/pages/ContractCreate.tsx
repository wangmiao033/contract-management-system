import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  MenuItem,
} from '@mui/material';
import { createContract } from '../store/slices/contractSlice';

const ContractCreate: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState({
    title: '',
    contractNumber: '',
    type: '',
    content: '',
    startDate: '',
    endDate: '',
    parties: [{ name: '', type: '', contact: '' }],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePartyChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const newParties = [...prev.parties];
      newParties[index] = { ...newParties[index], [field]: value };
      return { ...prev, parties: newParties };
    });
  };

  const addParty = () => {
    setFormData((prev) => ({
      ...prev,
      parties: [...prev.parties, { name: '', type: '', contact: '' }],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(createContract(formData));
      navigate('/contracts');
    } catch (error) {
      console.error('创建合同失败:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          创建新合同
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="合同标题"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="合同编号"
                name="contractNumber"
                value={formData.contractNumber}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="合同类型"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <MenuItem value="purchase">采购合同</MenuItem>
                <MenuItem value="sales">销售合同</MenuItem>
                <MenuItem value="service">服务合同</MenuItem>
                <MenuItem value="employment">劳动合同</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="开始日期"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="结束日期"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="合同内容"
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                相关方
              </Typography>
              {formData.parties.map((party, index) => (
                <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="名称"
                      value={party.name}
                      onChange={(e) => handlePartyChange(index, 'name', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      select
                      label="类型"
                      value={party.type}
                      onChange={(e) => handlePartyChange(index, 'type', e.target.value)}
                      required
                    >
                      <MenuItem value="client">客户</MenuItem>
                      <MenuItem value="supplier">供应商</MenuItem>
                      <MenuItem value="employee">员工</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="联系方式"
                      value={party.contact}
                      onChange={(e) => handlePartyChange(index, 'contact', e.target.value)}
                      required
                    />
                  </Grid>
                </Grid>
              ))}
              <Button variant="outlined" onClick={addParty}>
                添加相关方
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary">
                创建合同
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default ContractCreate; 