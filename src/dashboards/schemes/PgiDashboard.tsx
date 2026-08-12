import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, Tabs, Tab } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import apiClient from '../../services/apiClient';

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return value === index ? <Box sx={{ py: 3 }}>{children}</Box> : null;
}

export default function PgiDashboard() {
  const [kpis, setKpis] = useState<any>(null);
  const [statewise, setStatewise] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    Promise.all([
      apiClient.get('/schemes/PGI/kpis'),
      apiClient.get('/schemes/PGI/statewise'),
    ]).then(([kpiRes, stateRes]) => {
      setKpis(kpiRes.data);
      setStatewise(stateRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  const barOption = {
    title: { text: 'State-wise PGI Performance', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: statewise.map((s: any) => s.state_name), axisLabel: { rotate: 45 } },
    yAxis: { type: 'value', name: 'Score' },
    series: [
      { name: 'Learning Outcomes', type: 'bar', data: statewise.map((s: any) => s.learningoutcomes_and_quality), color: '#3B82F6' },
      { name: 'Access', type: 'bar', data: statewise.map((s: any) => s.access_), color: '#10B981' },
      { name: 'Infrastructure', type: 'bar', data: statewise.map((s: any) => s.infrastructure_and_facilities), color: '#F59E0B' },
      { name: 'Equity', type: 'bar', data: statewise.map((s: any) => s.equity), color: '#EF4444' },
      { name: 'Governance', type: 'bar', data: statewise.map((s: any) => s.governance_processes), color: '#8B5CF6' },
    ],
    legend: { bottom: 0 }
  };

  const radarOption = {
    title: { text: 'PGI Dimension Radar', left: 'center' },
    radar: {
      indicator: [
        { name: 'Learning', max: 100 }, { name: 'Access', max: 100 },
        { name: 'Infrastructure', max: 100 }, { name: 'Equity', max: 100 },
        { name: 'Governance', max: 100 }
      ]
    },
    series: [{ type: 'radar', data: statewise.slice(0, 3).map((s: any) => ({
      value: [s.learningoutcomes_and_quality, s.access_, s.infrastructure_and_facilities, s.equity, s.governance_processes],
      name: s.state_name
    })) }],
    legend: { bottom: 0, data: statewise.slice(0, 3).map((s: any) => s.state_name) }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1300, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>Performance Grading Index (PGI)</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>State-wise performance grading across education dimensions</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Overview" /><Tab label="Bar Chart" /><Tab label="Radar Chart" /><Tab label="Insights" />
      </Tabs>

      <TabPanel value={tab} index={0}>
        <Grid container spacing={3}>
          {[
            { label: 'States Assessed', value: kpis?.total_records, color: '#1A4F99' },
            { label: 'Avg Grand Total', value: Number(kpis?.avg_grand_total).toFixed(0), color: '#059669' },
            { label: 'Avg Outcome', value: Number(kpis?.avg_outcome).toFixed(1), color: '#D97706' },
            { label: 'Avg Digital Learning', value: Number(kpis?.avg_digital_learning).toFixed(1), color: '#DC2626' },
          ].map(k => (
            <Grid item xs={12} sm={6} md={3} key={k.label}>
              <Paper sx={{ p: 3, textAlign: 'center', borderTop: `4px solid ${k.color}` }}>
                <Typography variant="h3" fontWeight={700} color={k.color}>{k.value}</Typography>
                <Typography color="text.secondary">{k.label}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tab} index={1}>
        <Paper sx={{ p: 3 }}><ReactECharts option={barOption} style={{ height: 400 }} /></Paper>
      </TabPanel>

      <TabPanel value={tab} index={2}>
        <Paper sx={{ p: 3 }}><ReactECharts option={radarOption} style={{ height: 400 }} /></Paper>
      </TabPanel>

      <TabPanel value={tab} index={3}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Key Insights</Typography>
          <Paper variant="outlined" sx={{ p: 3, mb: 2, borderLeft: '4px solid #16A34A' }}>
            <Typography fontWeight={600}>📊 Top performers lead in Learning Outcomes</Typography>
            <Typography variant="body2" color="text.secondary">States with avg grand total above 440 show strong learning outcome scores.</Typography>
          </Paper>
          <Paper variant="outlined" sx={{ p: 3, borderLeft: '4px solid #DC2626' }}>
            <Typography fontWeight={600}>⚠️ Equity dimension needs attention</Typography>
            <Typography variant="body2" color="text.secondary">Equity scores are the lowest dimension across all states — averaging below 65.</Typography>
          </Paper>
        </Paper>
      </TabPanel>
    </Box>
  );
}
