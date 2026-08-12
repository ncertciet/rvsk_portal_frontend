import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, Tabs, Tab } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import apiClient from '../../services/apiClient';

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return value === index ? <Box sx={{ py: 3 }}>{children}</Box> : null;
}

export default function NishthaDashboard() {
  const [kpis, setKpis] = useState<any>(null);
  const [charts, setCharts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    Promise.all([
      apiClient.get('/schemes/NISHTHA/kpis'),
      apiClient.get('/schemes/NISHTHA/charts'),
    ]).then(([kpiRes, chartRes]) => {
      setKpis(kpiRes.data);
      setCharts(chartRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  const barOption = {
    title: { text: 'Course-wise Certifications', left: 'center' },
    tooltip: { trigger: 'axis' },
    yAxis: { type: 'category', data: charts.map((c: any) => c.course_name?.substring(0, 25) || c.program_name) },
    xAxis: { type: 'value', name: 'Certifications' },
    series: [{ type: 'bar', data: charts.map((c: any) => c.total_certification || c.total_participants),
      itemStyle: { color: '#D97706' } }],
    grid: { left: 180 }
  };

  const pieOption = {
    title: { text: 'Participants by Programme', left: 'center' },
    tooltip: { trigger: 'item' },
    series: [{ type: 'pie', radius: '60%',
      data: charts.slice(0, 5).map((c: any, i: number) => ({
        value: c.total_certification || c.total_participants,
        name: c.course_name || c.program_name,
        itemStyle: { color: ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6'][i] }
      }))
    }]
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1300, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>NISHTHA Dashboard</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>National Initiative for School Heads' and Teachers' Holistic Advancement</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Overview" /><Tab label="Bar Chart" /><Tab label="Pie Chart" /><Tab label="Insights" />
      </Tabs>

      <TabPanel value={tab} index={0}>
        <Grid container spacing={3}>
          {[
            { label: 'Total Programmes', value: kpis?.total_programs, color: '#1A4F99' },
            { label: 'Total Participants', value: Number(kpis?.total_participants).toLocaleString(), color: '#059669' },
            { label: 'Total Certifications', value: Number(kpis?.total_certifications).toLocaleString(), color: '#D97706' },
          ].map(k => (
            <Grid item xs={12} sm={4} key={k.label}>
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
        <Paper sx={{ p: 3 }}><ReactECharts option={pieOption} style={{ height: 400 }} /></Paper>
      </TabPanel>

      <TabPanel value={tab} index={3}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Key Insights</Typography>
          <Paper variant="outlined" sx={{ p: 3, mb: 2, borderLeft: '4px solid #16A34A' }}>
            <Typography fontWeight={600}>🎓 {Number(kpis?.total_participants).toLocaleString()} Teachers Trained</Typography>
            <Typography variant="body2" color="text.secondary">NISHTHA has successfully trained over 62 lakh teachers across {kpis?.total_programs} programmes.</Typography>
          </Paper>
          <Paper variant="outlined" sx={{ p: 3, borderLeft: '4px solid #D97706' }}>
            <Typography fontWeight={600}>📜 Certification Rate</Typography>
            <Typography variant="body2" color="text.secondary">{Number(kpis?.total_certifications).toLocaleString()} certifications achieved — strong completion rates across programmes.</Typography>
          </Paper>
        </Paper>
      </TabPanel>
    </Box>
  );
}
