import AssessmentFilterBar from './AssessmentFilterBar';
import { Box, Typography, Paper, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import {
  demographicKpis,
  genderPerformanceByClass,
  socialCategoryPerformance,
  bottomDistricts,
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

export default function AssessmentDemographics() {
  const genderBarOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Male', 'Female'], bottom: 0 },
    grid: { left: 80, right: 30, top: 10, bottom: 40 },
    xAxis: { type: 'value', min: 50, max: 80 },
    yAxis: { type: 'category', data: genderPerformanceByClass.map(r => r.class).reverse() },
    series: [
      {
        name: 'Male',
        type: 'bar',
        data: genderPerformanceByClass.map(r => r.male).reverse(),
        barWidth: 12,
        itemStyle: { color: COLORS.blue },
        label: { show: true, position: 'right', formatter: '{c}%', fontSize: 10 },
      },
      {
        name: 'Female',
        type: 'bar',
        data: genderPerformanceByClass.map(r => r.female).reverse(),
        barWidth: 12,
        itemStyle: { color: COLORS.purple },
        label: { show: true, position: 'right', formatter: '{c}%', fontSize: 10 },
      },
    ],
  };

  const socialBarOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 80, right: 40, top: 10, bottom: 10 },
    xAxis: { type: 'value', min: 50, max: 85 },
    yAxis: { type: 'category', data: socialCategoryPerformance.map(r => r.category).reverse() },
    series: [{
      type: 'bar',
      data: socialCategoryPerformance.map(r => r.score).reverse(),
      barWidth: 20,
      itemStyle: {
        color: (params: { dataIndex: number }) => {
          const colors = [COLORS.red, COLORS.orange, COLORS.blue, COLORS.green];
          return colors[params.dataIndex];
        },
      },
      label: { show: true, position: 'right', formatter: '{c}%', fontSize: 11, fontWeight: 'bold' as const },
    }],
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="caption" color="primary" sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
        A2 ASSESSMENT PORTAL / STUDENT DEMOGRAPHICS
      </Typography>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
        Rashtriya Vidyalaya Samiksha Kendra
      </Typography>

      <AssessmentFilterBar />

      {/* KPI Tiles */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {demographicKpis.map((kpi) => (
          <Grid item xs={6} sm={4} md={2} key={kpi.title}>
            <KpiTile {...kpi} />
          </Grid>
        ))}
      </Grid>

      {/* Row 2: Gender Performance + Social Category */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Gender-wise Performance by Class
            </Typography>
            <ReactECharts option={genderBarOption} style={{ height: 260 }} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Social Category Performance
            </Typography>
            <ReactECharts option={socialBarOption} style={{ height: 260 }} />
          </Paper>
        </Grid>
      </Grid>

      {/* Row 3: Bottom Districts + Targeted Spotlight */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Bottom 20 Districts by Student Participation
            </Typography>
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>District</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>State</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Enrollment</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Participation %</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bottomDistricts.map((row, idx) => (
                    <TableRow key={row.district} sx={{ bgcolor: idx < 3 ? '#fef2f2' : 'inherit' }}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{row.district}</TableCell>
                      <TableCell>{row.state}</TableCell>
                      <TableCell align="right">{row.enrollment}</TableCell>
                      <TableCell align="right" sx={{ color: COLORS.red, fontWeight: 600 }}>{row.participation}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, bgcolor: '#1E293B', color: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', height: '100%' }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, color: '#94A3B8' }}>
              Targeted Progress Spotlight
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#10B981', mb: 0.5 }}>
                Gender Gap Narrowing
              </Typography>
              <Typography variant="body2" sx={{ color: '#CBD5E1', mb: 1 }}>
                Female performance has improved by +2.1pp over the past 3 years, closing the gender gap to just 1.8pp nationally.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#60A5FA' }}>2.1pp</Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>Female Gain</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#10B981' }}>1.8pp</Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>Current Gap</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#F59E0B' }}>18</Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>States Improved</Typography>
                </Box>
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#60A5FA', mb: 0.5 }}>
                APAAR Direct Interface
              </Typography>
              <Typography variant="body2" sx={{ color: '#CBD5E1', mb: 1 }}>
                92.4% students now verified through APAAR. Direct assessment-to-credential mapping enables real-time tracking of 24.8M student learning journeys.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#10B981' }}>92.4%</Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>Verified</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#60A5FA' }}>24.8M</Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>Tracked</Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
