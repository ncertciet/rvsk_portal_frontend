import React from 'react';
import { Box, Paper, Typography, Skeleton } from '@mui/material';
import ReactECharts from 'echarts-for-react';

// ─── TYPES ───────────────────────────────────────────────────────────────────
export interface DonutChartDataItem {
  name: string;
  value: number;
}

export interface KpiDonutChartProps {
  /** Chart title displayed above the chart */
  title?: string;
  /** Data items for the donut segments */
  data: DonutChartDataItem[];
  /** Optional text displayed in the center of the donut */
  centerText?: string;
  /** Custom colors for the segments */
  colors?: string[];
  /** Chart height in pixels */
  height?: number;
  /** Inner radius percentage (controls donut hole size) */
  innerRadius?: string;
  /** Outer radius percentage */
  outerRadius?: string;
  /** Loading state */
  loading?: boolean;
}

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const DEFAULT_COLORS = ['#D97706', '#F59E0B', '#FBBF24', '#92400E', '#78350F', '#FCD34D'];
const EMPTY_MESSAGE = 'No data available';

// ─── COMPONENT ───────────────────────────────────────────────────────────────
/**
 * KpiDonutChart renders an ECharts donut/pie chart for distribution data.
 * Supports optional center text and configurable colors.
 *
 * Validates: Requirements 16.2
 */
const KpiDonutChart: React.FC<KpiDonutChartProps> = ({
  title,
  data,
  centerText,
  colors = DEFAULT_COLORS,
  height = 280,
  innerRadius = '45%',
  outerRadius = '70%',
  loading = false,
}) => {
  if (loading) {
    return (
      <Paper sx={{ p: 2, height: height + 60 }}>
        {title && <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1 }} />}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Skeleton variant="circular" width={height * 0.6} height={height * 0.6} />
        </Box>
      </Paper>
    );
  }

  // Handle empty state
  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 2, height: height + 60, display: 'flex', flexDirection: 'column' }}>
        {title && (
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            {title}
          </Typography>
        )}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography color="text.secondary">{EMPTY_MESSAGE}</Typography>
        </Box>
      </Paper>
    );
  }

  const seriesData = data.map((item, index) => ({
    ...item,
    itemStyle: { color: colors[index % colors.length] },
  }));

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      bottom: 0,
      textStyle: { fontSize: 11 },
      type: 'scroll',
    },
    series: [
      {
        type: 'pie',
        radius: [innerRadius, outerRadius],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        label: centerText
          ? {
              show: true,
              position: 'center',
              formatter: centerText,
              fontSize: 14,
              fontWeight: 'bold',
              color: '#374151',
            }
          : {
              show: false,
            },
        emphasis: {
          label: {
            show: true,
            fontSize: 13,
            fontWeight: 'bold',
          },
        },
        labelLine: { show: !centerText },
        data: seriesData,
      },
    ],
  };

  return (
    <Paper sx={{ p: 2 }}>
      {title && (
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          {title}
        </Typography>
      )}
      <ReactECharts option={option} style={{ height }} notMerge lazyUpdate />
    </Paper>
  );
};

export default KpiDonutChart;
