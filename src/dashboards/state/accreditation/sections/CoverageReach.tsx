import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Box, Grid, Typography, Alert, Chip } from '@mui/material';
import { KpiCard, KpiBarChart, KpiDonutChart, KpiTable } from '../components';
import type { KpiTableColumn, BarChartDataItem, DonutChartDataItem } from '../components';
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

type CoverageTier = 'HIGH' | 'MEDIUM' | 'LOW';

interface CoverageReachData {
  kpi_4: {
    total_schools_accredited: number;
    by_state: Array<{ state_code: string; schools_accredited: number }>;
  };
  kpi_5: {
    round_distribution: { round_1: number; round_2: number; round_3_plus: number };
    avg_rounds: number;
  };
  kpi_6: {
    national_coverage_pct: number;
    by_state: Array<{ state_code: string; coverage_pct: number; tier: CoverageTier }>;
  };
}

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const TIER_COLORS: Record<CoverageTier, string> = {
  HIGH: '#10B981',
  MEDIUM: '#F59E0B',
  LOW: '#EF4444',
};

const COVERAGE_TABLE_COLUMNS: KpiTableColumn[] = [
  { field: 'state_code', headerName: 'State Code', width: 120, align: 'left' },
  {
    field: 'coverage_pct',
    headerName: 'Coverage %',
    width: 140,
    align: 'right',
    renderCell: (value) => `${Number(value ?? 0).toFixed(1)}%`,
  },
  {
    field: 'tier',
    headerName: 'Tier',
    width: 120,
    align: 'center',
    renderCell: (value: CoverageTier) => (
      <Chip
        label={value}
        size="small"
        sx={{
          bgcolor: `${TIER_COLORS[value] ?? '#6B7280'}22`,
          color: TIER_COLORS[value] ?? '#6B7280',
          fontWeight: 600,
        }}
      />
    ),
  },
];

// ─── COMPONENT ───────────────────────────────────────────────────────────────

/**
 * CoverageReach section page — renders KPI 4, 5, 6
 * for Section 02: Coverage & Reach.
 *
 * - KPI 4: Schools accredited by state (bar chart) + total (card)
 * - KPI 5: Round distribution (donut) + avg rounds (card)
 * - KPI 6: Coverage % and tier per state (color-coded table) + national % (card)
 *
 * Validates: Requirements 5.1, 5.2, 5.3, 16.1, 16.2, 16.3
 */
export default function CoverageReach() {
  const { filters } = useOutletContext<OutletContextType>();

  const [data, setData] = useState<CoverageReachData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const response = await accreditationApi.getCoverageReach(
          filters.academicYear,
          filters.stateCode,
        );
        if (!cancelled) {
          setData(response.data?.data ?? response.data);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, 'Failed to fetch Coverage & Reach data'));
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
  const kpi4ChartData: BarChartDataItem[] =
    data?.kpi_4.by_state.map((s) => ({
      label: s.state_code,
      value: s.schools_accredited,
    })) ?? [];

  const kpi5DonutData: DonutChartDataItem[] = data
    ? [
        { name: 'Round 1', value: data.kpi_5.round_distribution.round_1 },
        { name: 'Round 2', value: data.kpi_5.round_distribution.round_2 },
        { name: 'Round 3+', value: data.kpi_5.round_distribution.round_3_plus },
      ]
    : [];

  const kpi6Rows: Record<string, any>[] = data?.kpi_6.by_state ?? [];

  // ─── RENDER ──────────────────────────────────────────────────────────────
  return (
    <Box>
      {/* Section Header */}
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Coverage &amp; Reach
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        KPIs measuring the number of schools accredited, assessment rounds completed,
        and coverage levels across states.
      </Typography>

      <Grid container spacing={3}>
        {/* KPI 4: Total Schools Accredited (card) */}
        <Grid item xs={12} sm={6} md={4}>
          <KpiCard
            kpiNo={4}
            title="Total Schools Accredited"
            value={data?.kpi_4.total_schools_accredited?.toLocaleString() ?? '—'}
            subtitle="across selected scope"
            loading={loading}
          />
        </Grid>

        {/* KPI 5: Average Rounds per School (card) */}
        <Grid item xs={12} sm={6} md={4}>
          <KpiCard
            kpiNo={5}
            title="Average Assessment Rounds"
            value={data ? Number(data.kpi_5.avg_rounds).toFixed(2) : '—'}
            subtitle="rounds per accredited school"
            loading={loading}
          />
        </Grid>

        {/* KPI 6: National Coverage % (card) */}
        <Grid item xs={12} sm={6} md={4}>
          <KpiCard
            kpiNo={6}
            title="National Coverage"
            value={data ? `${Number(data.kpi_6.national_coverage_pct).toFixed(1)}%` : '—'}
            subtitle="schools accredited vs. total"
            loading={loading}
          />
        </Grid>

        {/* KPI 4: Bar Chart — Schools Accredited by State */}
        <Grid item xs={12} md={7}>
          <KpiBarChart
            title="Schools Accredited by State"
            data={kpi4ChartData}
            xAxisLabel="State"
            yAxisLabel="Schools Accredited"
            height={340}
            loading={loading}
          />
        </Grid>

        {/* KPI 5: Donut Chart — Round Distribution */}
        <Grid item xs={12} md={5}>
          <KpiDonutChart
            title="Assessment Round Distribution"
            data={kpi5DonutData}
            height={340}
            loading={loading}
          />
        </Grid>

        {/* KPI 6: Table — Coverage % and Tier by State */}
        <Grid item xs={12}>
          <KpiTable
            title="Coverage & Tier Classification by State"
            columns={COVERAGE_TABLE_COLUMNS}
            rows={kpi6Rows}
            defaultRowsPerPage={10}
            loading={loading}
            maxHeight={400}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
