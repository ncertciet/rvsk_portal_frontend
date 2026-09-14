import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Box, Grid, Typography, Alert } from '@mui/material';
import { KpiCard, KpiBarChart, KpiTable } from '../components';
import type { KpiTableColumn, BarChartDataItem } from '../components';
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

interface ProgrammeFrameworkData {
  kpi_1: { states_with_programme: number; total_states: number };
  kpi_2: { states_with_authority: number; authorities: Array<{ state_code: string; authority_name: string }> };
  kpi_3: { models: Array<{ label: string; state_count: number; school_count: number }> };
}

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const AUTHORITY_TABLE_COLUMNS: KpiTableColumn[] = [
  { field: 'state_code', headerName: 'State Code', width: 120, align: 'left' },
  { field: 'authority_name', headerName: 'Authority Name', minWidth: 200, align: 'left' },
];

// ─── COMPONENT ───────────────────────────────────────────────────────────────

/**
 * ProgrammeFramework section page — renders KPI 1, 2, 3
 * for Section 01: Programme Infrastructure & Framework.
 *
 * - KPI 1: States with active programme (card)
 * - KPI 2: States with authorities (table)
 * - KPI 3: Accreditation model distribution (bar chart)
 *
 * Validates: Requirements 4.1, 4.2, 4.3, 16.1, 16.2, 16.3
 */
export default function ProgrammeFramework() {
  const { filters } = useOutletContext<OutletContextType>();

  const [data, setData] = useState<ProgrammeFrameworkData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data when filters change
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const response = await accreditationApi.getProgrammeFramework(
          filters.academicYear,
          filters.stateCode,
        );
        if (!cancelled) {
          setData(response.data?.data ?? response.data);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, 'Failed to fetch Programme & Framework data'));
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
  const kpi1Value = data
    ? `${data.kpi_1.states_with_programme} / ${data.kpi_1.total_states}`
    : '—';

  const kpi2Rows: Record<string, any>[] = data?.kpi_2.authorities ?? [];

  const kpi3ChartData: BarChartDataItem[] = data?.kpi_3.models.map((model) => ({
    label: model.label,
    value: model.state_count,
  })) ?? [];

  // ─── RENDER ──────────────────────────────────────────────────────────────
  return (
    <Box>
      {/* Section Header */}
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Programme Infrastructure &amp; Framework
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        KPIs measuring the establishment of accreditation programmes, standards authorities,
        and implementation models across states.
      </Typography>

      <Grid container spacing={3}>
        {/* KPI 1: States with Active Programme */}
        <Grid item xs={12} sm={6} md={4}>
          <KpiCard
            kpiNo={1}
            title="States with Active Accreditation Programme"
            value={kpi1Value}
            subtitle={`out of ${data?.kpi_1.total_states ?? 36} States/UTs`}
            loading={loading}
          />
        </Grid>

        {/* KPI 2: States with Standard Authority */}
        <Grid item xs={12} sm={6} md={4}>
          <KpiCard
            kpiNo={2}
            title="States with School Standard Authority"
            value={data?.kpi_2.states_with_authority ?? '—'}
            subtitle="states have designated authority"
            loading={loading}
          />
        </Grid>

        {/* KPI 3: Model Count summary card (states) */}
        <Grid item xs={12} sm={6} md={4}>
          <KpiCard
            kpiNo={3}
            title="Accreditation Models in Use"
            value={data?.kpi_3.models.length ?? '—'}
            subtitle="distinct models adopted"
            loading={loading}
          />
        </Grid>

        {/* KPI 3: Bar Chart — Accreditation Model Distribution */}
        <Grid item xs={12} md={7}>
          <KpiBarChart
            title="Accreditation Model Distribution (States)"
            data={kpi3ChartData}
            xAxisLabel="Model"
            yAxisLabel="Number of States"
            height={320}
            loading={loading}
          />
        </Grid>

        {/* KPI 2: Table — States with Authorities */}
        <Grid item xs={12} md={5}>
          <KpiTable
            title="States with School Standard Authorities"
            columns={AUTHORITY_TABLE_COLUMNS}
            rows={kpi2Rows}
            defaultRowsPerPage={10}
            loading={loading}
            maxHeight={360}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
