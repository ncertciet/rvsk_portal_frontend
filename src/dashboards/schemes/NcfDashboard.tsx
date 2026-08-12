import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress } from '@mui/material';
import apiClient from '../../services/apiClient';

export default function NcfDashboard() {
  const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/schemes/NCF/kpis').then(res => {
      setKpis(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 4, maxWidth: 1300, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>NCF Dashboard</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>National Curriculum Framework</Typography>
      <Grid container spacing={3}>
        {[
          { label: 'States Participating', value: kpis?.states_participating, color: '#1A4F99' },
          { label: 'Total Surveys', value: Number(kpis?.total_surveys).toLocaleString(), color: '#059669' },
          { label: 'DCR Uploaded', value: Number(kpis?.total_dcr_uploaded).toLocaleString(), color: '#D97706' },
          { label: 'SSC Onboarded', value: Number(kpis?.total_ssc).toLocaleString(), color: '#7C3AED' },
        ].map(k => (
          <Grid item xs={12} sm={6} md={3} key={k.label}>
            <Paper sx={{ p: 3, textAlign: 'center', borderTop: `4px solid ${k.color}` }}>
              <Typography variant="h3" fontWeight={700} color={k.color}>{k.value}</Typography>
              <Typography color="text.secondary">{k.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
