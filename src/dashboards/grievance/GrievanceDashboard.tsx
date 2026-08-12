import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ReactECharts from 'echarts-for-react';
import apiClient from '../../services/apiClient';
import { GRIEVANCE_STATUSES, SPOC_ROLES } from './constants';

interface RootState {
  auth: {
    user: {
      id: string;
      username: string;
      displayName: string;
      role: string;
      stateCode: string | null;
      districtCode: string | null;
    } | null;
  };
}

const GrievanceDashboard: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await apiClient.get('/grievances/dashboard');
      setDashboard(res.data);
    } catch (err) {
      console.error('Failed to fetch dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  const isSpocOrAdmin = user && SPOC_ROLES.includes(user.role);

  // KPI Cards config based on role
  const getKpiCards = () => {
    if (isSpocOrAdmin) {
      return [
        { label: 'Total', value: dashboard.total || 0, color: '#1F2937', filter: '' },
        { label: 'Assigned', value: dashboard.assigned || 0, color: GRIEVANCE_STATUSES.ASSIGNED.color, filter: 'ASSIGNED' },
        { label: 'Under Review', value: dashboard.underReview || 0, color: GRIEVANCE_STATUSES.UNDER_REVIEW.color, filter: 'UNDER_REVIEW' },
        { label: 'In Progress', value: dashboard.inProgress || 0, color: GRIEVANCE_STATUSES.IN_PROGRESS.color, filter: 'IN_PROGRESS' },
        { label: 'Response Provided', value: dashboard.responseProvided || 0, color: GRIEVANCE_STATUSES.RESPONSE_PROVIDED.color, filter: 'RESPONSE_PROVIDED' },
        { label: 'Closed', value: dashboard.closed || 0, color: GRIEVANCE_STATUSES.CLOSED.color, filter: 'CLOSED' },
      ];
    }
    return [
      { label: 'Total Raised', value: dashboard.total || 0, color: '#1F2937', filter: '' },
      { label: 'Open', value: dashboard.open || 0, color: GRIEVANCE_STATUSES.OPEN.color, filter: 'OPEN' },
      { label: 'In Progress', value: dashboard.inProgress || 0, color: GRIEVANCE_STATUSES.IN_PROGRESS.color, filter: 'IN_PROGRESS' },
      { label: 'Response Provided', value: dashboard.responseProvided || 0, color: GRIEVANCE_STATUSES.RESPONSE_PROVIDED.color, filter: 'RESPONSE_PROVIDED' },
      { label: 'Closed', value: dashboard.closed || 0, color: GRIEVANCE_STATUSES.CLOSED.color, filter: 'CLOSED' },
      { label: 'Reopened', value: dashboard.reopened || 0, color: GRIEVANCE_STATUSES.REOPENED.color, filter: 'REOPENED' },
    ];
  };

  // Category Distribution Donut Chart
  const getCategoryDonutOption = () => ({
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', right: 10, top: 'center' },
    series: [
      {
        name: 'Status Distribution',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        label: { show: false },
        emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
        data: [
          { value: dashboard.assigned || 0, name: 'Assigned', itemStyle: { color: GRIEVANCE_STATUSES.ASSIGNED.color } },
          { value: dashboard.inProgress || 0, name: 'In Progress', itemStyle: { color: GRIEVANCE_STATUSES.IN_PROGRESS.color } },
          { value: dashboard.responseProvided || 0, name: 'Response Provided', itemStyle: { color: GRIEVANCE_STATUSES.RESPONSE_PROVIDED.color } },
          { value: dashboard.closed || 0, name: 'Closed', itemStyle: { color: GRIEVANCE_STATUSES.CLOSED.color } },
          { value: dashboard.reopened || 0, name: 'Reopened', itemStyle: { color: GRIEVANCE_STATUSES.REOPENED.color } },
        ].filter((d) => d.value > 0),
      },
    ],
  });

  // Resolution Performance Bar Chart
  const getResolutionBarOption = () => ({
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['Assigned', 'Under Review', 'In Progress', 'Responded', 'Closed', 'Reopened'],
    },
    yAxis: { type: 'value' },
    series: [
      {
        type: 'bar',
        data: [
          { value: dashboard.assigned || 0, itemStyle: { color: GRIEVANCE_STATUSES.ASSIGNED.color } },
          { value: dashboard.underReview || 0, itemStyle: { color: GRIEVANCE_STATUSES.UNDER_REVIEW.color } },
          { value: dashboard.inProgress || 0, itemStyle: { color: GRIEVANCE_STATUSES.IN_PROGRESS.color } },
          { value: dashboard.responseProvided || 0, itemStyle: { color: GRIEVANCE_STATUSES.RESPONSE_PROVIDED.color } },
          { value: dashboard.closed || 0, itemStyle: { color: GRIEVANCE_STATUSES.CLOSED.color } },
          { value: dashboard.reopened || 0, itemStyle: { color: GRIEVANCE_STATUSES.REOPENED.color } },
        ],
        barWidth: '50%',
      },
    ],
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Grievance Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {!isSpocOrAdmin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/rvsk/grievances/raise')}
            >
              Raise Grievance
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<ListAltIcon />}
            onClick={() => navigate('/rvsk/grievances/list')}
          >
            View All
          </Button>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {getKpiCards().map((kpi) => (
          <Grid item xs={12} sm={6} md={2} key={kpi.label}>
            <Card elevation={0} sx={{ border: '1px solid #E5E7EB' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography
                  variant="h4"
                  fontWeight={700}
                  sx={{ color: kpi.color, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                  onClick={() => navigate(`/rvsk/grievances/list${kpi.filter ? '?status=' + kpi.filter : ''}`)}
                >
                  {kpi.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {kpi.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              Status Distribution
            </Typography>
            <ReactECharts option={getCategoryDonutOption()} style={{ height: 300 }} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              Resolution Performance
            </Typography>
            <ReactECharts option={getResolutionBarOption()} style={{ height: 300 }} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GrievanceDashboard;
