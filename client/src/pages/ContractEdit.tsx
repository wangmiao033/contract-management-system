import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  AttachFile as AttachIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../utils/axios';

interface Party {
  _id: string;
  name: string;
  type: string;
  contact: string;
}

interface Contract {
  _id: string;
  title: string;
  contractNumber: string;
  type: string;
  content: string;
  status: string;
  startDate: string;
  endDate: string;
  parties: Party[];
  attachments: string[];
}

const contractTypes = [
  '销售合同',
  '采购合同',
  '服务合同',
  '租赁合同',
  '劳动合同',
  '其他',
];

const validationSchema = Yup.object({
  title: Yup.string().required('请输入合同标题'),
  contractNumber: Yup.string().required('请输入合同编号'),
  type: Yup.string().required('请选择合同类型'),
  content: Yup.string().required('请输入合同内容'),
  startDate: Yup.date().required('请选择开始日期'),
  endDate: Yup.date()
    .required('请选择结束日期')
    .min(Yup.ref('startDate'), '结束日期不能早于开始日期'),
});

const ContractEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState<Contract | null>(null);
  const [newParty, setNewParty] = useState<Partial<Party>>({
    name: '',
    type: '',
    contact: '',
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (id) {
      fetchContract();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchContract = async () => {
    try {
      const response = await api.get(`/contracts/${id}`);
      setContract(response.data);
      formik.setValues({
        title: response.data.title,
        contractNumber: response.data.contractNumber,
        type: response.data.type,
        content: response.data.content,
        startDate: response.data.startDate.split('T')[0],
        endDate: response.data.endDate.split('T')[0],
      });
    } catch (error) {
      console.error('获取合同详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      title: '',
      contractNumber: '',
      type: '',
      content: '',
      startDate: '',
      endDate: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        formData.append('title', values.title);
        formData.append('contractNumber', values.contractNumber);
        formData.append('type', values.type);
        formData.append('content', values.content);
        formData.append('startDate', values.startDate);
        formData.append('endDate', values.endDate);
        formData.append('parties', JSON.stringify(contract?.parties || []));
        if (file) {
          formData.append('file', file);
        }

        if (id) {
          await api.put(`/contracts/${id}`, formData);
        } else {
          await api.post('/contracts', formData);
        }
        navigate('/contracts');
      } catch (error) {
        console.error('保存合同失败:', error);
      }
    },
  });

  const handleAddParty = () => {
    if (newParty.name && newParty.type && newParty.contact) {
      const updatedParties = [
        ...(contract?.parties || []),
        {
          _id: Date.now().toString(),
          name: newParty.name,
          type: newParty.type,
          contact: newParty.contact,
        },
      ];
      setContract((prev) => prev ? { ...prev, parties: updatedParties } : null);
      setNewParty({ name: '', type: '', contact: '' });
    }
  };

  const handleRemoveParty = (partyId: string) => {
    const updatedParties = contract?.parties.filter((p) => p._id !== partyId) || [];
    setContract((prev) => prev ? { ...prev, parties: updatedParties } : null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleRemoveAttachment = async (filename: string) => {
    try {
      await api.delete(`/files/${filename}`);
      const updatedAttachments = contract?.attachments.filter(
        (a) => a !== filename
      ) || [];
      setContract((prev) => prev ? { ...prev, attachments: updatedAttachments } : null);
    } catch (error) {
      console.error('删除附件失败:', error);
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
      <Typography variant="h4" gutterBottom>
        {id ? '编辑合同' : '新建合同'}
      </Typography>

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="合同标题"
                    name="title"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    error={formik.touched.title && Boolean(formik.errors.title)}
                    helperText={formik.touched.title && formik.errors.title}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="合同编号"
                    name="contractNumber"
                    value={formik.values.contractNumber}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.contractNumber &&
                      Boolean(formik.errors.contractNumber)
                    }
                    helperText={
                      formik.touched.contractNumber && formik.errors.contractNumber
                    }
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="合同类型"
                    name="type"
                    value={formik.values.type}
                    onChange={formik.handleChange}
                    error={formik.touched.type && Boolean(formik.errors.type)}
                    helperText={formik.touched.type && formik.errors.type}
                  >
                    {contractTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="开始日期"
                    name="startDate"
                    value={formik.values.startDate}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.startDate && Boolean(formik.errors.startDate)
                    }
                    helperText={formik.touched.startDate && formik.errors.startDate}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="结束日期"
                    name="endDate"
                    value={formik.values.endDate}
                    onChange={formik.handleChange}
                    error={formik.touched.endDate && Boolean(formik.errors.endDate)}
                    helperText={formik.touched.endDate && formik.errors.endDate}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={10}
                    label="合同内容"
                    name="content"
                    value={formik.values.content}
                    onChange={formik.handleChange}
                    error={formik.touched.content && Boolean(formik.errors.content)}
                    helperText={formik.touched.content && formik.errors.content}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                相关方
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="名称"
                    value={newParty.name}
                    onChange={(e) =>
                      setNewParty({ ...newParty, name: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="类型"
                    value={newParty.type}
                    onChange={(e) =>
                      setNewParty({ ...newParty, type: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="联系方式"
                    value={newParty.contact}
                    onChange={(e) =>
                      setNewParty({ ...newParty, contact: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleAddParty}
                  >
                    添加相关方
                  </Button>
                </Grid>
              </Grid>

              <List>
                {contract?.parties.map((party) => (
                  <ListItem
                    key={party._id}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveParty(party._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={party.name}
                      secondary={`${party.type} - ${party.contact}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                附件
              </Typography>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ mb: 2 }}
              >
                上传附件
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                />
              </Button>

              {file && (
                <Chip
                  label={file.name}
                  onDelete={() => setFile(null)}
                  sx={{ mb: 1 }}
                />
              )}

              <List>
                {contract?.attachments.map((attachment) => (
                  <ListItem
                    key={attachment}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveAttachment(attachment)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemIcon>
                      <AttachIcon />
                    </ListItemIcon>
                    <ListItemText primary={attachment} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button
                variant="outlined"
                onClick={() => navigate('/contracts')}
              >
                取消
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
              >
                保存
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default ContractEdit; 