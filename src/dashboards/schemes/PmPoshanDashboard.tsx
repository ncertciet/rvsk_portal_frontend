import { useEffect, useState } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import apiClient from '../../services/apiClient';
import PmShriHeader from './pmshri/PmShriHeader';
import PmPoshanMetrics from './pm-poshan/PmPoshanMetrics';
import PmPoshanChartSection from './pm-poshan/PmPoshanChartSection';

interface PmPoshanKpis {
  TOTAL_SCHOOLS_ENROLLED: number;
  TOTAL_SCHOOLS_MEALS_SERVED: number;
  SCHOOLS_MEALS_SERVED_PCT: number;
  TOTAL_MEALS_ENROLLED: number;
  TOTAL_MEALS_SERVED: number;
  MEALS_SERVED_PCT: number;
}

interface StatewiseData {
  STATE_NAME: string;
  MEALS_ENROLLED: number;
  MEALS_SERVED: number;
  TOTAL_SCHOOLS_ENROLLED: number;
  TOTAL_SCHOOLS_MEALS_SERVED: number;
}

export default function PmPoshanDashboard() {
  const [kpis, setKpis] = useState<PmPoshanKpis | null>(null);
  const [statewiseData, setStatewiseData] = useState<StatewiseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiClient.get('/schemes/PM_POSHAN/kpis'),
      apiClient.get('/schemes/PM_POSHAN/statewise'),
    ])
      .then(([kpiRes, stateRes]) => {
        setKpis(kpiRes.data);
        setStatewiseData(stateRes.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load PM POSHAN dashboard data. Please try again later.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, maxWidth: 1300, mx: 'auto' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#F9FAFB', minHeight: '100vh' }}>
      {/* Header Bar */}
      <PmShriHeader />

      {/* Main Content */}
      <Box sx={{ maxWidth: 1300, mx: 'auto', px: 3, py: 3 }}>
        {/* KPI Metrics */}
        {kpis && <PmPoshanMetrics kpis={kpis} />}

        {/* Chart Section with Tabs */}
        <PmPoshanChartSection statewiseData={statewiseData} />
      </Box>
    </Box>
  );
}
