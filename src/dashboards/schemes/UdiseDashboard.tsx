import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, Tabs, Tab } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import apiClient from '../../services/apiClient';

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return value === index ? <Box sx={{ py: 3 }}>{children}</Box> : null;
}

export default function UdiseDashboard() {
  const [kpis, setKpis] = useState<any>(null);
  const [statewise, setStatewise] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    Promise.all([
      apiClient.get('/schemes/UDISE_PLUS/kpis'),
      apiClient.get('/schemes/UDISE_PLUS/statewise'),
    ]).then(([kpiRes, stateRes]) => {
      setKpis(kpiRes.data);
      setStatewise(stateRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  const infraOption = {
    title: { text: 'Infrastructure Availability (%)', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['Toilet', 'Water', 'Electricity', 'Library', 'Ramp'] },
    yAxis: { type: 'value', max: 100 },
    series: [{ type: 'bar', data: [
      Number(kpis?.pct_toilet).toFixed(1),
      Number(kpis?.pct_water).toFixed(1),
      Number(kpis?.pct_electricity).toFixed(1),
      Number(kpis?.pct_library).toFixed(1),
      Number(kpis?.pct_ramp).toFixed(1)
    ], itemStyle: { color: '#3B82F6' },
      label: { show: true, position: 'top', formatter: '{c}%' }
    }]
  };

  const donutOption = {
    title: { text: 'Student Distribution', left: 'center' },
    series: [{ type: 'pie', radius: ['40%', '70%'],
      data: statewise.map((s: any) => ({ value: s.number_of_students, name: s.state_name }))
    }],
    tooltip: { trigger: 'item' }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1300, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>UDISE+ Dashboard</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>Unified District Information System for Education</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Overview" /><Tab label="Infrastructure" /><Tab label="Distribution" /><Tab label="Insights" />
      </Tabs>

      <TabPanel value={tab} index={0}>
        <Grid container spacing={3}>
          {[
            { label: 'Total Schools', value: Number(kpis?.total_schools).toLocaleString(), color: '#1A4F99' },
            { label: 'Total Teachers', value: Number(kpis?.total_teachers).toLocaleString(), color: '#059669' },
            { label: 'Total Students', value: Number(kpis?.total_students).toLocaleString(), color: '#D97706' },
            { label: 'Avg PTR', value: Number(kpis?.avg_ptr).toFixed(1), color: '#DC2626' },
            { label: 'CWSN Enrolment', value: Number(kpis?.total_cwsn).toLocaleString(), color: '#7C3AED' },
          ].map(k => (
            <Grid item xs={6} sm={4} md={3} key={k.label}>
              <Paper sx={{ p: 2, textAlign: 'center', borderTop: `3px solid ${k.color}` }}>
                <Typography variant="h5" fontWeight={700} color={k.color}>{k.value}</Typography>
                <Typography variant="caption" color="text.secondary">{k.label}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tab} index={1}>
        <Paper sx={{ p: 3 }}><ReactECharts option={infraOption} style={{ height: 400 }} /></Paper>
      </TabPanel>

      <TabPanel value={tab} index={2}>
        <Paper sx={{ p: 3 }}><ReactECharts option={donutOption} style={{ height: 400 }} /></Paper>
      </TabPanel>

      <TabPanel value={tab} index={3}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Key Insights</Typography>
          <Paper variant="outlined" sx={{ p: 3, mb: 2, borderLeft: '4px solid #16A34A' }}>
            <Typography fontWeight={600}>🏫 {Number(kpis?.total_schools).toLocaleString()} Schools Reporting</Typography>
            <Typography variant="body2" color="text.secondary">Comprehensive data from schools across all states and UTs.</Typography>
          </Paper>
          <Paper variant="outlined" sx={{ p: 3, borderLeft: '4px solid #DC2626' }}>
            <Typography fontWeight={600}>⚠️ PTR needs attention in some states</Typography>
            <Typography variant="body2" color="text.secondary">Average PTR of {Number(kpis?.avg_ptr).toFixed(1)} — states above 30 need teacher recruitment focus.</Typography>
          </Paper>
        </Paper>
      </TabPanel>
    </Box>
  );
}
