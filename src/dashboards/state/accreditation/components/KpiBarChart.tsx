import React from 'react';
import { Box, Paper, Typography, Skeleton } from '@mui/material';
import ReactECharts from 'echarts-for-react';

// ─── TYPES ───────────────────────────────────────────────────────────────────
export interface BarChartDataItem {
  label: string;
  value?: number;
  values?: number[];
}

export interface KpiBarChartProps {
  /** Chart title displayed above the chart */
  title?: string;
  /** Data items — use `value` for simple bars or `values` for grouped bars */
  data: BarChartDataItem[];
  /** Colors for the bars; for grouped bars, provide one color per group */
  colors?: string[];
  /** X-axis label */
  xAxisLabel?: string;
  /** Y-axis label */
  yAxisLabel?: string;
  /** Series names for grouped bars (legend labels) */
  seriesNames?: string[];
  /** Chart height in pixels */
  height?: number;
  /** Whether to display the chart horizontally (bars along y-axis) */
  horizontal?: boolean;
  /** Loading state */
  loading?: boolean;
}

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const DEFAULT_COLORS = ['#D97706', '#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A', '#92400E'];
const EMPTY_MESSAGE = 'No data available';

// ─── COMPONENT ───────────────────────────────────────────────────────────────
/**
 * KpiBarChart renders an ECharts bar chart for distribution data.
 * Supports both simple bar charts (one value per label) and grouped bar charts
 * (multiple values per label).
 *
 * Validates: Requirements 16.2
 */
const KpiBarChart: React.FC<KpiBarChartProps> = ({
  title,
  data,
  colors = DEFAULT_COLORS,
  xAxisLabel,
  yAxisLabel,
  seriesNames,
  height = 300,
  horizontal = false,
  loading = false,
}) => {
  if (loading) {
    return (
      <Paper sx={{ p: 2, height: height + 60 }}>
        {title && <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1 }} />}
        <Skeleton variant="rectangular" width="100%" height={height} />
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

  const labels = data.map((d) => d.label);
  const isGrouped = data.some((d) => d.values && d.values.length > 0);

  // Build series
  let series: any[];
  if (isGrouped) {
    const groupCount = Math.max(...data.map((d) => d.values?.length || 0));
    series = Array.from({ length: groupCount }, (_, i) => ({
      name: seriesNames?.[i] || `Series ${i + 1}`,
      type: 'bar',
      data: data.map((d) => d.values?.[i] ?? 0),
      itemStyle: { color: colors[i % colors.length] },
      barMaxWidth: 40,
    }));
  } else {
    series = [
      {
        name: seriesNames?.[0] || title || 'Value',
        type: 'bar',
        data: data.map((d) => d.value ?? 0),
        itemStyle: {
          color: (params: { dataIndex: number }) => colors[params.dataIndex % colors.length],
        },
        barMaxWidth: 50,
      },
    ];
  }

  const categoryAxis: any = {
    type: 'category',
    data: labels,
    axisLabel: { fontSize: 11, interval: 0, rotate: horizontal ? 0 : labels.length > 6 ? 30 : 0 },
    axisTick: { alignWithLabel: true },
    name: horizontal ? yAxisLabel : xAxisLabel,
    nameLocation: 'middle',
    nameGap: 30,
    nameTextStyle: { fontSize: 11, color: '#6B7280' },
  };

  const valueAxis: any = {
    type: 'value',
    axisLabel: { fontSize: 11 },
    name: horizontal ? xAxisLabel : yAxisLabel,
    nameLocation: 'middle',
    nameGap: 40,
    nameTextStyle: { fontSize: 11, color: '#6B7280' },
  };

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    legend: isGrouped
      ? { bottom: 0, textStyle: { fontSize: 11 } }
      : undefined,
    grid: {
      left: horizontal ? 120 : 50,
      right: 20,
      top: 20,
      bottom: isGrouped ? 40 : 30,
      containLabel: false,
    },
    xAxis: horizontal ? valueAxis : categoryAxis,
    yAxis: horizontal ? categoryAxis : valueAxis,
    series,
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

export default KpiBarChart;
