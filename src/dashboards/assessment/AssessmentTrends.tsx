import AssessmentFilterBar from './AssessmentFilterBar';
import { Box, Typography, Paper, Grid, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import {
  trendsKpis,
  performanceTrend,
  participationGrowth,
  yoyScoreChangeByState,
  subjectWiseTrends,
  assessmentCalendar,
} from './dummyData';

const COLORS = { blue: '#1E3A8A', green: '#10B981', orange: '#F59E0B', red: '#EF4444', purple: '#7C3AED' };

function KpiTile({ title, value, subtitle, color }: { title: string; value: string; subtitle: string; color: string }) {
  return (
    <Paper sx={{ p: 2, textAlign: 'center', height: '100%', borderTop: `3px solid ${color}`, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
      <Typography variant="caption" sx={{ color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, fontSize: '0.65rem' }}>
        {title}
      </Typography>
      <Typography variant="h5" fontWeight={700} sx={{ my: 0.5, color }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ color: '#6B7280' }}>
        {subtitle}
      </Typography>
    </Paper>
  );
}

export default function AssessmentTrends() {
  const trendLineOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Top Quartile', 'National Average', 'Bottom Quartile'], bottom: 0 },
    grid: { left: 40, right: 20, top: 20, bottom: 50 },
    xAxis: { type: 'category', data: performanceTrend.years },
    yAxis: { type: 'value', min: 40, max: 90 },
    series: [
      { name: 'Top Quartile', type: 'line', data: performanceTrend.topQuartile, smooth: true, itemStyle: { color: COLORS.green }, lineStyle: { width: 2.5 } },
      { name: 'National Average', type: 'line', data: performanceTrend.nationalAverage, smooth: true, itemStyle: { color: COLORS.blue }, lineStyle: { width: 2.5 } },
      { name: 'Bottom Quartile', type: 'line', data: performanceTrend.bottomQuartile, smooth: true, itemStyle: { color: COLORS.red }, lineStyle: { width: 2.5, type: 'dashed' as const } },
    ],
  };

  const participationOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: participationGrowth.years },
    yAxis: { type: 'value', min: 60, max: 100 },
    series: [{
      type: 'line',
      data: participationGrowth.values,
      smooth: true,
      areaStyle: { color: 'rgba(30, 58, 138, 0.1)' },
      itemStyle: { color: COLORS.blue },
      lineStyle: { width: 2.5 },
      label: { show: true, formatter: '{c}%', fontSize: 10 },
    }],
  };

  const stateChangeOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 130, right: 50, top: 10, bottom: 10 },
    xAxis: { type: 'value', min: 0, max: 10 },
    yAxis: { type: 'category', data: yoyScoreChangeByState.map(s => s.state).reverse() },
    series: [{
      type: 'bar',
      data: yoyScoreChangeByState.map(s => s.change).reverse(),
      barWidth: 14,
      itemStyle: {
        color: (params: { dataIndex: number }) => {
          const val = yoyScoreChangeByState[yoyScoreChangeByState.length - 1 - params.dataIndex].change;
          if (val >= 5) return COLORS.green;
          if (val >= 3) return COLORS.blue;
          return COLORS.orange;
        },
      },
      label: { show: true, position: 'right', formatter: '+{c}pp', fontSize: 10, fontWeight: 'bold' as const },
    }],
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return { bg: '#d1fae5', color: COLORS.green };
      case 'In Progress': return { bg: '#dbeafe', color: COLORS.blue };
      case 'Scheduled': return { bg: '#fef3c7', color: '#92400e' };
      case 'Planned': return { bg: '#f3f4f6', color: '#6B7280' };
      default: return { bg: '#f3f4f6', color: '#6B7280' };
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="caption" color="primary" sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
        A2 ASSESSMENT PORTAL / TRENDS &amp; PROGRESSION
      </Typography>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
        Rashtriya Vidyalaya Samiksha Kendra
      </Typography>

      <AssessmentFilterBar />

      {/* KPI Tiles */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {trendsKpis.map((kpi) => (
          <Grid item xs={6} sm={4} md={2} key={kpi.title}>
            <KpiTile {...kpi} />
          </Grid>
        ))}
      </Grid>

      {/* Row 2: Performance Trend + Participation */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Performance Trend (2019–2024)
            </Typography>
            <ReactECharts option={trendLineOption} style={{ height: 280 }} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Participation Growth
            </Typography>
            <ReactECharts option={participationOption} style={{ height: 280 }} />
          </Paper>
        </Grid>
      </Grid>

      {/* Row 3: YoY Score Change + Subject Trends */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              YoY Score Change by State (Top 10)
            </Typography>
            <ReactECharts option={stateChangeOption} style={{ height: 300 }} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
              Subject-wise Trends
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              {subjectWiseTrends.map((item) => (
                <Chip
                  key={item.subject}
                  label={`${item.subject}: ${item.change}`}
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    bgcolor: item.color === COLORS.green ? '#d1fae5' : '#fecaca',
                    color: item.color,
                    border: `1px solid ${item.color}`,
                    px: 1,
                  }}
                />
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Row 4: Assessment Calendar */}
      <Paper sx={{ p: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
          Assessment Calendar &amp; Completion Status
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Framework</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Target Classes</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Target Date</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Schools Covered</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assessmentCalendar.map((row) => {
                const statusStyle = getStatusColor(row.status);
                return (
                  <TableRow key={row.framework}>
                    <TableCell sx={{ fontWeight: 600 }}>{row.framework}</TableCell>
                    <TableCell>{row.classes}</TableCell>
                    <TableCell>{row.targetDate}</TableCell>
                    <TableCell align="right">{row.schools}</TableCell>
                    <TableCell align="center">
                      <Chip label={row.status} size="small" sx={{ fontWeight: 600, bgcolor: statusStyle.bg, color: statusStyle.color }} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
