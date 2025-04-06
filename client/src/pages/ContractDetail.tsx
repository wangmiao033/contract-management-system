import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  CheckCircle as ApprovedIcon,
  Warning as PendingIcon,
  Description as ContractIcon,
  AttachFile as AttachIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import api from '../utils/axios';

interface Party {
  _id: string;
  name: string;
  type: string;
  contact: string;
}

interface Approver {
  _id: string;
  user: {
    username: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  updatedAt: string;
}

interface Signature {
  _id: string;
  user: {
    username: string;
  };
  signedAt: string;
}

interface Contract {
  _id: string;
  title: string;
  contractNumber: string;
  type: string;
  content: string;
  status: 'draft' | 'pending' | 'approved' | 'signed' | 'rejected';
  startDate: string;
  endDate: string;
  createdBy: {
    username: string;
  };
  parties: Party[];
  approvers: Approver[];
  signatures: Signature[];
  attachments: string[];
}

const ContractDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [signDialogOpen, setSignDialogOpen] = useState(false);
  const [comment, setComment] = useState('');
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    fetchContract();
  }, [id]);

  const fetchContract = async () => {
    try {
      const response = await api.get(`/contracts/${id}`);
      setContract(response.data);
    } catch (error) {
      console.error('获取合同详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await api.post(`/contracts/${id}/approve`, { comment });
      setApproveDialogOpen(false);
      fetchContract();
    } catch (error) {
      console.error('审批失败:', error);
    }
  };

  const handleSign = async () => {
    try {
      await api.post(`/contracts/${id}/sign`);
      setSignDialogOpen(false);
      fetchContract();
    } catch (error) {
      console.error('签署失败:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('确定要删除这个合同吗？')) {
      try {
        await api.delete(`/contracts/${id}`);
        navigate('/contracts');
      } catch (error) {
        console.error('删除失败:', error);
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

  if (!contract) {
    return (
      <Box p={3}>
        <Typography variant="h6">合同不存在</Typography>
      </Box>
    );
  }

  const isApprover = contract.approvers.some(
    (approver) => approver.user.username === user?.username
  );

  const isParty = contract.parties.some(
    (party) => party.contact === user?.email
  );

  const canApprove = isApprover && contract.status === 'pending';
  const canSign = isParty && contract.status === 'approved';

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">{contract.title}</Typography>
        <Box>
          {contract.status === 'draft' && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/contracts/${id}/edit`)}
              sx={{ mr: 1 }}
            >
              编辑
            </Button>
          )}
          {contract.status === 'draft' && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
            >
              删除
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* 合同基本信息 */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              合同内容
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {contract.content}
            </Typography>
          </Paper>
        </Grid>

        {/* 合同状态和操作 */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              合同信息
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="合同编号"
                  secondary={contract.contractNumber}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="合同类型"
                  secondary={contract.type}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="状态"
                  secondary={
                    <Chip
                      label={
                        contract.status === 'draft'
                          ? '草稿'
                          : contract.status === 'pending'
                          ? '待审批'
                          : contract.status === 'approved'
                          ? '已审批'
                          : contract.status === 'signed'
                          ? '已签署'
                          : '已拒绝'
                      }
                      color={
                        contract.status === 'draft'
                          ? 'default'
                          : contract.status === 'pending'
                          ? 'warning'
                          : contract.status === 'approved'
                          ? 'success'
                          : contract.status === 'signed'
                          ? 'primary'
                          : 'error'
                      }
                    />
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="开始日期"
                  secondary={new Date(contract.startDate).toLocaleDateString()}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="结束日期"
                  secondary={new Date(contract.endDate).toLocaleDateString()}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="创建人"
                  secondary={contract.createdBy.username}
                />
              </ListItem>
            </List>

            {canApprove && (
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => setApproveDialogOpen(true)}
                sx={{ mt: 2 }}
              >
                审批
              </Button>
            )}

            {canSign && (
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => setSignDialogOpen(true)}
                sx={{ mt: 2 }}
              >
                签署
              </Button>
            )}
          </Paper>
        </Grid>

        {/* 相关方 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              相关方
            </Typography>
            <List>
              {contract.parties.map((party) => (
                <ListItem key={party._id}>
                  <ListItemText
                    primary={party.name}
                    secondary={`${party.type} - ${party.contact}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* 审批记录 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              审批记录
            </Typography>
            <List>
              {contract.approvers.map((approver) => (
                <ListItem key={approver._id}>
                  <ListItemIcon>
                    {approver.status === 'approved' ? (
                      <ApprovedIcon color="success" />
                    ) : approver.status === 'rejected' ? (
                      <PendingIcon color="error" />
                    ) : (
                      <PendingIcon color="warning" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={approver.user.username}
                    secondary={
                      <>
                        <Typography component="span" variant="body2">
                          {approver.status === 'approved'
                            ? '已审批'
                            : approver.status === 'rejected'
                            ? '已拒绝'
                            : '待审批'}
                        </Typography>
                        {approver.comment && (
                          <Typography component="div" variant="body2">
                            备注: {approver.comment}
                          </Typography>
                        )}
                        <Typography component="div" variant="body2" color="text.secondary">
                          {new Date(approver.updatedAt).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* 附件 */}
        {contract.attachments.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                附件
              </Typography>
              <List>
                {contract.attachments.map((attachment, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <AttachIcon />
                    </ListItemIcon>
                    <ListItemText primary={attachment} />
                    <Button
                      size="small"
                      onClick={() => window.open(`/api/files/${attachment}`)}
                    >
                      下载
                    </Button>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* 审批对话框 */}
      <Dialog open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)}>
        <DialogTitle>审批合同</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="审批意见"
            fullWidth
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialogOpen(false)}>取消</Button>
          <Button onClick={handleApprove} variant="contained">
            确认审批
          </Button>
        </DialogActions>
      </Dialog>

      {/* 签署对话框 */}
      <Dialog open={signDialogOpen} onClose={() => setSignDialogOpen(false)}>
        <DialogTitle>签署合同</DialogTitle>
        <DialogContent>
          <Typography>
            确认签署此合同？签署后将无法撤销。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSignDialogOpen(false)}>取消</Button>
          <Button onClick={handleSign} variant="contained">
            确认签署
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContractDetail; 