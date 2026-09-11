import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Box, Grid, Typography, Alert } from '@mui/material';
import { KpiCard, KpiBarChart, KpiTable } from '../components';
import type { KpiTableColumn, BarChartDataItem } from '../components';
import { accreditationApi } from '../api';

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface FilterState {
  academicYear: string;
  stateCode: string;
}

interface OutletContextType {
  filters: FilterState;
}

interface ProcessOperationsData {
  kpi_7: { frequency_distribution: Array<{ label: string; state_count: number }> };
  kpi_8: { visit_coverage_pct: number; visited_schools: number; total_accredited: number };
  kpi_9: { authority_participation: Record<string, number> };
  kpi_10: { states_with_vsk: number; states: Array<{ state_code: string; state_name: string }> };
}

interface DomainComponentsData {
  kpi_11: {
    domains_assessed: Array<{ domain_code: string; domain_name: string; states_assessing: number }>;
  };
  kpi_12: {
    domain_scores: Array<{
      domain_code: string;
      domain_name: string;
      avg_score: number;
      weightage: number;
    }>;
  };
}

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

/** Human-readable labels for the 6 authority participation categories (KPI 9). */
const AUTHORITY_LABELS: Record<string, string> = {
  state_official: 'State Official',
  district_official: 'District Official',
  block_official: 'Block Official',
  cluster_official: 'Cluster Official',
  community_members: 'Community Members',
  third_party_auditors: 'Third-Party Auditors',
};

const AUTHORITY_ORDER = [
  'state_official',
  'district_official',
  'block_official',
  'cluster_official',
  'community_members',
  'third_party_auditors',
];

const VSK_TABLE_COLUMNS: KpiTableColumn[] = [
  { field: 'state_code', headerName: 'State Code', width: 120, align: 'left' },
  { field: 'state_name', headerName: 'State Name', minWidth: 180, align: 'left' },
];

const DOMAIN_TABLE_COLUMNS: KpiTableColumn[] = [
  { field: 'domain_code', headerName: 'Domain Code', width: 130, align: 'left' },
  { field: 'domain_name', headerName: 'Domain Name', minWidth: 200, align: 'left' },
  { field: 'states_assessing', headerName: 'States Assessing', width: 150, align: 'right' },
];

// ─── COMPONENT ───────────────────────────────────────────────────────────────

/**
 * ProcessOperations section page — renders KPI 7–12
 * for Section 03: Process Quality & Operations.
 *
 * - KPI 7: Accreditation frequency distribution (bar chart)
 * - KPI 8: Visit coverage % + counts (card)
 * - KPI 9: Authority participation, 6 categories (horizontal bar chart)
 * - KPI 10: States with VSK integration (card + table)
 * - KPI 11: Domains assessed with state counts (table)
 * - KPI 12: Domain average scores with weightage (grouped bar chart)
 *
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 16.1, 16.2, 16.3
 */
