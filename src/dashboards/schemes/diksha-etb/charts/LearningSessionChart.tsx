import { Box, Typography } from '@mui/material';
import ReactECharts from 'echarts-for-react';

interface StatewiseData {
  STATE_NAME: string;
  LEARNING_SESSION_PER_CAPITA: number;
}

interface LearningSessionChartProps {
  statewiseData: StatewiseData[];
}

const sessionLegend = [
  { label: '0', color: '#EF4444' },
  { label: '>0-1.49', color: '#F97316' },
  { label: '>1.49-3.49', color: '#EAB308' },
  { label: '>3.49-5.49', color: '#22C55E' },
  { label: '>5.49-7.49', color: '#059669' },
];

export default function LearningSessionChart({ statewiseData }: LearningSessionChartProps) {
  const chartOption = {
    tooltip: {
      trigger: 'item' as const,
      formatter: (params: { name: string; value: number }) =>
        `STATE: ${params.name}<br/>Sessions Per Capita: ${params.value}`,
    },
    legend: {
      orient: 'vertical' as const,
      right: 0,
      top: 'center',
      data: statewiseData.map((s) => s.STATE_NAME),
      type: 'scroll' as const,
      textStyle: { fontSize: 10 },
      title: { text: 'Session Participation by State' },
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
          value: s.LEARNING_SESSION_PER_CAPITA,
        })),
      },
    ],
  };

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, color: '#1E293B' }}>
        Learning Session Per Capita
      </Typography>
      <ReactECharts option={chartOption} style={{ height: 450 }} />

      {/* Legend footer */}
      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #E2E8F0' }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {sessionLegend.map((item) => (
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
