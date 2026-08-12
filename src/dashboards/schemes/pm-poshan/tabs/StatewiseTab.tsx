import { Box, Typography } from '@mui/material';
import ReactECharts from 'echarts-for-react';

interface StatewiseData {
  STATE_NAME: string;
  MEALS_ENROLLED: number;
  MEALS_SERVED: number;
  TOTAL_SCHOOLS_ENROLLED: number;
  TOTAL_SCHOOLS_MEALS_SERVED: number;
}

interface StatewiseTabProps {
  statewiseData: StatewiseData[];
}

export default function StatewiseTab({ statewiseData }: StatewiseTabProps) {
  const stateNames = statewiseData.map((s) => s.STATE_NAME);

  const mealsChartOption = {
    tooltip: {
      trigger: 'axis' as const,
      axisPointer: { type: 'shadow' as const },
    },
    legend: {
      data: ['Meals Enrolled', 'Meals Served'],
      top: 10,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category' as const,
      data: stateNames,
      axisLabel: { rotate: 45, fontSize: 10 },
    },
    yAxis: {
      type: 'value' as const,
      name: 'Count (in Lakhs)',
    },
    series: [
      {
        name: 'Meals Enrolled',
        type: 'bar' as const,
        data: statewiseData.map((s) => s.MEALS_ENROLLED),
        itemStyle: { color: '#6366F1' },
      },
      {
        name: 'Meals Served',
        type: 'bar' as const,
        data: statewiseData.map((s) => s.MEALS_SERVED),
        itemStyle: { color: '#F97316' },
      },
    ],
  };

  const schoolsChartOption = {
    tooltip: {
      trigger: 'axis' as const,
      axisPointer: { type: 'shadow' as const },
    },
    legend: {
      data: ['Total School Enrolled', 'Total School Meal Served'],
      top: 10,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category' as const,
      data: stateNames,
      axisLabel: { rotate: 45, fontSize: 10 },
    },
    yAxis: {
      type: 'value' as const,
      name: 'Count (in Lakhs)',
    },
    series: [
      {
        name: 'Total School Enrolled',
        type: 'bar' as const,
        data: statewiseData.map((s) => s.TOTAL_SCHOOLS_ENROLLED),
        itemStyle: { color: '#6366F1' },
      },
      {
        name: 'Total School Meal Served',
        type: 'bar' as const,
        data: statewiseData.map((s) => s.TOTAL_SCHOOLS_MEALS_SERVED),
        itemStyle: { color: '#F97316' },
      },
    ],
  };

  return (
    <Box>
      {/* Meals Enrolled vs Meals Served */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, color: '#1E293B' }}>
          Meals Enrolled vs Meals Served
        </Typography>
        <ReactECharts option={mealsChartOption} style={{ height: 380 }} />
      </Box>

      {/* Total School Enrolled vs Total School Meal Served */}
      <Box>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, color: '#1E293B' }}>
          Total School Enrolled vs Total School Meal Served
        </Typography>
        <ReactECharts option={schoolsChartOption} style={{ height: 380 }} />
      </Box>
    </Box>
  );
}
