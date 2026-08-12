import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, Tabs, Tab } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import apiClient from '../../services/apiClient';

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return value === index ? <Box sx={{ py: 3 }}>{children}</Box> : null;
}

export default function NcertQuizDashboard() {
  const [kpis, setKpis] = useState<any>(null);
  const [statewise, setStatewise] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    Promise.all([
      apiClient.get('/schemes/NCERT_QUIZ/kpis'),
      apiClient.get('/schemes/NCERT_QUIZ/statewise'),
    ]).then(([k, s]) => {
      setKpis(k.data);
      setStatewise(s.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  // Line chart for enrollment trend
  const lineOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
    xAxis: { type: 'category', data: statewise.map((s: any) => s.state_name).slice(0, 12), axisLabel: { rotate: 45, fontSize: 10 } },
    yAxis: { type: 'value', name: 'Enrollments' },
    series: [{
      name: 'Total Enrollments',
      type: 'line',
      data: statewise.map((s: any) => s.total_enrollments).slice(0, 12),
      smooth: true,
      areaStyle: { opacity: 0.3 },
      lineStyle: { width: 3 },
      color: '#2563EB'
    }]
  };

  // Donut chart for completion vs non-completion
  const totalCompletion = Number(kpis?.avg_completion_pct) || 50;
  const totalNonCompletion = 100 - totalCompletion;

  const donutOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {d}%' },
    legend: { bottom: 0 },
    series: [{
      type: 'pie',
      radius: ['45%', '75%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}\n{d}%' },
      data: [
        { value: totalCompletion, name: 'Completed', itemStyle: { color: '#16A34A' } },
        { value: totalNonCompletion, name: 'Not Completed', itemStyle: { color: '#EF4444' } },
      ]
    }]
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1300, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>NCERT Quiz Dashboard</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>National quiz participation and certification tracking</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Overview" /><Tab label="Charts" /><Tab label="Insights" />
      </Tabs>

      <TabPanel value={tab} index={0}>
        <Grid container spacing={3}>
          {[
            { l: 'Total Enrolments', v: kpis?.total_enrolments?.toLocaleString(), color: '#2563EB' },
            { l: 'Certificates Issued', v: kpis?.total_certificates?.toLocaleString(), color: '#059669' },
            { l: 'Avg Completion %', v: `${Number(kpis?.avg_completion_pct).toFixed(1)}%`, color: '#D97706' },
            { l: 'States Participating', v: kpis?.states_participating, color: '#7C3AED' },
          ].map(k => (
            <Grid item xs={12} sm={6} md={3} key={k.l}>
              <Paper sx={{ p: 3, textAlign: 'center', borderTop: `4px solid ${k.color}`, borderRadius: 2 }}>
                <Typography variant="h3" fontWeight={700} color={k.color}>{k.v}</Typography>
                <Typography color="text.secondary">{k.l}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tab} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Enrollment by State (Line Chart)</Typography>
              <ReactECharts option={lineOption} style={{ height: 400 }} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Completion vs Non-Completion</Typography>
              <ReactECharts option={donutOption} style={{ height: 400 }} />
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tab} index={2}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Key Insights</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2, borderLeft: '4px solid #16A34A' }}>
                <Typography fontWeight={600}>🎓 Certification Rate</Typography>
                <Typography variant="body2" color="text.secondary">
                  {kpis?.total_certificates?.toLocaleString()} certificates issued from {kpis?.total_enrolments?.toLocaleString()} enrollments — {Number(kpis?.avg_completion_pct).toFixed(1)}% completion rate.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2, borderLeft: '4px solid #DC2626' }}>
                <Typography fontWeight={600}>⚠️ Dropout Concern</Typography>
                <Typography variant="body2" color="text.secondary">
                  {(100 - Number(kpis?.avg_completion_pct)).toFixed(1)}% non-completion rate suggests need for engagement strategies and reminders.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2, borderLeft: '4px solid #2563EB' }}>
                <Typography fontWeight={600}>🌍 State Coverage</Typography>
                <Typography variant="body2" color="text.secondary">
                  {kpis?.states_participating} states actively participating in the NCERT quiz programs.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2, borderLeft: '4px solid #D97706' }}>
                <Typography fontWeight={600}>📈 Growth Opportunity</Typography>
                <Typography variant="body2" color="text.secondary">
                  Multi-medium support drives participation — quiz content in regional languages shows higher completion rates.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </TabPanel>
    </Box>
  );
}
