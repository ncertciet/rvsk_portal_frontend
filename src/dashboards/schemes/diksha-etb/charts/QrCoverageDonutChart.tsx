import { Box, Typography } from '@mui/material';
import ReactECharts from 'echarts-for-react';

interface StatewiseData {
  STATE_NAME: string;
  QR_COVERAGE_PCT: number;
}

interface QrCoverageDonutChartProps {
  statewiseData: StatewiseData[];
}

const coverageLegend = [
  { label: '0%', color: '#EF4444' },
  { label: '>0-25%', color: '#F97316' },
  { label: '>25-50%', color: '#EAB308' },
  { label: '>50-75%', color: '#22C55E' },
  { label: '>75-100%', color: '#059669' },
];

export default function QrCoverageDonutChart({ statewiseData }: QrCoverageDonutChartProps) {
  const overallCoverage =
    statewiseData.length > 0
      ? (
          statewiseData.reduce((sum, s) => sum + (s.QR_COVERAGE_PCT || 0), 0) /
          statewiseData.length
        ).toFixed(2)
      : '0';

  const chartOption = {
    tooltip: {
      trigger: 'item' as const,
      formatter: (params: { name: string; value: number }) =>
        `STATE: ${params.name}<br/>VALUE: ${params.value}%`,
    },
    legend: {
      orient: 'vertical' as const,
      right: 0,
      top: 'center',
      data: statewiseData.map((s) => s.STATE_NAME),
      type: 'scroll' as const,
      textStyle: { fontSize: 10 },
      title: { text: 'State Coverage Breakdown' },
    },
    series: [
      {
        type: 'pie' as const,
        radius: ['45%', '75%'],
        center: ['35%', '50%'],
        label: {
          show: true,
          formatter: '{b} - {c}',
          fontSize: 9,
        },
        labelLine: {
          length: 10,
          length2: 8,
        },
        data: statewiseData.map((s) => ({
          name: s.STATE_NAME,
          value: s.QR_COVERAGE_PCT,
        })),
      },
    ],
  };

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, color: '#1E293B' }}>
        Content Coverage On QR%
      </Typography>
      <ReactECharts option={chartOption} style={{ height: 450 }} />

      {/* Coverage footer */}
      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #E2E8F0' }}>
        <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>
          Content Coverage On QR% | Overall Content Coverage On QR - {overallCoverage}%
        </Typography>
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
