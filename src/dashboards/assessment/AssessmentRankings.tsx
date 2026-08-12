import AssessmentFilterBar from './AssessmentFilterBar';
import { Box, Typography, Paper, Grid, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import {
  rankingsKpis,
  stateRankings,
  districtDrillDown,
  scatterData,
  priorityInterventionZones,
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

export default function AssessmentRankings() {
  // National Performance Index — heatmap-style visualization
  const heatmapOption = {
    tooltip: { formatter: (params: { name: string; value: number[] }) => `${params.name}: ${params.value[2]}%` },
    grid: { left: 10, right: 10, top: 10, bottom: 10 },
    xAxis: { type: 'category', data: ['N', 'NE', 'E', 'W', 'S', 'C'], show: false },
    yAxis: { type: 'category', data: ['Tier 1', 'Tier 2', 'Tier 3'], show: false },
    visualMap: { min: 40, max: 90, show: true, orient: 'horizontal', left: 'center', bottom: 0, inRange: { color: ['#fecaca', '#fef3c7', '#d1fae5', '#10B981'] }, textStyle: { fontSize: 10 } },
    series: [{
      type: 'heatmap',
      data: [
        [0, 0, 72], [1, 0, 58], [2, 0, 65], [3, 0, 78], [4, 0, 82], [5, 0, 68],
        [0, 1, 68], [1, 1, 55], [2, 1, 62], [3, 1, 74], [4, 1, 79], [5, 1, 65],
        [0, 2, 62], [1, 2, 48], [2, 2, 56], [3, 2, 70], [4, 2, 75], [5, 2, 60],
      ],
      label: { show: true, formatter: (params: { value: number[] }) => `${params.value[2]}%`, fontSize: 11, fontWeight: 'bold' as const },
      itemStyle: { borderWidth: 2, borderColor: '#fff' },
    }],
  };

  // State Rankings horizontal bar
  const rankingBarOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 130, right: 50, top: 10, bottom: 10 },
    xAxis: { type: 'value', min: 50, max: 90 },
    yAxis: { type: 'category', data: stateRankings.map(s => `${s.rank}. ${s.state}`).reverse() },
    series: [{
      type: 'bar',
      data: stateRankings.map(s => ({ value: s.score, itemStyle: { color: s.color } })).reverse(),
      barWidth: 16,
      label: { show: true, position: 'right', formatter: '{c}%', fontSize: 10, fontWeight: 'bold' as const },
    }],
  };

  // Scatter plot — Participation vs Performance
  const scatterOption = {
    tooltip: { trigger: 'item', formatter: (params: { name: string; value: number[] }) => `${params.name}<br/>Participation: ${params.value[0]}%<br/>Performance: ${params.value[1]}%` },
    grid: { left: 50, right: 30, top: 30, bottom: 40 },
    xAxis: { type: 'value', name: 'Participation %', min: 60, max: 100, nameLocation: 'center', nameGap: 25 },
    yAxis: { type: 'value', name: 'Performance %', min: 40, max: 90, nameLocation: 'center', nameGap: 35 },
    series: [{
      type: 'scatter',
      data: scatterData.map(d => ({ name: d.name, value: [d.x, d.y] })),
      symbolSize: 14,
      itemStyle: {
        color: (params: { value: number[] }) => {
          if (params.value[0] >= 85 && params.value[1] >= 70) return COLORS.green;
          if (params.value[0] >= 85 && params.value[1] < 70) return COLORS.orange;
          if (params.value[0] < 85 && params.value[1] >= 70) return COLORS.blue;
          return COLORS.red;
        },
      },
      label: { show: true, formatter: (params: { name: string }) => params.name, position: 'right', fontSize: 9 },
    }],
    markLine: {
      silent: true,
      data: [
        { xAxis: 85, lineStyle: { color: '#9CA3AF', type: 'dashed' as const } },
        { yAxis: 70, lineStyle: { color: '#9CA3AF', type: 'dashed' as const } },
      ],
    },
  };

  const getTrendChip = (trend: string) => {
    switch (trend) {
      case 'up': return <Chip label="↑ Improving" size="small" sx={{ bgcolor: '#d1fae5', color: COLORS.green, fontWeight: 600 }} />;
      case 'down': return <Chip label="↓ Declining" size="small" sx={{ bgcolor: '#fecaca', color: COLORS.red, fontWeight: 600 }} />;
      default: return <Chip label="→ Stable" size="small" sx={{ bgcolor: '#f3f4f6', color: '#6B7280', fontWeight: 600 }} />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="caption" color="primary" sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
        A2 ASSESSMENT PORTAL / RANKINGS
      </Typography>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
        Rashtriya Vidyalaya Samiksha Kendra
      </Typography>

      <AssessmentFilterBar />

      {/* KPI Tiles */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {rankingsKpis.map((kpi) => (
          <Grid item xs={6} sm={4} md={2} key={kpi.title}>
            <KpiTile {...kpi} />
          </Grid>
        ))}
      </Grid>

      {/* Row 2: Heatmap + State Rankings */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              National Performance Index Mapping
            </Typography>
            <ReactECharts option={heatmapOption} style={{ height: 280 }} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              State Rankings (All Subjects)
            </Typography>
            <ReactECharts option={rankingBarOption} style={{ height: 280 }} />
          </Paper>
        </Grid>
      </Grid>

      {/* Row 3: District Drill-Down + Scatter */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              District Drill-Down
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>District</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>State</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Enrollment</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Performance</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Trend</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {districtDrillDown.map((row) => (
                    <TableRow key={row.district}>
                      <TableCell sx={{ fontWeight: 600 }}>{row.district}</TableCell>
                      <TableCell>{row.state}</TableCell>
                      <TableCell align="right">{row.enrollment}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{row.performance}</TableCell>
                      <TableCell align="center">{getTrendChip(row.trend)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Participation vs Performance
            </Typography>
            <ReactECharts option={scatterOption} style={{ height: 300 }} />
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1 }}>
              <Typography variant="caption" sx={{ color: COLORS.green }}>● High Perf / High Part</Typography>
              <Typography variant="caption" sx={{ color: COLORS.blue }}>● High Perf / Low Part</Typography>
              <Typography variant="caption" sx={{ color: COLORS.orange }}>● Low Perf / High Part</Typography>
              <Typography variant="caption" sx={{ color: COLORS.red }}>● Low Perf / Low Part</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Row 4: Priority Intervention Zones */}
      <Paper sx={{ p: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
          Priority Intervention Zones
        </Typography>
        <Grid container spacing={2}>
          {priorityInterventionZones.map((zone) => (
            <Grid item xs={12} md={4} key={zone.district}>
              <Paper variant="outlined" sx={{ p: 2, borderLeft: `4px solid ${zone.color}`, height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {zone.district}, {zone.state}
                  </Typography>
                  <Chip
                    label={zone.severity.toUpperCase()}
                    size="small"
                    sx={{ fontWeight: 700, bgcolor: zone.color === COLORS.red ? '#fecaca' : '#fef3c7', color: zone.color, fontSize: '0.65rem' }}
                  />
                </Box>
                <Typography variant="h6" fontWeight={700} sx={{ color: zone.color, mb: 0.5 }}>
                  {zone.score}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {zone.issue}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
}
