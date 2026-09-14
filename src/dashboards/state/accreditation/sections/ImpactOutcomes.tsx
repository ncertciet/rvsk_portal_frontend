import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Box, Grid, Typography, Alert } from '@mui/material';
import { KpiCard, KpiDonutChart, KpiTable } from '../components';
import type { KpiTableColumn, DonutChartDataItem } from '../components';
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

interface ImpactOutcomesData {
  kpi_15: {
    decision_use_cases: Record<string, { count: number; states: string[] }>;
  };
  kpi_16: {
    pct_schools_improved: number;
    schools_improved: number;
    schools_with_prior: number;
    avg_score_change: number;
  };
  kpi_17: {
    sharing_distribution: Array<{ label: string; state_count: number }>;
  };
}

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const DECISION_TABLE_COLUMNS: KpiTableColumn[] = [
  { field: 'use_case', headerName: 'Decision Use Case', minWidth: 220, align: 'left' },
  { field: 'state_count', headerName: 'States', width: 110, align: 'right' },
  {
    field: 'states',
    headerName: 'State Codes',
    minWidth: 220,
    align: 'left',
    sortable: false,
    renderCell: (value: string[]) => (Array.isArray(value) ? value.join(', ') : '—'),
  },
];

// ─── COMPONENT ───────────────────────────────────────────────────────────────

/**
 * ImpactOutcomes section page — renders KPI 15, 16, 17
 * for Section 05: Impact/Outcomes & Decision-Making.
 *
 * - KPI 15: Decision use cases with state counts (table)
 * - KPI 16: Improvement metrics (cards)
 * - KPI 17: Result-sharing distribution (donut)
 *
 * Validates: Requirements 8.1, 8.2, 8.3, 16.1, 16.2, 16.3
 */
export default function ImpactOutcomes() {
  const { filters } = useOutletContext<OutletContextType>();

  const [data, setData] = useState<ImpactOutcomesData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const response = await accreditationApi.getImpactOutcomes(
          filters.academicYear,
          filters.stateCode,
        );
        if (!cancelled) {
          setData(response.data?.data ?? response.data);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, 'Failed to fetch Impact & Outcomes data'));
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
  // KPI 15: flatten Record<useCase, {count, states[]}> into table rows
  const kpi15Rows: Record<string, any>[] = data
    ? Object.entries(data.kpi_15.decision_use_cases).map(([useCase, detail]) => ({
        use_case: useCase,
        state_count: detail.count,
        states: detail.states,
      }))
    : [];

  const kpi17DonutData: DonutChartDataItem[] =
    data?.kpi_17.sharing_distribution.map((s) => ({
      name: s.label,
      value: s.state_count,
    })) ?? [];

  // ─── RENDER ──────────────────────────────────────────────────────────────
  return (
    <Box>
      {/* Section Header */}
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Impact/Outcomes &amp; Decision-Making
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        KPIs measuring how accreditation results drive decisions, whether schools improve
        over time, and how results are shared.
      </Typography>

      <Grid container spacing={3}>
        {/* KPI 16: % Schools Improved (card) */}
        <Grid item xs={12} sm={6} md={4}>
          <KpiCard
            kpiNo={16}
            title="Schools Improved"
            value={data ? `${Number(data.kpi_16.pct_schools_improved).toFixed(1)}%` : '—'}
            subtitle={
              data
                ? `${data.kpi_16.schools_improved.toLocaleString()} of ${data.kpi_16.schools_with_prior.toLocaleString()} with prior assessment`
                : 'improved vs. prior assessments'
            }
            loading={loading}
          />
        </Grid>

        {/* KPI 16: Average Score Change (card) */}
        <Grid item xs={12} sm={6} md={4}>
          <KpiCard
            kpiNo={16}
            title="Average Score Change"
            value={
              data
                ? `${data.kpi_16.avg_score_change >= 0 ? '+' : ''}${Number(
                    data.kpi_16.avg_score_change,
                  ).toFixed(2)}`
                : '—'
            }
            subtitle="mean change vs. prior round"
            loading={loading}
          />
        </Grid>

        {/* KPI 15: Decision Use Cases count (card) */}
        <Grid item xs={12} sm={6} md={4}>
          <KpiCard
            kpiNo={15}
            title="Decision Use Cases"
            value={data ? Object.keys(data.kpi_15.decision_use_cases).length : '—'}
            subtitle="distinct ways results are used"
            loading={loading}
          />
        </Grid>

        {/* KPI 17: Donut — Result-Sharing Distribution */}
        <Grid item xs={12} md={5}>
          <KpiDonutChart
            title="Result-Sharing Distribution"
            data={kpi17DonutData}
            height={340}
            loading={loading}
          />
        </Grid>

        {/* KPI 15: Table — Decision Use Cases */}
        <Grid item xs={12} md={7}>
          <KpiTable
            title="Decision Use Cases by State"
            columns={DECISION_TABLE_COLUMNS}
            rows={kpi15Rows}
            defaultRowsPerPage={10}
            loading={loading}
            maxHeight={340}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
