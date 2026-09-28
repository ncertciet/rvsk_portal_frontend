import { useState, useEffect, ReactNode } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import { Box, TextField, Button, Autocomplete } from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import {
  attendanceApi,
  FilterConfig,
  StateOption,
  DistrictOption,
  BlockOption,
  ClusterOption,
  SchoolOption,
} from '../state/attendance/attendanceApi';

/**
 * Generic, reusable dashboard filter bar shared by ALL RVSK dashboards
 * (Attendance, Assessment, Administration, Accreditation).
 *
 * The master-data cascade — State/UT → District → Block → Cluster → School — is
 * identical everywhere (same ..._KEY contract, same scope-locking, same reset).
 * What differs per dashboard/page is the LEADING filter(s) that sit *before*
 * State/UT: a single Date (Attendance Summary), a Date Range (Attendance
 * Trends), an Academic Year (Accreditation), etc.
 *
 * Those leading filters are declared per-route via the `leading` prop as small
 * descriptors; the layout renders them as the first controls in the same row
 * and merges their values into the shared filter context. This keeps the row a
 * single line and lets each dashboard plug in whatever leading control it needs
 * without the layout knowing about specific filter semantics.
 */

// ── Leading-filter descriptors ────────────────────────────────────────────────
export type LeadingFilter =
  | { type: 'date'; key?: string; label?: string; default?: string; min?: string; max?: string }
  | {
      type: 'dateRange';
      fromKey?: string;
      toKey?: string;
      fromLabel?: string;
      toLabel?: string;
      /** Perf guard: how many months back the earliest selectable date may be. */
      maxMonths?: number;
      defaultFrom?: string;
      defaultTo?: string;
    }
  | {
      type: 'academicYear';
      key?: string;
      label?: string;
      options: { value: string; label: string }[];
      default?: string;
    };

// Values produced by leading filters, keyed by their `key`/`fromKey`/`toKey`.
export type LeadingValues = Record<string, string>;

/**
 * Shared filter context passed to every dashboard sub-page. Master ..._KEY
 * values are always present; leading-filter values live under `leading` (keyed
 * by each descriptor's key). `selectedDate` is kept as a convenience mirror for
 * pages that use a single date leading filter (back-compat with attendance).
 */
export interface DashboardFilterContext {
  leading: LeadingValues;
  /** Update a leading-filter value from a child page (e.g. Trends presets
   * writing the computed From/To back into the top-row date-range picker). */
  setLeading: (key: string, value: string) => void;
  selectedDate: string;
  stateKey: string;
  districtKey: string;
  blockKey: string;
  clusterKey: string;
  udiseCode: string;
  scopeLevel: string;
}

export function useDashboardFilters() {
  return useOutletContext<DashboardFilterContext>();
}

// ── Leading-filter helpers ────────────────────────────────────────────────────
const toISO = (d: Date) => d.toISOString().slice(0, 10);

function monthsAgoISO(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return toISO(d);
}

// Seed the initial leading values from the descriptors.
function initLeadingValues(leading: LeadingFilter[]): LeadingValues {
  const v: LeadingValues = {};
  for (const f of leading) {
    if (f.type === 'date') {
      v[f.key ?? 'date'] = f.default ?? toISO(new Date());
    } else if (f.type === 'dateRange') {
      const months = f.maxMonths ?? 6;
      v[f.fromKey ?? 'fromDate'] = f.defaultFrom ?? monthsAgoISO(1);
      v[f.toKey ?? 'toDate'] = f.defaultTo ?? toISO(new Date());
      // Stash the bound so reset + input min/max stay consistent.
      v[`__${f.fromKey ?? 'fromDate'}_min`] = monthsAgoISO(months);
    } else if (f.type === 'academicYear') {
      v[f.key ?? 'academicYear'] = f.default ?? f.options[0]?.value ?? '';
    }
  }
  return v;
}

interface DashboardFilterLayoutProps {
  /** Leading filter(s) rendered before State/UT. Defaults to a single Date. */
  leading?: LeadingFilter[];
}

