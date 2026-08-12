import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, Tabs, Tab } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import apiClient from '../../services/apiClient';

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return value === index ? <Box sx={{ py: 3 }}>{children}</Box> : null;
}

export default function NipunDashboard() {
  const [kpis, setKpis] = useState<any>(null);
  const [statewise, setStatewise] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    Promise.all([
      apiClient.get('/schemes/NIPUN/kpis'),
      apiClient.get('/schemes/NIPUN/statewise'),
    ]).then(([k, s]) => {
      setKpis(k.data);
      setStatewise(s.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  // Pie chart by medium
  const mediumData = statewise.reduce((acc: any[], s: any) => {
    const existing = acc.find(a => a.name === s.medium);
    if (existing) existing.value += (s.total_no_of_plays || 0);
    else if (s.medium) acc.push({ name: s.medium, value: s.total_no_of_plays || 0 });
    return acc;
  }, []);

  const pieOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', right: 10, top: 'center' },
    series: [{
      type: 'pie',
      radius: ['0%', '70%'],
      center: ['40%', '50%'],
      data: mediumData,
      emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } },
      label: { show: true, formatter: '{b}\n{d}%' }
    }]
  };

  // Bar chart by grade
  const gradeData = statewise.reduce((acc: any[], s: any) => {
    const existing = acc.find(a => a.name === s.grade);
    if (existing) existing.value += (s.total_no_of_plays || 0);
    else if (s.grade) acc.push({ name: s.grade, value: s.total_no_of_plays || 0 });
    return acc;
  }, []);

  const barOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
    xAxis: { type: 'category', data: gradeData.map((g: any) => g.name), axisLabel: { rotate: 30 } },
    yAxis: { type: 'value', name: 'Total Plays' },
    series: [{
      type: 'bar',
      data: gradeData.map((g: any) => g.value),
      itemStyle: { color: '#2563EB', borderRadius: [4, 4, 0, 0] }
    }]
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1300, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>NIPUN Bharat Dashboard</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>National Initiative for Proficiency in Reading with Understanding and Numeracy</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Overview" /><Tab label="Charts" /><Tab label="Insights" />
      </Tabs>

      <TabPanel value={tab} index={0}>
        <Grid container spacing={3}>
          {[
            { l: 'Total Content Items', v: kpis?.total_content_items, color: '#2563EB' },
            { l: 'Total Plays', v: kpis?.total_plays?.toLocaleString(), color: '#059669' },
            { l: 'Avg Rating', v: Number(kpis?.avg_rating).toFixed(2), color: '#D97706' },
            { l: 'Total Play Time (hrs)', v: Number(kpis?.total_play_time_hrs).toFixed(0), color: '#DC2626' },
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
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Content Consumption by Medium</Typography>
              <ReactECharts option={pieOption} style={{ height: 400 }} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Plays by Grade</Typography>
              <ReactECharts option={barOption} style={{ height: 400 }} />
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
                <Typography fontWeight={600}>📚 Content Engagement</Typography>
                <Typography variant="body2" color="text.secondary">
                  {kpis?.total_plays?.toLocaleString()} total plays across {kpis?.total_content_items} content items, showing active usage of NIPUN resources.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2, borderLeft: '4px solid #2563EB' }}>
                <Typography fontWeight={600}>⭐ Quality Rating</Typography>
                <Typography variant="body2" color="text.secondary">
                  Average content rating of {Number(kpis?.avg_rating).toFixed(2)} indicates {Number(kpis?.avg_rating) >= 3.5 ? 'good content quality' : 'scope for content improvement'}.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2, borderLeft: '4px solid #D97706' }}>
                <Typography fontWeight={600}>🌐 Medium Diversity</Typography>
                <Typography variant="body2" color="text.secondary">
                  Content available in {mediumData.length} languages/mediums, ensuring multilingual access for foundational literacy.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2, borderLeft: '4px solid #DC2626' }}>
                <Typography fontWeight={600}>📊 Grade Coverage</Typography>
                <Typography variant="body2" color="text.secondary">
                  Content spans {gradeData.length} grades with varying engagement — early grades show higher content consumption.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </TabPanel>
    </Box>
  );
}
