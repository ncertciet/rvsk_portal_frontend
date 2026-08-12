import { useEffect, useState } from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Grid } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import apiClient from '../../../../services/apiClient';

interface FilterState {
  STATE_NAME: string;
  STATE_CODE: string;
}

interface DistrictData {
  DISTRICT_NAME: string;
  MEALS_ENROLLED: number;
  MEALS_SERVED: number;
  TOTAL_SCHOOLS_ENROLLED: number;
  TOTAL_SCHOOLS_MEALS_SERVED: number;
}

export default function DistrictwiseTab() {
  const [states, setStates] = useState<FilterState[]>([]);
  const [selectedState, setSelectedState] = useState('');
  const [districtData, setDistrictData] = useState<DistrictData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiClient.get('/schemes/PM_POSHAN/filters').then((res) => {
      setStates(res.data?.states || res.data || []);
    });
  }, []);

  useEffect(() => {
    if (!selectedState) return;
    setLoading(true);
    apiClient
      .get(`/schemes/PM_POSHAN/statewise`, { params: { state: selectedState } })
      .then((res) => {
        setDistrictData(res.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedState]);

  const handleStateChange = (event: SelectChangeEvent) => {
    setSelectedState(event.target.value);
  };

  const districtNames = districtData.map((d) => d.DISTRICT_NAME);

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
      data: districtNames,
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
        data: districtData.map((d) => d.MEALS_ENROLLED),
        itemStyle: { color: '#6366F1' },
      },
      {
        name: 'Meals Served',
        type: 'bar' as const,
        data: districtData.map((d) => d.MEALS_SERVED),
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
      data: districtNames,
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
        data: districtData.map((d) => d.TOTAL_SCHOOLS_ENROLLED),
        itemStyle: { color: '#6366F1' },
      },
      {
        name: 'Total School Meal Served',
        type: 'bar' as const,
        data: districtData.map((d) => d.TOTAL_SCHOOLS_MEALS_SERVED),
        itemStyle: { color: '#F97316' },
      },
    ],
  };

  return (
    <Box>
      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Select State</InputLabel>
            <Select value={selectedState} label="Select State" onChange={handleStateChange}>
              {states.map((s) => (
                <MenuItem key={s.STATE_CODE || s.STATE_NAME} value={s.STATE_NAME}>
                  {s.STATE_NAME}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {loading && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Loading district data...
        </Typography>
      )}

      {!loading && districtData.length > 0 && (
        <>
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
        </>
      )}

      {!loading && selectedState && districtData.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No district data available for {selectedState}.
        </Typography>
      )}

      {!selectedState && (
        <Typography variant="body2" color="text.secondary">
          Please select a state to view district-wise performance.
        </Typography>
      )}
    </Box>
  );
}
