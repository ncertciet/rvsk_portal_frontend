import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress } from '@mui/material';
import apiClient from '../../services/apiClient';

export default function PrashastDashboard() {
  const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/schemes/PRASHAST/kpis').then(res => {
      setKpis(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>PRASHAST Dashboard</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" color="primary">{kpis?.total_users?.toLocaleString()}</Typography>
            <Typography color="text.secondary">Total Users</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" color="primary">{kpis?.total_students?.toLocaleString()}</Typography>
            <Typography color="text.secondary">Total Students</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" color="primary">{kpis?.total_schools?.toLocaleString()}</Typography>
            <Typography color="text.secondary">Total Schools</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" color="primary">{kpis?.total_teachers?.toLocaleString()}</Typography>
            <Typography color="text.secondary">Total Teachers</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" color="primary">{kpis?.total_principals?.toLocaleString()}</Typography>
            <Typography color="text.secondary">Total Principals</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" color="primary">{kpis?.total_educators?.toLocaleString()}</Typography>
            <Typography color="text.secondary">Total Educators</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" color="primary">{kpis?.survey_part_1?.toLocaleString()}</Typography>
            <Typography color="text.secondary">Survey Part 1</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" color="primary">{kpis?.survey_part_2?.toLocaleString()}</Typography>
            <Typography color="text.secondary">Survey Part 2</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
