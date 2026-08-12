import AssessmentFilterBar from './AssessmentFilterBar';
import { Box, Typography, Paper, Grid, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import {
  qualityKpis,
  integrityMetrics,
  reportingCompliance,
  anomalyLog,
  pipelineHealth,
  qualityDiagnostics,
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

function GaugeChart({ label, value, color }: { label: string; value: number; color: string }) {
  const option = {
    series: [{
      type: 'gauge',
      startAngle: 220,
      endAngle: -40,
      min: 0,
      max: 100,
      progress: { show: true, width: 14, itemStyle: { color } },
      axisLine: { lineStyle: { width: 14, color: [[1, '#f3f4f6']] } },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      pointer: { show: false },
      anchor: { show: false },
      title: { show: true, offsetCenter: [0, '70%'], fontSize: 12, fontWeight: 'bold' as const, color: '#374151' },
      detail: { valueAnimation: true, fontSize: 22, fontWeight: 'bold' as const, offsetCenter: [0, '30%'], color, formatter: '{value}%' },
      data: [{ value, name: label }],
    }],
  };
  return <ReactECharts option={option} style={{ height: 180 }} />;
}

export default function AssessmentQuality() {
  const complianceBarOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 100, right: 50, top: 10, bottom: 10 },
    xAxis: { type: 'value', min: 75, max: 100 },
    yAxis: { type: 'category', data: reportingCompliance.map(s => s.state).reverse() },
    series: [{
      type: 'bar',
      data: reportingCompliance.map(s => s.value).reverse(),
      barWidth: 16,
      itemStyle: {
        color: (params: { dataIndex: number }) => {
          const val = reportingCompliance[reportingCompliance.length - 1 - params.dataIndex].value;
          if (val >= 95) return COLORS.green;
          if (val >= 90) return COLORS.blue;
          return COLORS.orange;
        },
      },
      label: { show: true, position: 'right', formatter: '{c}%', fontSize: 10, fontWeight: 'bold' as const },
    }],
  };

  const getSeverityChip = (severity: string) => {
    switch (severity) {
      case 'Critical': return <Chip label="CRITICAL" size="small" sx={{ bgcolor: '#fecaca', color: COLORS.red, fontWeight: 700, fontSize: '0.65rem' }} />;
      case 'High': return <Chip label="HIGH" size="small" sx={{ bgcolor: '#fed7aa', color: '#c2410c', fontWeight: 700, fontSize: '0.65rem' }} />;
      case 'Medium': return <Chip label="MEDIUM" size="small" sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 700, fontSize: '0.65rem' }} />;
      default: return <Chip label="LOW" size="small" sx={{ bgcolor: '#d1fae5', color: COLORS.green, fontWeight: 700, fontSize: '0.65rem' }} />;
    }
  };

  const getStatusDot = (status: string) => {
    const color = status === 'healthy' ? COLORS.green : COLORS.orange;
    return (
      <Box sx={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', bgcolor: color, mr: 1 }} />
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="caption" color="primary" sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
        A2 ASSESSMENT PORTAL / DATA QUALITY
      </Typography>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
        Rashtriya Vidyalaya Samiksha Kendra
      </Typography>

      <AssessmentFilterBar />

      {/* KPI Tiles */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {qualityKpis.map((kpi) => (
          <Grid item xs={6} sm={4} md={2} key={kpi.title}>
            <KpiTile {...kpi} />
          </Grid>
        ))}
      </Grid>

      {/* Row 2: Integrity Metrics + Reporting Compliance */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Core Integrity Metrics
            </Typography>
            <Grid container>
              {integrityMetrics.map((metric) => (
                <Grid item xs={4} key={metric.label}>
                  <GaugeChart label={metric.label} value={metric.value} color={metric.color} />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Reporting Compliance
            </Typography>
            <ReactECharts option={complianceBarOption} style={{ height: 260 }} />
          </Paper>
        </Grid>
      </Grid>

      {/* Row 3: Anomaly Log + Pipeline Health */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Active Anomaly Log
            </Typography>
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>State / District</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Severity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {anomalyLog.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell sx={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.75rem' }}>{row.id}</TableCell>
                      <TableCell>{row.location}</TableCell>
                      <TableCell sx={{ maxWidth: 220, fontSize: '0.8rem' }}>{row.description}</TableCell>
                      <TableCell align="center">{getSeverityChip(row.severity)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
              Data Pipeline Health
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {pipelineHealth.map((svc) => (
                <Box key={svc.service} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.5, borderBottom: '1px solid #f3f4f6' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getStatusDot(svc.status)}
                    <Typography variant="body2" fontWeight={600}>{svc.service}</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#6B7280', fontFamily: 'monospace' }}>
                    {svc.latency}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Row 4: AI-Generated Diagnostic Findings */}
      <Paper sx={{ p: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
          AI-Generated Diagnostic Findings
        </Typography>
        <Grid container spacing={2}>
          {qualityDiagnostics.map((diag) => (
            <Grid item xs={12} sm={6} md={3} key={diag.title}>
              <Paper variant="outlined" sx={{ p: 2, borderLeft: `4px solid ${diag.color}`, height: '100%' }}>
                <Chip
                  label={diag.type}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.6rem',
                    mb: 1,
                    bgcolor: diag.color === COLORS.red ? '#fecaca' : diag.color === COLORS.orange ? '#fef3c7' : diag.color === COLORS.blue ? '#dbeafe' : '#d1fae5',
                    color: diag.color,
                  }}
                />
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
                  {diag.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem' }}>
                  {diag.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
}
