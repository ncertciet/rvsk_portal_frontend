import { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';

interface StatewiseData {
  STATE_NAME: string;
  STATE_CODE: number;
  TOTAL_MICROIMPROVEMENT_PROJECTS: number;
  TOTAL_MICROIMPROVEMENT_STARTED: number;
  TOTAL_MICROIMPROVEMENT_INPROGRESS: number;
  TOTAL_MICROIMPROVEMENT_SUBMITTED: number;
  TOTAL_MICROIMPROVEMENT_SUBMITTED_WITH_EVIDENCE: number;
}

interface ImprovementsStatusTabProps {
  statewiseData: StatewiseData[];
}

type MetricKey =
  | 'TOTAL_MICROIMPROVEMENT_PROJECTS'
  | 'TOTAL_MICROIMPROVEMENT_STARTED'
  | 'TOTAL_MICROIMPROVEMENT_INPROGRESS'
  | 'TOTAL_MICROIMPROVEMENT_SUBMITTED'
  | 'TOTAL_MICROIMPROVEMENT_SUBMITTED_WITH_EVIDENCE';

const METRIC_OPTIONS: { value: MetricKey; label: string }[] = [
  { value: 'TOTAL_MICROIMPROVEMENT_PROJECTS', label: 'Total Microimprovement Projects' },
  { value: 'TOTAL_MICROIMPROVEMENT_STARTED', label: 'Total Microimprovement Started' },
  { value: 'TOTAL_MICROIMPROVEMENT_INPROGRESS', label: 'Total Microimprovement In Progress' },
  { value: 'TOTAL_MICROIMPROVEMENT_SUBMITTED', label: 'Total Microimprovement Submitted' },
  { value: 'TOTAL_MICROIMPROVEMENT_SUBMITTED_WITH_EVIDENCE', label: 'Total Submitted With Evidence' },
];

const COLORS = ['#EFF6FF', '#BFDBFE', '#60A5FA', '#2563EB', '#1E3A8A'];

const INDIA_GEOJSON_URL = 'https://code.highcharts.com/mapdata/countries/in/in-all.geo.json';

/**
 * Formats a number in Indian number system with L (lakh) suffix
 */
function formatIndianNumber(num: number): string {
  if (num >= 100000) {
    const inLakhs = num / 100000;
    return `${inLakhs.toFixed(2).replace(/\.?0+$/, '')}L`;
  }
  return num.toLocaleString('en-IN');
}

export default function ImprovementsStatusTab({ statewiseData }: ImprovementsStatusTabProps) {
  const [mapRegistered, setMapRegistered] = useState(false);
  const [geoData, setGeoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('TOTAL_MICROIMPROVEMENT_PROJECTS');
  const [visibleRanges, setVisibleRanges] = useState<boolean[]>([true, true, true, true, true]);

  // Register India map
  useEffect(() => {
    if (mapRegistered) return;

    fetch(INDIA_GEOJSON_URL)
      .then((res) => res.json())
      .then((data) => {
        echarts.registerMap('india', data);
        setGeoData(data);
        setMapRegistered(true);
        setLoading(false);
      })
      .catch(() => {
        setMapRegistered(true);
        setLoading(false);
      });
  }, [mapRegistered]);

  // Calculate quintile ranges
  const ranges = useMemo(() => {
    const values = statewiseData
      .map((s) => s[selectedMetric])
      .filter((v) => v > 0)
      .sort((a, b) => a - b);

    if (values.length === 0) {
      return [
        { min: 0, max: 0, label: '0', color: COLORS[0] },
        { min: 1, max: 100, label: '1 - 100', color: COLORS[1] },
        { min: 101, max: 1000, label: '101 - 1,000', color: COLORS[2] },
        { min: 1001, max: 10000, label: '1,001 - 10,000', color: COLORS[3] },
        { min: 10001, max: 100000, label: 'Above 10,000', color: COLORS[4] },
      ];
    }

    const q1 = values[Math.floor(values.length * 0.2)] || 0;
    const q2 = values[Math.floor(values.length * 0.4)] || 0;
    const q4 = values[Math.floor(values.length * 0.8)] || 0;
    const maxVal = values[values.length - 1] || 0;

    return [
      { min: 0, max: 0, label: '0', color: COLORS[0] },
      { min: 1, max: q1, label: `1 - ${formatIndianNumber(q1)}`, color: COLORS[1] },
      { min: q1 + 1, max: q2, label: `${formatIndianNumber(q1 + 1)} - ${formatIndianNumber(q2)}`, color: COLORS[2] },
      { min: q2 + 1, max: q4, label: `${formatIndianNumber(q2 + 1)} - ${formatIndianNumber(q4)}`, color: COLORS[3] },
      { min: q4 + 1, max: maxVal, label: `Above ${formatIndianNumber(q4)}`, color: COLORS[4] },
    ];
  }, [statewiseData, selectedMetric]);

  // Match GeoJSON state name to our data state name
  const findStateData = (geoName: string): StatewiseData | undefined => {
    const normalizedGeo = geoName.toLowerCase().replace(/[&]/g, 'and').replace(/\s+/g, ' ').trim();
    return statewiseData.find((s) => {
      const normalizedState = s.STATE_NAME.toLowerCase().replace(/[&]/g, 'and').replace(/\s+/g, ' ').trim();
      return (
        normalizedState === normalizedGeo ||
        normalizedGeo.includes(normalizedState) ||
        normalizedState.includes(normalizedGeo)
      );
    });
  };

  const getColorForValue = (value: number): string => {
    if (value === 0) return COLORS[0];
    if (value <= ranges[1].max) return COLORS[1];
    if (value <= ranges[2].max) return COLORS[2];
    if (value <= ranges[3].max) return COLORS[3];
    return COLORS[4];
  };

  const getRangeIndex = (value: number): number => {
    if (value === 0) return 0;
    if (value <= ranges[1].max) return 1;
    if (value <= ranges[2].max) return 2;
    if (value <= ranges[3].max) return 3;
    return 4;
  };

  const handleMetricChange = (event: SelectChangeEvent<string>) => {
    setSelectedMetric(event.target.value as MetricKey);
  };

  const handleRangeToggle = (index: number) => {
    setVisibleRanges((prev) => {
      const updated = [...prev];
      updated[index] = !updated[index];
      return updated;
    });
  };

  const getOption = () => {
    if (!mapRegistered || !geoData) return {};

    const maxValue = Math.max(...statewiseData.map((s) => s[selectedMetric]), 1);

    const mapData = geoData.features
      ?.map((feature: any) => {
        const name = feature.properties.name || feature.properties['hc-a2'] || '';
        const stateData = findStateData(name);
        const value = stateData ? stateData[selectedMetric] : 0;
        const rangeIdx = getRangeIndex(value);

        // Filter by visible ranges
        if (!visibleRanges[rangeIdx]) return null;

        return {
          name,
          value,
          itemStyle: { areaColor: getColorForValue(value) },
          stateName: stateData?.STATE_NAME || name,
        };
      })
      .filter(Boolean) || [];

    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        textStyle: { color: '#1F2937', fontSize: 12 },
        formatter: (params: any) => {
          const data = params.data;
          const metricLabel = METRIC_OPTIONS.find((m) => m.value === selectedMetric)?.label || '';
          if (!data) {
            return `<div style="padding:4px 8px">
              <div style="font-weight:600;margin-bottom:4px">${metricLabel}</div>
              <div>State/UT Name : <strong>${params.name}</strong></div>
              <div>Value : 0</div>
            </div>`;
          }
          return `<div style="padding:4px 8px">
            <div style="font-weight:600;margin-bottom:4px">${metricLabel}</div>
            <div>State/UT Name : <strong>${data.stateName}</strong></div>
            <div>Value : <strong>${formatIndianNumber(data.value)}</strong></div>
          </div>`;
        },
      },
      visualMap: {
        show: false,
        min: 0,
        max: maxValue,
        inRange: {
          color: ['#EFF6FF', '#BFDBFE', '#93C5FD', '#3B82F6', '#1E40AF'],
        },
      },
      series: [
        {
          type: 'map',
          map: 'india',
          roam: true,
          zoom: 1.2,
          center: [82, 23],
          emphasis: {
            label: { show: true, fontSize: 10, color: '#1F2937' },
            itemStyle: { areaColor: '#FF9933' },
          },
          select: {
            label: { show: true },
            itemStyle: { areaColor: '#1A4F99' },
          },
          data: mapData,
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 0.5,
          },
          label: { show: false },
        },
      ],
    };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Metric Dropdown */}
      <Box sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 280 }}>
          <InputLabel>Select Metric</InputLabel>
          <Select
            value={selectedMetric}
            label="Select Metric"
            onChange={handleMetricChange}
          >
            {METRIC_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Legend */}
      <Box
        sx={{
          position: 'absolute',
          top: 56,
          right: 16,
          zIndex: 10,
          bgcolor: '#fff',
          border: '1px solid #E5E7EB',
          borderRadius: 1,
          p: 1.5,
          minWidth: 200,
        }}
      >
        <Typography variant="caption" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
          {METRIC_OPTIONS.find((m) => m.value === selectedMetric)?.label}
        </Typography>
        {ranges.map((range, idx) => (
          <FormControlLabel
            key={idx}
            control={
              <Checkbox
                checked={visibleRanges[idx]}
                onChange={() => handleRangeToggle(idx)}
                size="small"
                sx={{ color: range.color, '&.Mui-checked': { color: range.color === '#EFF6FF' ? '#94A3B8' : range.color } }}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box
                  sx={{
                    width: 24,
                    height: 14,
                    bgcolor: range.color,
                    borderRadius: 0.5,
                    border: '1px solid #E5E7EB',
                  }}
                />
                <Typography variant="caption">{range.label}</Typography>
              </Box>
            }
            sx={{ ml: 0, display: 'flex' }}
          />
        )).reverse()}
      </Box>

      {/* Map */}
      {geoData ? (
        <ReactECharts
          option={getOption()}
          style={{ height: 500, width: '100%' }}
          opts={{ renderer: 'svg' }}
        />
      ) : (
        <Box
          sx={{
            height: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#F8FAFC',
            borderRadius: 2,
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              🗺️ India Map
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Map visualization showing Micro Improvement data across states.
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}
