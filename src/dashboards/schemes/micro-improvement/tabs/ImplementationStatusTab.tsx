import { useEffect, useState } from 'react';
import { Box, Typography, Checkbox, FormControlLabel, CircularProgress } from '@mui/material';
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

interface ImplementationStatusTabProps {
  statewiseData: StatewiseData[];
}

const INDIA_GEOJSON_URL = 'https://code.highcharts.com/mapdata/countries/in/in-all.geo.json';

export default function ImplementationStatusTab({ statewiseData }: ImplementationStatusTabProps) {
  const [mapRegistered, setMapRegistered] = useState(false);
  const [geoData, setGeoData] = useState<any>(null);
  const [showImplemented, setShowImplemented] = useState(true);
  const [showNotImplemented, setShowNotImplemented] = useState(true);
  const [loading, setLoading] = useState(true);

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

  const getOption = () => {
    if (!mapRegistered || !geoData) return {};

    const mapData = geoData.features
      ?.map((feature: any) => {
        const name = feature.properties.name || feature.properties['hc-a2'] || '';
        const stateData = findStateData(name);
        const isImplemented = !!stateData;

        // Filter visibility
        if (!showImplemented && isImplemented) return null;
        if (!showNotImplemented && !isImplemented) return null;

        return {
          name,
          value: isImplemented ? 1 : 0,
          isImplemented,
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
          if (!data) {
            return `<div style="padding:4px 8px">
              <div style="font-weight:600;margin-bottom:4px">Micro Improvement</div>
              <div>State/UT Name : <strong>${params.name}</strong></div>
              <div>Status : Not Implemented</div>
            </div>`;
          }
          return `<div style="padding:4px 8px">
            <div style="font-weight:600;margin-bottom:4px">Micro Improvement</div>
            <div>State/UT Name : <strong>${data.stateName}</strong></div>
            <div>Status : ${data.isImplemented ? 'Implemented' : 'Not Implemented'}</div>
          </div>`;
        },
      },
      visualMap: {
        show: false,
        min: 0,
        max: 1,
        inRange: {
          color: ['#E2E8F0', '#93C5FD'],
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
      {/* Legend */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          right: 16,
          zIndex: 10,
          bgcolor: '#fff',
          border: '1px solid #E5E7EB',
          borderRadius: 1,
          p: 1.5,
          minWidth: 180,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" fontWeight={600}>
            Implementation Status
          </Typography>
        </Box>
        <FormControlLabel
          control={
            <Checkbox
              checked={showImplemented}
              onChange={(e) => setShowImplemented(e.target.checked)}
              size="small"
              sx={{ color: '#3B82F6', '&.Mui-checked': { color: '#3B82F6' } }}
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 40, height: 14, bgcolor: '#3B82F6', borderRadius: 0.5 }} />
              <Typography variant="caption">Implemented</Typography>
            </Box>
          }
          sx={{ ml: 0 }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={showNotImplemented}
              onChange={(e) => setShowNotImplemented(e.target.checked)}
              size="small"
              sx={{ color: '#94A3B8', '&.Mui-checked': { color: '#94A3B8' } }}
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 40, height: 14, bgcolor: '#E2E8F0', borderRadius: 0.5 }} />
              <Typography variant="caption">Not Implemented</Typography>
            </Box>
          }
          sx={{ ml: 0 }}
        />
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
              Map visualization showing Micro Improvement implementation status across states.
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}
