import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, Tabs, Tab } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import apiClient from '../../services/apiClient';

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return value === index ? <Box sx={{ py: 3 }}>{children}</Box> : null;
}

export default function NasDashboard() {
  const [kpis, setKpis] = useState<any>(null);
  const [statewise, setStatewise] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    Promise.all([
      apiClient.get('/schemes/NAS/kpis'),
      apiClient.get('/schemes/NAS/statewise'),
    ]).then(([k, s]) => {
      setKpis(k.data);
      setStatewise(s.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  // Group statewise data by subject for grouped bar chart
  const subjects = [...new Set(statewise.map((s: any) => s.subject))].filter(Boolean);
  const states = [...new Set(statewise.map((s: any) => s.state_name))].slice(0, 10);

  const groupedBarOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: subjects, bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: { type: 'category', data: states, axisLabel: { rotate: 45, fontSize: 10 } },
    yAxis: { type: 'value', name: 'Performance' },
    series: subjects.map((subject, idx) => ({
      name: subject,
      type: 'bar',
      data: states.map(state => {
        const record = statewise.find((s: any) => s.state_name === state && s.subject === subject);
        return record?.performance || 0;
      }),
      color: ['#2563EB', '#16A34A', '#D97706', '#DC2626', '#7C3AED', '#0891B2'][idx % 6]
    }))
  };

  // Pie chart for state distribution by students surveyed
  const pieData = statewise
    .reduce((acc: any[], s: any) => {
      const existing = acc.find(a => a.name === s.state_name);
      if (existing) existing.value += (s.students_surveyed || 0);
      else acc.push({ name: s.state_name, value: s.students_surveyed || 0 });
      return acc;
    }, [])
    .sort((a: any, b: any) => b.value - a.value)
    .slice(0, 8);

  const pieOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', right: 10, top: 'center' },
    series: [{
      type: 'pie',
      radius: ['0%', '70%'],
      center: ['40%', '50%'],
      data: pieData,
      emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } },
      label: { show: true, formatter: '{b}\n{d}%' }
    }]
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1300, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>National Achievement Survey (NAS)</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>Learning outcome assessment across states and subjects</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Overview" /><Tab label="Charts" /><Tab label="Insights" />
      </Tabs>

      <TabPanel value={tab} index={0}>
        <Grid container spacing={3}>
          {[
            { l: 'States Covered', v: kpis?.states_covered, color: '#2563EB' },
            { l: 'Total Schools', v: kpis?.total_schools?.toLocaleString(), color: '#059669' },
            { l: 'Total Teachers', v: kpis?.total_teachers?.toLocaleString(), color: '#D97706' },
            { l: 'Students Surveyed', v: kpis?.students_surveyed?.toLocaleString(), color: '#DC2626' },
            { l: 'Avg Performance', v: Number(kpis?.avg_performance).toFixed(1), color: '#7C3AED' },
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
              <Typography variant="h6" sx={{ mb: 2 }}>Performance by Subject (Grouped Bar)</Typography>
              <ReactECharts option={groupedBarOption} style={{ height: 400 }} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>State Distribution (Students Surveyed)</Typography>
              <ReactECharts option={pieOption} style={{ height: 400 }} />
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
                <Typography fontWeight={600}>📊 Survey Coverage</Typography>
                <Typography variant="body2" color="text.secondary">
                  {kpis?.states_covered} states covered with {kpis?.students_surveyed?.toLocaleString()} students surveyed across {kpis?.total_schools?.toLocaleString()} schools.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2, borderLeft: '4px solid #2563EB' }}>
                <Typography fontWeight={600}>📈 Performance Average</Typography>
                <Typography variant="body2" color="text.secondary">
                  National average performance stands at {Number(kpis?.avg_performance).toFixed(1)}%, with significant variation across subjects.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2, borderLeft: '4px solid #D97706' }}>
                <Typography fontWeight={600}>⚠️ Subject Gaps</Typography>
                <Typography variant="body2" color="text.secondary">
                  Mathematics and Science show lower performance compared to language subjects in most states.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2, borderLeft: '4px solid #DC2626' }}>
                <Typography fontWeight={600}>👨‍🏫 Teacher Involvement</Typography>
                <Typography variant="body2" color="text.secondary">
                  {kpis?.total_teachers?.toLocaleString()} teachers participated in the survey process, enabling comprehensive assessment data collection.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </TabPanel>
    </Box>
  );
}