export default function ProcessOperations() {
  const { filters } = useOutletContext<OutletContextType>();

  const [ops, setOps] = useState<ProcessOperationsData | null>(null);
  const [domains, setDomains] = useState<DomainComponentsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const [opsResponse, domainResponse] = await Promise.all([
          accreditationApi.getProcessOperations(filters.academicYear, filters.stateCode),
          accreditationApi.getDomainComponents(filters.academicYear, filters.stateCode),
        ]);
        if (!cancelled) {
          setOps(opsResponse.data?.data ?? opsResponse.data);
          setDomains(domainResponse.data?.data ?? domainResponse.data);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || 'Failed to fetch Process & Operations data');
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
  const kpi7ChartData: BarChartDataItem[] =
    ops?.kpi_7.frequency_distribution.map((f) => ({
      label: f.label,
      value: f.state_count,
    })) ?? [];

  const kpi9ChartData: BarChartDataItem[] = ops
    ? AUTHORITY_ORDER.map((key) => ({
        label: AUTHORITY_LABELS[key] ?? key,
        value: ops.kpi_9.authority_participation[key] ?? 0,
      }))
    : [];

  const kpi10Rows: Record<string, any>[] = ops?.kpi_10.states ?? [];

  const kpi11Rows: Record<string, any>[] = domains?.kpi_11.domains_assessed ?? [];

  // KPI 12: grouped bar chart — avg score vs. weightage per domain
  const kpi12ChartData: BarChartDataItem[] =
    domains?.kpi_12.domain_scores.map((d) => ({
      label: d.domain_code,
      values: [Number(d.avg_score), Number(d.weightage)],
    })) ?? [];

  // ─── RENDER ──────────────────────────────────────────────────────────────
  return (
    <Box>
      {/* Section Header */}
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Process Quality &amp; Operations
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        KPIs measuring assessment frequency, visit coverage, authority participation,
        VSK integration, and domain-level scoring.
      </Typography>

      <Grid container spacing={3}>
        {/* KPI 8: Visit Coverage (card) */}
        <Grid item xs={12} sm={6} md={4}>
          <KpiCard
            kpiNo={8}
            title="Visit Coverage"
            value={ops ? `${Number(ops.kpi_8.visit_coverage_pct).toFixed(1)}%` : '—'}
            subtitle={
              ops
                ? `${ops.kpi_8.visited_schools.toLocaleString()} of ${ops.kpi_8.total_accredited.toLocaleString()} schools`
                : 'visited schools vs. accredited'
            }
            loading={loading}
          />
        </Grid>

        {/* KPI 10: States with VSK Integration (card) */}
        <Grid item xs={12} sm={6} md={4}>
          <KpiCard
            kpiNo={10}
            title="States with VSK Integration"
            value={ops?.kpi_10.states_with_vsk ?? '—'}
            subtitle="states integrated with VSK"
            loading={loading}
          />
        </Grid>

        {/* KPI 11: Domains Assessed count (card) */}
        <Grid item xs={12} sm={6} md={4}>
          <KpiCard
            kpiNo={11}
            title="Domains Assessed"
            value={domains?.kpi_11.domains_assessed.length ?? '—'}
            subtitle="distinct domains under assessment"
            loading={loading}
          />
        </Grid>

        {/* KPI 7: Bar Chart — Frequency Distribution */}
        <Grid item xs={12} md={6}>
          <KpiBarChart
            title="Accreditation Frequency Distribution"
            data={kpi7ChartData}
            xAxisLabel="Frequency"
            yAxisLabel="Number of States"
            height={320}
            loading={loading}
          />
        </Grid>

        {/* KPI 9: Horizontal Bar Chart — Authority Participation */}
        <Grid item xs={12} md={6}>
          <KpiBarChart
            title="Authority Participation (%)"
            data={kpi9ChartData}
            xAxisLabel="Participation %"
            yAxisLabel="Authority"
            horizontal
            height={320}
            loading={loading}
          />
        </Grid>

        {/* KPI 12: Grouped Bar Chart — Domain Scores vs. Weightage */}
        <Grid item xs={12} md={7}>
          <KpiBarChart
            title="Domain Average Scores & Weightage"
            data={kpi12ChartData}
            seriesNames={['Avg Score', 'Weightage']}
            xAxisLabel="Domain"
            yAxisLabel="Value"
            height={340}
            loading={loading}
          />
        </Grid>

        {/* KPI 11: Table — Domains Assessed */}
        <Grid item xs={12} md={5}>
          <KpiTable
            title="Domains Assessed by State Count"
            columns={DOMAIN_TABLE_COLUMNS}
            rows={kpi11Rows}
            defaultRowsPerPage={10}
            loading={loading}
            maxHeight={360}
          />
        </Grid>

        {/* KPI 10: Table — States with VSK Integration */}
        <Grid item xs={12}>
          <KpiTable
            title="States with VSK Integration"
            columns={VSK_TABLE_COLUMNS}
            rows={kpi10Rows}
            defaultRowsPerPage={10}
            loading={loading}
            maxHeight={360}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
