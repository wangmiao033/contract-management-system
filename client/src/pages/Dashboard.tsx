import React, { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Button,
} from '@mui/material';
import {
  Description as ContractIcon,
  CheckCircle as ApprovedIcon,
  Warning as PendingIcon,
  AccessTime as RecentIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';

interface ContractStats {
  total: number;
  pending: number;
  approved: number;
  signed: number;
}

interface RecentActivity {
  _id: string;
  type: string;
  description: string;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<ContractStats>({
    total: 0,
    pending: 0,
    approved: 0,
    signed: 0,
  });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, activitiesRes] = await Promise.all([
          api.get('/contracts/stats'),
          api.get('/activities/recent'),
        ]);
        setStats(statsRes.data);
        setActivities(activitiesRes.data);
      } catch (error) {
        console.error('获取数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
        <Typography variant="h4">
          欢迎回来, {user?.username}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/contracts/new')}
        >
          新建合同
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {/* 合同统计卡片 */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              合同总数
            </Typography>
            <Typography variant="h4">{stats.total}</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              待审批
            </Typography>
            <Typography variant="h4" color="warning.main">
              {stats.pending}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              已审批
            </Typography>
            <Typography variant="h4" color="success.main">
              {stats.approved}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              已签署
            </Typography>
            <Typography variant="h4" color="primary.main">
              {stats.signed}
            </Typography>
          </Paper>
        </Grid>

        {/* 待办事项 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              待办事项
            </Typography>
            <List>
              {stats.pending > 0 ? (
                <ListItem>
                  <ListItemIcon>
                    <PendingIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${stats.pending} 份合同待审批`}
                    secondary="请及时处理待审批的合同"
                  />
                </ListItem>
              ) : (
                <ListItem>
                  <ListItemText primary="暂无待办事项" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* 最近活动 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              最近活动
            </Typography>
            <List>
              {activities.map((activity) => (
                <React.Fragment key={activity._id}>
                  <ListItem>
                    <ListItemIcon>
                      <RecentIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.description}
                      secondary={new Date(activity.createdAt).toLocaleString()}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 