import AssessmentFilterBar from './AssessmentFilterBar';
import { Box, Typography, Paper, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import {
  subjectKpis,
  subjectCompetencyProfile,
  subjectByClassGroup,
  detailedSubjectBreakdown,
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
      <Typography variant="caption" sx={{ color: subtitle.includes('Below') || subtitle.includes('Declining') ? COLORS.red : '#6B7280' }}>
        {subtitle}
      </Typography>
    </Paper>
  );
}

export default function AssessmentSubjects() {
  const competencyOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 110, right: 40, top: 10, bottom: 10 },
    xAxis: { type: 'value', min: 0, max: 100 },
    yAxis: { type: 'category', data: subjectCompetencyProfile.map(s => s.subject).reverse() },
    series: [
      {
        type: 'bar',
        data: subjectCompetencyProfile.map(s => s.actual).reverse(),
        barWidth: 18,
        itemStyle: {
          color: (params: { dataIndex: number }) => {
            const item = subjectCompetencyProfile[subjectCompetencyProfile.length - 1 - params.dataIndex];
            return item.actual >= item.target ? COLORS.green : item.actual >= item.target - 10 ? COLORS.orange : COLORS.red;
          },
        },
        label: { show: true, position: 'right', formatter: '{c}%', fontSize: 10, fontWeight: 'bold' as const },
        markLine: {
          silent: true,
          symbol: 'none',
          data: subjectCompetencyProfile.map((s, i) => ({
            yAxis: subjectCompetencyProfile.length - 1 - i,
            xAxis: s.target,
            lineStyle: { color: '#374151', type: 'dashed' as const, width: 1.5 },
            label: { show: true, formatter: `Target: ${s.target}%`, fontSize: 9, position: 'end' as const },
          })),
        },
      },
    ],
  };

  const classGroupOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Language', 'Math', 'Science', 'Social'], bottom: 0, itemWidth: 12, itemHeight: 12 },
    grid: { left: 40, right: 20, top: 20, bottom: 50 },
    xAxis: { type: 'category', data: subjectByClassGroup.categories, axisLabel: { fontSize: 10 } },
    yAxis: { type: 'value', min: 40, max: 90 },
    series: [
      { name: 'Language', type: 'bar', data: subjectByClassGroup.language, itemStyle: { color: COLORS.blue }, barWidth: 14 },
      { name: 'Math', type: 'bar', data: subjectByClassGroup.math, itemStyle: { color: COLORS.red }, barWidth: 14 },
      { name: 'Science', type: 'bar', data: subjectByClassGroup.science, itemStyle: { color: COLORS.green }, barWidth: 14 },
      { name: 'Social', type: 'bar', data: subjectByClassGroup.social, itemStyle: { color: COLORS.purple }, barWidth: 14 },
    ],
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="caption" color="primary" sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
        A2 ASSESSMENT PORTAL / SUBJECT &amp; CURRICULUM
      </Typography>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
        Rashtriya Vidyalaya Samiksha Kendra
      </Typography>

      <AssessmentFilterBar />

      {/* KPI Tiles */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {subjectKpis.map((kpi) => (
          <Grid item xs={6} sm={4} md={2} key={kpi.title}>
            <KpiTile {...kpi} />
          </Grid>
        ))}
      </Grid>

      {/* Row 2: Competency Profile + Class Performance */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Subject Competency Profile
            </Typography>
            <ReactECharts option={competencyOption} style={{ height: 280 }} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Subject Performance by Class (1–12)
            </Typography>
            <ReactECharts option={classGroupOption} style={{ height: 280 }} />
          </Paper>
        </Grid>
      </Grid>

      {/* Row 3: Detailed Subject Breakdown Table */}
      <Paper sx={{ p: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
          Detailed Subject Breakdown
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Subject</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Class</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Students</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Avg Score</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Pass %</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Improvement Area</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {detailedSubjectBreakdown.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell sx={{ fontWeight: 600 }}>{row.subject}</TableCell>
                  <TableCell>{row.class}</TableCell>
                  <TableCell align="right">{row.students}</TableCell>
                  <TableCell align="right">
                    <Chip
                      label={row.avgScore}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        bgcolor: parseFloat(row.avgScore) >= 70 ? '#d1fae5' : parseFloat(row.avgScore) >= 60 ? '#fef3c7' : '#fecaca',
                        color: parseFloat(row.avgScore) >= 70 ? COLORS.green : parseFloat(row.avgScore) >= 60 ? '#92400e' : COLORS.red,
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">{row.passPercent}</TableCell>
                  <TableCell>
                    <Chip label={row.improvement} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
