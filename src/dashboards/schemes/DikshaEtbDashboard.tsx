import { useEffect, useState } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import apiClient from '../../services/apiClient';
import PmShriHeader from './pmshri/PmShriHeader';
import DikshaEtbBanner from './diksha-etb/DikshaEtbBanner';
import DikshaEtbMetrics from './diksha-etb/DikshaEtbMetrics';
import DikshaEtbChartSection from './diksha-etb/DikshaEtbChartSection';

interface DikshaEtbKpis {
  TOTAL_STATES_PARTICIPATING: number;
  TOTAL_ETBS: number;
  TOTAL_QR_CODES: number;
  CONTENT_COVERAGE_QR_PCT: number;
  TOTAL_CONTENT: number;
  TOTAL_TIME_SPENT_MINS: number;
}

interface StatewiseData {
  STATE_NAME: string;
  TOTAL_CURRICULUM_TEXTBOOKS: number;
  TOTAL_ENERGISED_TEXTBOOKS: number;
  ETB_COVERAGE_PCT: number;
  QR_COVERAGE_PCT: number;
  LEARNING_SESSION_PER_CAPITA: number;
}

export default function DikshaEtbDashboard() {
  const [kpis, setKpis] = useState<DikshaEtbKpis | null>(null);
  const [statewiseData, setStatewiseData] = useState<StatewiseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiClient.get('/schemes/DIKSHA_ETB/kpis'),
      apiClient.get('/schemes/DIKSHA_ETB/statewise'),
    ])
      .then(([kpiRes, stateRes]) => {
        setKpis(kpiRes.data);
        setStatewiseData(stateRes.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load DIKSHA ETB dashboard data. Please try again later.');
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
        {/* Hero Banner */}
        <DikshaEtbBanner />

        {/* KPI Metrics */}
        {kpis && <DikshaEtbMetrics kpis={kpis} />}

        {/* Chart Section */}
        <DikshaEtbChartSection statewiseData={statewiseData} />
      </Box>
    </Box>
  );
}
