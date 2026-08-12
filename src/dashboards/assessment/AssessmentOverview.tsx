import AssessmentFilterBar from './AssessmentFilterBar';
import { Box, Typography, Paper, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import {
  overviewKpis,
  assessmentTrendData,
  assessmentTypeDistribution,
  topStatesByPerformance,
  classPerformanceMatrix,
  diagnosticInsights,
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
      <Typography variant="caption" sx={{ color: subtitle.startsWith('-') ? COLORS.red : subtitle.startsWith('+') ? COLORS.green : '#6B7280' }}>
        {subtitle}
      </Typography>
    </Paper>
  );
}

function getScoreColor(score: number | null): string {
  if (score === null) return '#f3f4f6';
  if (score >= 75) return '#d1fae5';
  if (score >= 65) return '#fef3c7';
  if (score >= 55) return '#fed7aa';
  return '#fecaca';
}

export default function AssessmentOverview() {
  const trendOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Elementary', 'Secondary'], bottom: 0 },
    grid: { left: 40, right: 20, top: 20, bottom: 40 },
    xAxis: { type: 'category', data: assessmentTrendData.years },
    yAxis: { type: 'value', min: 50, max: 90 },
    series: [
      { name: 'Elementary', type: 'line', data: assessmentTrendData.elementary, smooth: true, itemStyle: { color: COLORS.blue } },
      { name: 'Secondary', type: 'line', data: assessmentTrendData.secondary, smooth: true, itemStyle: { color: COLORS.green } },
    ],
  };

  const donutOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {d}%' },
    legend: { bottom: 0, itemWidth: 12, itemHeight: 12 },
    series: [{
      type: 'pie',
      radius: ['45%', '75%'],
      center: ['50%', '45%'],
      data: assessmentTypeDistribution.map((item, i) => ({
        ...item,
        itemStyle: { color: [COLORS.blue, COLORS.green, COLORS.orange, COLORS.purple][i] },
      })),
      label: { show: true, formatter: '{b}\n{d}%', fontSize: 11 },
    }],
  };

  const barOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 120, right: 30, top: 10, bottom: 10 },
    xAxis: { type: 'value', max: 100 },
    yAxis: { type: 'category', data: topStatesByPerformance.map(s => s.state).reverse(), axisLabel: { fontSize: 11 } },
    series: [{
      type: 'bar',
      data: topStatesByPerformance.map(s => s.score).reverse(),
      barWidth: 16,
      itemStyle: {
        color: (params: { dataIndex: number }) => {
          const score = topStatesByPerformance[topStatesByPerformance.length - 1 - params.dataIndex].score;
          if (score >= 80) return COLORS.green;
          if (score >= 75) return COLORS.blue;
          return COLORS.orange;
        },
      },
      label: { show: true, position: 'right', formatter: '{c}%', fontSize: 10 },
    }],
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="caption" color="primary" sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
        A2 ASSESSMENT PORTAL / EXECUTIVE OVERVIEW
      </Typography>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
        Rashtriya Vidyalaya Samiksha Kendra
      </Typography>

      <AssessmentFilterBar />

      {/* KPI Tiles */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {overviewKpis.map((kpi) => (
          <Grid item xs={6} sm={4} md={2} key={kpi.title}>
            <KpiTile {...kpi} />
          </Grid>
        ))}
      </Grid>

      {/* Row 2: Trend + Donut */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Assessment Trends (2019–2024)
            </Typography>
            <ReactECharts option={trendOption} style={{ height: 280 }} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Assessment Type Distribution
            </Typography>
            <ReactECharts option={donutOption} style={{ height: 280 }} />
          </Paper>
        </Grid>
      </Grid>

      {/* Row 3: Top States + Class Matrix */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Top 10 States by Performance
            </Typography>
            <ReactECharts option={barOption} style={{ height: 320 }} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Class-wise Performance Matrix
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Class</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Language</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Math</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Science</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Social</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {classPerformanceMatrix.map((row) => (
                    <TableRow key={row.class}>
                      <TableCell sx={{ fontWeight: 600 }}>{row.class}</TableCell>
                      <TableCell align="center" sx={{ bgcolor: getScoreColor(row.language), fontWeight: 600 }}>{row.language}%</TableCell>
                      <TableCell align="center" sx={{ bgcolor: getScoreColor(row.math), fontWeight: 600 }}>{row.math}%</TableCell>
                      <TableCell align="center" sx={{ bgcolor: getScoreColor(row.science), fontWeight: 600 }}>{row.science !== null ? `${row.science}%` : '—'}</TableCell>
                      <TableCell align="center" sx={{ bgcolor: getScoreColor(row.social), fontWeight: 600 }}>{row.social !== null ? `${row.social}%` : '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Row 4: Diagnostic Insights */}
      <Paper sx={{ p: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
          Key Diagnostic Insights (AI-Generated Findings)
        </Typography>
        <Grid container spacing={2}>
          {diagnosticInsights.map((insight) => (
            <Grid item xs={12} md={4} key={insight.title}>
              <Paper variant="outlined" sx={{ p: 2, borderLeft: `4px solid ${insight.borderColor}`, height: '100%' }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
                  {insight.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {insight.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
}
