import { useEffect, useState } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import apiClient from '../../services/apiClient';
import PmShriHeader from './pmshri/PmShriHeader';
import PmShriBanner from './pmshri/PmShriBanner';
import PmShriMetrics from './pmshri/PmShriMetrics';
import PmShriMapSection from './pmshri/PmShriMapSection';

interface KpiData {
  totalSchools: number;
  totalKvsSchools: number;
  totalNvsSchools: number;
  totalClassrooms: number;
  totalSmartClassrooms: number;
  totalStudents: number;
  totalTeachers: number;
  totalCwsn: number;
}

export default function PmShriDashboard() {
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [states, setStates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiClient.get('/schemes/PM_SHRI/kpis'),
      apiClient.get('/schemes/PM_SHRI/filters'),
    ])
      .then(([kpiRes, filterRes]) => {
        setKpis(kpiRes.data);
        setStates(filterRes.data.states || []);
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
        <PmShriBanner />

        {/* KPI Metrics */}
        {kpis && <PmShriMetrics kpis={kpis} />}

        {/* Map & Drilldown Section */}
        <PmShriMapSection states={states} />
      </Box>
    </Box>
  );
}
