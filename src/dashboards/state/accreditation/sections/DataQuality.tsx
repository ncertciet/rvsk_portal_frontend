import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Box, Grid, Typography, Alert } from '@mui/material';
import { KpiCard, KpiBarChart, KpiDonutChart } from '../components';
import type { BarChartDataItem, DonutChartDataItem } from '../components';
import { accreditationApi } from '../api';
import { getApiErrorMessage } from '../../../../services/apiError';

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface FilterState {
  academicYear: string;
  stateCode: string;
}

interface OutletContextType {
  filters: FilterState;
}

interface DataQualityData {
  kpi_13: {
    self_disclosure_pct: number;
    schools_submitted: number;
    total_schools: number;
  };
  kpi_14: {
    on_time_pct: number;
    delayed_pct: number;
    significantly_delayed_pct: number;
    avg_delay_days: number;
  };
}

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const TIMELINESS_COLORS = ['#10B981', '#F59E0B', '#EF4444'];

// ─── COMPONENT ───────────────────────────────────────────────────────────────

/**
 * DataQuality section page — renders KPI 13, 14
 * for Section 04: Data Quality & Compliance.
 *
 * - KPI 13: Self-disclosure % (card) + submitted vs. total (donut)
 * - KPI 14: Timeliness breakdown (stacked bar) + avg delay days (card)
 *
 * Validates: Requirements 7.1, 7.2, 16.1, 16.2
 */
export default function DataQuality() {
  const { filters } = useOutletContext<OutletContextType>();

  const [data, setData] = useState<DataQualityData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const response = await accreditationApi.getDataQuality(
          filters.academicYear,
          filters.stateCode,
        );
        if (!cancelled) {
          setData(response.data?.data ?? response.data);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, 'Failed to fetch Data Quality data'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [filters.academicYear, filters.stateCode]);

  // ─── ERROR STATE ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  // ─── DERIVED DATA ────────────────────────────────────────────────────────
  const kpi13DonutData: DonutChartDataItem[] = data
    ? [
        { name: 'Submitted', value: data.kpi_13.schools_submitted },
        {
          name: 'Not Submitted',
          value: Math.max(data.kpi_13.total_schools - data.kpi_13.schools_submitted, 0),
        },
      ]
    : [];

  // KPI 14: stacked single-category bar for timeliness breakdown
  const kpi14ChartData: BarChartDataItem[] = data
    ? [
        {
          label: 'Timeliness',
          values: [
            Number(data.kpi_14.on_time_pct),
            Number(data.kpi_14.delayed_pct),
            Number(data.kpi_14.significantly_delayed_pct),
          ],
        },
      ]
    : [];

  // ─── RENDER ──────────────────────────────────────────────────────────────
  return (
    <Box>
      {/* Section Header */}
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Data Quality &amp; Compliance
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        KPIs measuring self-disclosure rates and the timeliness of assessment submissions.
      </Typography>

      <Grid container spacing={3}>
        {/* KPI 13: Self-Disclosure % (card) */}
        <Grid item xs={12} sm={6} md={4}>
          <KpiCard
            kpiNo={13}
            title="Self-Disclosure Rate"
            value={data ? `${Number(data.kpi_13.self_disclosure_pct).toFixed(1)}%` : '—'}
            subtitle={
              data
                ? `${data.kpi_13.schools_submitted.toLocaleString()} of ${data.kpi_13.total_schools.toLocaleString()} schools`
                : 'schools submitted vs. total'
            }
            loading={loading}
          />
        </Grid>

        {/* KPI 14: On-Time % (card) */}
        <Grid item xs={12} sm={6} md={4}>
          <KpiCard
            kpiNo={14}
            title="On-Time Submissions"
            value={data ? `${Number(data.kpi_14.on_time_pct).toFixed(1)}%` : '—'}
            subtitle="submitted within deadline"
            loading={loading}
          />
        </Grid>

        {/* KPI 14: Average Delay (card) */}
        <Grid item xs={12} sm={6} md={4}>
          <KpiCard
            kpiNo={14}
            title="Average Delay"
            value={data ? `${Number(data.kpi_14.avg_delay_days).toFixed(1)}` : '—'}
            subtitle="days beyond deadline (avg)"
            loading={loading}
          />
        </Grid>

        {/* KPI 13: Donut — Self-Disclosure Submission */}
        <Grid item xs={12} md={5}>
          <KpiDonutChart
            title="Self-Disclosure Submission"
            data={kpi13DonutData}
            colors={['#10B981', '#E5E7EB']}
            height={320}
            loading={loading}
          />
        </Grid>

        {/* KPI 14: Stacked Bar — Timeliness Breakdown */}
        <Grid item xs={12} md={7}>
          <KpiBarChart
            title="Submission Timeliness Breakdown (%)"
            data={kpi14ChartData}
            colors={TIMELINESS_COLORS}
            seriesNames={['On Time', 'Delayed', 'Significantly Delayed']}
            xAxisLabel="Category"
            yAxisLabel="Percentage"
            height={320}
            loading={loading}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
