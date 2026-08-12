import { useEffect, useState } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import apiClient from '../../services/apiClient';
import PmShriHeader from './pmshri/PmShriHeader';
import MicroImprovementBanner from './micro-improvement/MicroImprovementBanner';
import MicroImprovementMetrics from './micro-improvement/MicroImprovementMetrics';
import MicroImprovementMapSection from './micro-improvement/MicroImprovementMapSection';

interface KpiData {
  TOTAL_PROJECTS: number;
  TOTAL_STARTED: number;
  TOTAL_INPROGRESS: number;
  TOTAL_SUBMITTED: number;
  TOTAL_WITH_EVIDENCE: number;
}

interface StatewiseData {
  STATE_NAME: string;
  STATE_CODE: number;
  TOTAL_MICROIMPROVEMENT_PROJECTS: number;
  TOTAL_MICROIMPROVEMENT_STARTED: number;
  TOTAL_MICROIMPROVEMENT_INPROGRESS: number;
  TOTAL_MICROIMPROVEMENT_SUBMITTED: number;
  TOTAL_MICROIMPROVEMENT_SUBMITTED_WITH_EVIDENCE: number;
}

export default function MicroImprovementDashboard() {
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [statewiseData, setStatewiseData] = useState<StatewiseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiClient.get('/schemes/MICRO_IMPROVEMENT/kpis'),
      apiClient.get('/schemes/MICRO_IMPROVEMENT/statewise'),
    ])
      .then(([kpiRes, stateRes]) => {
        setKpis(kpiRes.data);
        setStatewiseData(stateRes.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load dashboard data. Please try again later.');
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
        <MicroImprovementBanner />

        {/* KPI Metrics */}
        {kpis && <MicroImprovementMetrics kpis={kpis} />}

        {/* Map Section */}
        <MicroImprovementMapSection statewiseData={statewiseData} />
      </Box>
    </Box>
  );
}