export default function DashboardFilterLayout({
  leading = [{ type: 'date' }],
}: DashboardFilterLayoutProps) {
  // Config drives which master levels are visible/locked (backend derives scope
  // from the JWT; there are no hardcoded role names).
  const [config, setConfig] = useState<FilterConfig | null>(null);

  // Leading-filter values (generic bag keyed by descriptor key).
  const [leadingValues, setLeadingValues] = useState<LeadingValues>(() =>
    initLeadingValues(leading),
  );
  const setLeading = (key: string, value: string) =>
    setLeadingValues((prev) => ({ ...prev, [key]: value }));

  // Master cascade state.
  const [stateKey, setStateKey] = useState<string>('');
  const [districtKey, setDistrictKey] = useState<string>('');
  const [blockKey, setBlockKey] = useState<string>('');
  const [clusterKey, setClusterKey] = useState<string>('');
  const [udiseCode, setUdiseCode] = useState<string>('');

  const [states, setStates] = useState<StateOption[]>([]);
  const [districts, setDistricts] = useState<DistrictOption[]>([]);
  const [blocks, setBlocks] = useState<BlockOption[]>([]);
  const [clusters, setClusters] = useState<ClusterOption[]>([]);
  const [schools, setSchools] = useState<SchoolOption[]>([]);

  const isLocked = (level: string) => config?.lockedLevels.includes(level) ?? false;
  const showState = !!config && !isLocked('state');
  const showDistrict = !!config && !isLocked('district');

  // Load config once.
  useEffect(() => {
    attendanceApi
      .getConfig()
      .then(setConfig)
      .catch(() => {
        setConfig({
          dashboardId: 'attendance',
          levels: ['state', 'district', 'block', 'cluster', 'school'],
          required: [],
          searchable: ['state', 'district', 'block', 'cluster', 'school'],
          defaultScope: { level: 'national', value: null },
          lockedLevels: [],
        });
      });
  }, []);

  // States.
  useEffect(() => {
    if (!config) return;
    attendanceApi
      .getStates()
      .then((rows) => {
        setStates(rows);
        if (isLocked('state') && rows.length === 1) setStateKey(rows[0].stateKey);
      })
      .catch(() => setStates([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  // Cascade: districts.
  useEffect(() => {
    if (stateKey) {
      attendanceApi.getDistricts(stateKey).then(setDistricts).catch(() => setDistricts([]));
    } else {
      setDistricts([]);
    }
    if (!isLocked('district')) setDistrictKey('');
    setBlockKey('');
    setClusterKey('');
    setUdiseCode('');
    setBlocks([]);
    setClusters([]);
    setSchools([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateKey]);

  // Cascade: blocks.
  useEffect(() => {
    if (districtKey) {
      attendanceApi.getBlocks(districtKey).then(setBlocks).catch(() => setBlocks([]));
    } else {
      setBlocks([]);
    }
    setBlockKey('');
    setClusterKey('');
    setUdiseCode('');
    setClusters([]);
    setSchools([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [districtKey]);

  // Cascade: clusters.
  useEffect(() => {
    if (blockKey) {
      attendanceApi.getClusters(blockKey).then(setClusters).catch(() => setClusters([]));
    } else {
      setClusters([]);
    }
    setClusterKey('');
    setUdiseCode('');
    setSchools([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockKey]);

  // Cascade: schools.
  useEffect(() => {
    if (clusterKey) {
      attendanceApi.getSchools({ clusterKey }).then(setSchools).catch(() => setSchools([]));
    } else {
      setSchools([]);
    }
    setUdiseCode('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clusterKey]);

  // Reset clears leading filters + master levels below the locked scope.
  const handleReset = () => {
    setLeadingValues(initLeadingValues(leading));
    if (!isLocked('state')) setStateKey('');
    if (!isLocked('district')) setDistrictKey('');
    setBlockKey('');
    setClusterKey('');
    setUdiseCode('');
    setBlocks([]);
    setClusters([]);
    setSchools([]);
  };

  // Convenience mirror: first single-date leading filter → selectedDate.
  const firstDate = leading.find((f) => f.type === 'date') as
    | Extract<LeadingFilter, { type: 'date' }>
    | undefined;
  const selectedDate = firstDate ? leadingValues[firstDate.key ?? 'date'] ?? '' : '';

  const filterContext: DashboardFilterContext = {
    leading: leadingValues,
    setLeading,
    selectedDate,
    stateKey,
    districtKey,
    blockKey,
    clusterKey,
    udiseCode,
    scopeLevel: config?.defaultScope.level ?? 'national',
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          bgcolor: '#fff',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'nowrap',
          gap: 1,
          px: 2,
          py: 1,
          overflowX: 'auto',
          flexShrink: 0,
        }}
      >
        {/* Leading filter(s) — rendered first, before State/UT. */}
        {leading.map((f, i) => renderLeading(f, i, leadingValues, setLeading))}

        {showState && (
          <Autocomplete
            size="small"
            sx={{ flex: '1 1 0', minWidth: 130 }}
            options={states}
            getOptionLabel={(o) => o.stateName}
            value={states.find((s) => s.stateKey === stateKey) ?? null}
            onChange={(_, v) => setStateKey(v?.stateKey ?? '')}
            renderInput={(params) => <TextField {...params} label="State/UT" />}
          />
        )}

        {showDistrict && (
          <Autocomplete
            size="small"
            sx={{ flex: '1 1 0', minWidth: 120 }}
            options={districts}
            getOptionLabel={(o) => o.districtName}
            value={districts.find((d) => d.districtKey === districtKey) ?? null}
            onChange={(_, v) => setDistrictKey(v?.districtKey ?? '')}
            renderInput={(params) => <TextField {...params} label="District" />}
          />
        )}

        <Autocomplete
          size="small"
          sx={{ flex: '1 1 0', minWidth: 110 }}
          options={blocks}
          getOptionLabel={(o) => o.blockName}
          value={blocks.find((b) => b.blockKey === blockKey) ?? null}
          onChange={(_, v) => setBlockKey(v?.blockKey ?? '')}
          renderInput={(params) => <TextField {...params} label="Block" />}
        />

        <Autocomplete
          size="small"
          sx={{ flex: '1 1 0', minWidth: 110 }}
          options={clusters}
          getOptionLabel={(o) => o.clusterName}
          value={clusters.find((c) => c.clusterKey === clusterKey) ?? null}
          onChange={(_, v) => setClusterKey(v?.clusterKey ?? '')}
          renderInput={(params) => <TextField {...params} label="Cluster" />}
        />

        <Autocomplete
          size="small"
          sx={{ flex: '1.4 1 0', minWidth: 150 }}
          options={schools}
          getOptionLabel={(o) => `${o.schoolName} (${o.udiseCode})`}
          value={schools.find((s) => s.udiseCode === udiseCode) ?? null}
          onChange={(_, v) => setUdiseCode(v?.udiseCode ?? '')}
          renderInput={(params) => <TextField {...params} label="School" />}
        />

        <Button
          variant="contained"
          size="small"
          startIcon={<RestartAltIcon />}
          onClick={handleReset}
          sx={{
            bgcolor: '#10B981',
            '&:hover': { bgcolor: '#059669' },
            textTransform: 'none',
            fontWeight: 600,
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          RESET
        </Button>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', p: 1.5, bgcolor: '#F8FAFC' }}>
        <Outlet context={filterContext} />
      </Box>
    </Box>
  );
}

// Render one leading-filter descriptor as the appropriate control(s).
function renderLeading(
  f: LeadingFilter,
  i: number,
  values: LeadingValues,
  setLeading: (key: string, value: string) => void,
): ReactNode {
  if (f.type === 'date') {
    const key = f.key ?? 'date';
    return (
      <TextField
        key={`lead-${i}`}
        type="date"
        size="small"
        label={f.label ?? 'Date'}
        value={values[key] ?? ''}
        onChange={(e) => setLeading(key, e.target.value)}
        InputLabelProps={{ shrink: true }}
        inputProps={{ min: f.min, max: f.max }}
        sx={{ width: 150, flexShrink: 0, '& input': { fontSize: 13, py: 0.9 } }}
      />
    );
  }

  if (f.type === 'dateRange') {
    const fromKey = f.fromKey ?? 'fromDate';
    const toKey = f.toKey ?? 'toDate';
    const minISO = values[`__${fromKey}_min`] ?? monthsAgoISO(f.maxMonths ?? 6);
    const maxISO = toISO(new Date());
    const from = values[fromKey] ?? '';
    const to = values[toKey] ?? '';
    return (
      <Box key={`lead-${i}`} sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
        <TextField
          type="date"
          size="small"
          label={f.fromLabel ?? 'From'}
          value={from}
          onChange={(e) => setLeading(fromKey, e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: minISO, max: to || maxISO }}
          sx={{ width: 150, '& input': { fontSize: 13, py: 0.9 } }}
        />
        <TextField
          type="date"
          size="small"
          label={f.toLabel ?? 'To'}
          value={to}
          onChange={(e) => setLeading(toKey, e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: from || minISO, max: maxISO }}
          sx={{ width: 150, '& input': { fontSize: 13, py: 0.9 } }}
        />
      </Box>
    );
  }

  // academicYear
  const key = f.key ?? 'academicYear';
  return (
    <Autocomplete
      key={`lead-${i}`}
      size="small"
      disableClearable
      sx={{ width: 150, flexShrink: 0 }}
      options={f.options}
      getOptionLabel={(o) => o.label}
      value={f.options.find((o) => o.value === values[key]) ?? f.options[0]}
      onChange={(_, v) => setLeading(key, v?.value ?? '')}
      renderInput={(params) => <TextField {...params} label={f.label ?? 'Academic Year'} />}
    />
  );
}
