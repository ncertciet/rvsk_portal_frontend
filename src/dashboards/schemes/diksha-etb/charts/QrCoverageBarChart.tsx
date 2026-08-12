import { Box, Typography } from '@mui/material';
import ReactECharts from 'echarts-for-react';

interface StatewiseData {
  STATE_NAME: string;
  QR_COVERAGE_PCT: number;
}

interface QrCoverageBarChartProps {
  statewiseData: StatewiseData[];
}

const coverageLegend = [
  { label: '0%', color: '#EF4444' },
  { label: '>0-25%', color: '#F97316' },
  { label: '>25-50%', color: '#EAB308' },
  { label: '>50-75%', color: '#22C55E' },
  { label: '>75-100%', color: '#059669' },
];

export default function QrCoverageBarChart({ statewiseData }: QrCoverageBarChartProps) {
  const overallCoverage =
    statewiseData.length > 0
      ? (
          statewiseData.reduce((sum, s) => sum + (s.QR_COVERAGE_PCT || 0), 0) /
          statewiseData.length
        ).toFixed(2)
      : '0';

  const chartOption = {
    tooltip: {
      trigger: 'axis' as const,
      axisPointer: { type: 'shadow' as const },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category' as const,
      data: statewiseData.map((s) => s.STATE_NAME),
      axisLabel: { rotate: 45, fontSize: 9 },
    },
    yAxis: {
      type: 'value' as const,
      name: 'Content Coverage On QR Percentage',
      max: 100,
    },
    series: [
      {
        name: 'QR Coverage %',
        type: 'bar' as const,
        data: statewiseData.map((s) => s.QR_COVERAGE_PCT),
        itemStyle: { color: '#7C3AED' },
        label: {
          show: true,
          position: 'top' as const,
          fontSize: 8,
          formatter: '{c}%',
        },
      },
    ],
  };

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, color: '#1E293B' }}>
        Content Coverage On QR% | Overall Content Coverage On QR - {overallCoverage}%
      </Typography>
      <ReactECharts option={chartOption} style={{ height: 400 }} />

      {/* Coverage footer */}
      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #E2E8F0' }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {coverageLegend.map((item) => (
            <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: '3px',
                  bgcolor: item.color,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
