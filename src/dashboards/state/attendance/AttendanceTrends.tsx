import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import ReactECharts from 'echarts-for-react';
import { useQuery } from '@tanstack/react-query';
import { useDashboardFilters } from '../../shared/DashboardFilterLayout';
import { attendanceApi, TrendData, TrendDimension } from './attendanceApi';
import { ATT_COLORS } from './attendanceColors';

/** Daily trend point: date/period label + teacher/student %. */
interface TrendPoint {
  date: string;
  teacher: number;
  student: number;
}

// UI chip keys for the Present-card dimension tabs (not data — just the fixed
// set of selectable labels; actual series come from the live API).
const CLASS_KEYS = Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`);
const GENDER_KEYS = ['Male', 'Female', 'Others'] as const;
const CATEGORY_KEYS = ['General', 'SC', 'ST', 'OBC'] as const;

/**
 * Page 2 — Trends (design.md §8).
 *   The date range is owned by the SHARED top filter row (its dateRange leading
 *   filter, bounded to the last 6 months). This page adds quick-range presets
 *   (30D default | 3M | 6M) that write the matching window back to that top-row
 *   picker — one source of truth, one API call feeding BOTH cards.
 *   Rationale (perf): presets map to a single cached, pre-aggregated backend
 *   call (`/attendance/trend?range=30D`) returning {reported, present} together
 *   — one round-trip, one cache key. A manual range uses `?fromDate=&toDate=`
 *   (uncached). 30D = daily points; 3M/6M = weekly.
 *   Card 1: "Attendance Reported" — Teachers vs Students participation %.
 *   Card 2: "Attendance Present"  — dimension tabs Overall | Class | Gender
 *           | Category. Overall = teacher/student present. Class/Gender/Category
 *           reveal checkbox chips; each checked series is a line (dynamic).
 * Live data only — no local fallback; empty charts show when the API has no
 * data for the selected range/scope.
 */

type Dimension = 'Overall' | 'Class' | 'Gender' | 'Category';
const DIMENSIONS: Dimension[] = ['Overall', 'Class', 'Gender', 'Category'];

// Shared range presets. Values map 1:1 to the backend `?range=` contract.
// No "Custom" tab — the date-range picker beside the presets covers free
// ranges, hard-bounded to the last 6 months (perf guard, see helpers below).
type RangeKey = '30D' | '3M' | '6M' | 'RANGE';
const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: '30D', label: '30 Days' },
  { key: '3M', label: '3 Months' },
  { key: '6M', label: '6 Months' },
];
// Human label used in the card headers so both titles reflect the active range.
const RANGE_TITLE: Record<RangeKey, string> = {
  '30D': 'Last 30 Days Trend',
  '3M': 'Last 3 Months Trend (Weekly)',
  '6M': 'Last 6 Months Trend (Weekly)',
  RANGE: 'Selected Range Trend',
};

// Date helpers (the 6-month bound itself is enforced by the shared top-row picker).
const toISO = (d: Date) => d.toISOString().slice(0, 10);
const TODAY_ISO = toISO(new Date());
const THIRTY_DAYS_AGO_ISO = (() => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return toISO(d);
})();

// A palette for multi-series (class/category lines) — distinct, page-aligned.
const SERIES_PALETTE = [
  '#0186B3', '#F59E0B', '#8AC53E', '#A07AF0', '#F18F7A', '#14B8A6',
  '#6C5CE7', '#EC4899', '#3B82F6', '#84CC16', '#EF4444', '#0EA5E9',
];

function SectionBar({ title }: { title: string }) {
  return (
    <Box
      sx={{
        background: `linear-gradient(90deg, ${ATT_COLORS.chrome}, ${ATT_COLORS.chrome}CC)`,
        color: '#fff',
        px: 1.5,
        py: 0.6,
        borderRadius: '6px 6px 0 0',
        fontWeight: 700,
        fontSize: '0.82rem',
      }}
    >
      {title}
    </Box>
  );
}

// Two-line (teacher/student) option for the Reported card.
function twoLineOption(points: TrendPoint[], teacherName: string, studentName: string) {
  return {
    tooltip: { trigger: 'axis', valueFormatter: (v: number) => `${v}%` },
    legend: { data: [teacherName, studentName], top: 4, itemWidth: 18, itemHeight: 10, textStyle: { fontSize: 12, fontWeight: 600 } },
    grid: { left: 44, right: 24, top: 42, bottom: 56 },
    xAxis: { type: 'category', data: points.map((p) => p.date), axisLabel: { rotate: 40, fontSize: 10, interval: 0, color: '#6B7280' } },
    yAxis: { type: 'value', min: 0, max: 100, axisLabel: { formatter: '{value}%', color: '#6B7280' }, splitLine: { lineStyle: { color: '#EEF1F6' } } },
    series: [
      { name: teacherName, type: 'line', smooth: true, symbol: 'circle', symbolSize: 5, data: points.map((p) => p.teacher), itemStyle: { color: ATT_COLORS.teacher }, lineStyle: { color: ATT_COLORS.teacher, width: 2 }, label: { show: true, formatter: '{c}%', fontSize: 9, color: ATT_COLORS.teacher, position: 'top' } },
      { name: studentName, type: 'line', smooth: true, symbol: 'circle', symbolSize: 5, data: points.map((p) => p.student), itemStyle: { color: ATT_COLORS.student }, lineStyle: { color: ATT_COLORS.student, width: 2 }, label: { show: true, formatter: '{c}%', fontSize: 9, color: ATT_COLORS.student, position: 'bottom' } },
    ],
  };
}

// Multi-line option with EXPLICIT x-axis labels (live data periods come from
// the API).
function multiLineOptionWithLabels(
  seriesMap: Record<string, number[]>,
  keys: string[],
  labels: string[],
  showPointLabels: boolean,
) {
  return {
    tooltip: { trigger: 'axis', valueFormatter: (v: number) => `${v}%` },
    legend: { type: 'scroll', top: 4, itemWidth: 16, itemHeight: 8, textStyle: { fontSize: 11 } },
    grid: { left: 44, right: 24, top: 42, bottom: 56 },
    xAxis: { type: 'category', data: labels, axisLabel: { rotate: 40, fontSize: 10, interval: 0, color: '#6B7280' } },
    yAxis: { type: 'value', min: 0, max: 100, axisLabel: { formatter: '{value}%', color: '#6B7280' }, splitLine: { lineStyle: { color: '#EEF1F6' } } },
    series: keys.map((k, i) => ({
      name: k,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 4,
      data: seriesMap[k],
      itemStyle: { color: SERIES_PALETTE[i % SERIES_PALETTE.length] },
      lineStyle: { width: 2 },
      label: showPointLabels ? { show: true, formatter: '{c}%', fontSize: 8 } : { show: false },
    })),
  };
}

// Convert a live TrendData dimension sub-tree into { series (UI-labelled), labels }
// aligned across all series (union of periods, gap-filled with null).
function buildDimensionSeries(
  live: TrendData,
  dimension: Exclude<Dimension, 'Overall'>,
): { series: Record<string, number[]>; labels: string[] } | null {
  const raw =
    dimension === 'Class' ? live.present.byClass
    : dimension === 'Gender' ? live.present.byGender
    : live.present.byCategory;
  if (!raw) return null;

  // API key → UI chip label.
  const toLabel = (k: string): string => {
    if (dimension === 'Class') return `Class ${k}`;
    if (dimension === 'Gender') return k.charAt(0).toUpperCase() + k.slice(1);
    // category: general/sc/st/obc → General/SC/ST/OBC
    return k === 'general' ? 'General' : k.toUpperCase();
  };

  // Union of all periods (sorted) → shared x-axis.
  const periodSet = new Set<string>();
  for (const arr of Object.values(raw)) for (const p of arr as { period: string }[]) periodSet.add(p.period);
  const labels = [...periodSet].sort();
  const idx = new Map(labels.map((p, i) => [p, i]));

  const series: Record<string, number[]> = {};
  for (const [k, arr] of Object.entries(raw)) {
    const line = new Array(labels.length).fill(null) as number[];
    for (const p of arr as { period: string; value: number }[]) {
      const i = idx.get(p.period);
      if (i != null) line[i] = p.value;
    }
    series[toLabel(k)] = line;
  }
  return { series, labels };
}

// Selectable chip (checkbox style) — active uses the page chrome colour.
function SelectChip({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <Chip
      label={label}
      size="small"
      onClick={onToggle}
      variant={checked ? 'filled' : 'outlined'}
      sx={{
        fontWeight: 600,
        fontSize: '0.72rem',
        bgcolor: checked ? `${ATT_COLORS.chrome}22` : 'transparent',
        color: checked ? ATT_COLORS.chrome : '#6B7280',
        border: `1px solid ${checked ? ATT_COLORS.chrome : '#D1D5DB'}`,
        '&:hover': { bgcolor: checked ? `${ATT_COLORS.chrome}33` : '#F3F4F6' },
      }}
    />
  );
}

// Tab pill — active filled with page chrome colour.
function TabPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        px: 2,
        py: 0.5,
        borderRadius: '999px',
        fontSize: '0.78rem',
        fontWeight: 700,
        bgcolor: active ? ATT_COLORS.chrome : 'transparent',
        color: active ? '#fff' : '#6B7280',
        border: `1px solid ${active ? ATT_COLORS.chrome : '#D1D5DB'}`,
        transition: 'all 0.15s',
        '&:hover': { borderColor: ATT_COLORS.chrome },
      }}
    >
      {label}
    </Box>
  );
}

export default function AttendanceTrends() {
  // The date range is owned by the shared top filter row (its dateRange leading
  // filter). Trends reads From/To from there and the presets write back to it,
  // so there is a single source of truth and one API call for both cards.
  const f = useDashboardFilters();
  const { leading, setLeading } = f;
  const fromDate = leading.fromDate ?? THIRTY_DAYS_AGO_ISO;
  const toDate = leading.toDate ?? TODAY_ISO;

  // Which preset (if any) matches the current From/To window — drives the
  // toggle highlight and the card titles. 'RANGE' = a manual/custom window.
  const range: RangeKey = useMemo(() => {
    const spanDays = Math.round(
      (new Date(toDate).getTime() - new Date(fromDate).getTime()) / 86_400_000,
    );
    const endsToday = toDate === TODAY_ISO;
    if (endsToday && spanDays === 30) return '30D';
    if (endsToday && Math.abs(spanDays - 91) <= 3) return '3M';
    if (endsToday && Math.abs(spanDays - 182) <= 3) return '6M';
    return 'RANGE';
  }, [fromDate, toDate]);
  const rangeTitle = RANGE_TITLE[range];

  // Clicking a preset writes the equivalent window back into the shared top-row
  // date-range picker (30D = last 30 days; 3M/6M = last N months).
  const onPreset = (key: RangeKey) => {
    const to = new Date();
    const from = new Date();
    if (key === '30D') from.setDate(from.getDate() - 30);
    else if (key === '3M') from.setMonth(from.getMonth() - 3);
    else if (key === '6M') from.setMonth(from.getMonth() - 6);
    setLeading('fromDate', toISO(from));
    setLeading('toDate', toISO(to));
  };

  // Present-card dimension + per-dimension selections.
  const [dimension, setDimension] = useState<Dimension>('Overall');
  const [classSel, setClassSel] = useState<string[]>(['Class 1', 'Class 5', 'Class 8', 'Class 10', 'Class 12']);
  const [genderSel, setGenderSel] = useState<string[]>([...GENDER_KEYS]);
  const [categorySel, setCategorySel] = useState<string[]>([...CATEGORY_KEYS]);

  const toggle = (list: string[], set: (v: string[]) => void, key: string) =>
    set(list.includes(key) ? list.filter((k) => k !== key) : [...list, key]);

  // ── Live trend fetch (split/lazy: dimension is part of the query key so tab
  //    switches fetch only that breakdown; presets/range drive from/to). ───────
  const apiDimension: TrendDimension =
    dimension === 'Class' ? 'class'
    : dimension === 'Gender' ? 'gender'
    : dimension === 'Category' ? 'category'
    : 'overall';
  const trendParams = {
    range: range === 'RANGE' ? undefined : range,
    fromDate: range === 'RANGE' ? fromDate : undefined,
    toDate: range === 'RANGE' ? toDate : undefined,
    dimension: apiDimension,
    stateKey: f.stateKey || undefined,
    districtKey: f.districtKey || undefined,
    blockKey: f.blockKey || undefined,
    clusterKey: f.clusterKey || undefined,
    udiseCode: f.udiseCode || undefined,
  };
  const { data: trendEnvelope } = useQuery({
    queryKey: ['attendance', 'trend', trendParams],
    queryFn: () => attendanceApi.getTrend(trendParams),
    staleTime: 15 * 60 * 1000, // align with the 15–30 min trend TTL
  });
  const live = trendEnvelope?.data ?? null;

  // Reported card (participation %) — teacher & student. Live only; empty array
  // when there is no data yet (chart renders with no series).
  const reportedPoints: TrendPoint[] = live
    ? live.reported.map((p) => ({ date: p.period, teacher: p.teacher, student: p.student }))
    : [];

  // Present card — Overall uses two lines; dimensions use multi-line. Live only.
  const presentOption = useMemo(() => {
    if (dimension === 'Overall') {
      const pts: TrendPoint[] = live?.present.overall
        ? live.present.overall.map((p) => ({ date: p.period, teacher: p.teacher, student: p.student }))
        : [];
      return twoLineOption(pts, 'Teachers (Present) Trend', 'Students (Present) Trend');
    }
    // Dimensioned: build {seriesLabel: number[]} + shared period labels from live.
    const built = live ? buildDimensionSeries(live, dimension) : null;
    if (built) {
      const sel =
        dimension === 'Class' ? classSel : dimension === 'Gender' ? genderSel : categorySel;
      const keys = sel.filter((k) => k in built.series);
      return multiLineOptionWithLabels(built.series, keys, built.labels, dimension !== 'Class');
    }
    // No live dimensioned data — render an empty chart (no fixed-label lines).
    return multiLineOptionWithLabels({}, [], [], false);
  }, [dimension, classSel, genderSel, categorySel, live]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, height: '100%' }}>
      {/* Quick presets only — the date range lives in the shared top filter row.
          Clicking a preset writes the matching window back to that top-row picker. */}
      <Paper sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
        <Typography sx={{ fontWeight: 700, color: '#374151', fontSize: '0.78rem' }}>Quick Range:</Typography>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={range === 'RANGE' ? null : range}
          onChange={(_, v: RangeKey | null) => v && onPreset(v)}
          sx={{
            '& .MuiToggleButton-root': {
              textTransform: 'none',
              fontSize: '0.74rem',
              fontWeight: 600,
              px: 1.5,
              py: 0.35,
              color: '#6B7280',
              borderColor: '#D1D5DB',
            },
            '& .Mui-selected': {
              bgcolor: `${ATT_COLORS.chrome} !important`,
              color: '#fff !important',
              borderColor: `${ATT_COLORS.chrome} !important`,
            },
          }}
        >
          {RANGE_OPTIONS.map((r) => (
            <ToggleButton key={r.key} value={r.key}>
              {r.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Paper>

      {/* Card 1 — Attendance Reported */}
      <Paper sx={{ overflow: 'hidden' }}>
        <SectionBar title={`Attendance Reported (${rangeTitle})`} />
        <Box sx={{ p: 1 }}>
          <ReactECharts option={twoLineOption(reportedPoints, 'Teachers (Participation) Trend', 'Students (Participation) Trend')} style={{ height: 280 }} notMerge />
        </Box>
      </Paper>

      {/* Card 2 — Attendance Present, with dimension tabs */}
      <Paper sx={{ overflow: 'hidden' }}>
        <SectionBar title={`Attendance Present (${rangeTitle})`} />
        <Box sx={{ p: 1 }}>
          {/* Dimension tabs */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
            {DIMENSIONS.map((dim) => (
              <TabPill key={dim} label={dim} active={dimension === dim} onClick={() => setDimension(dim)} />
            ))}
          </Box>

          {/* Checkbox chips per dimension */}
          {dimension === 'Class' && (
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1 }}>
              {CLASS_KEYS.map((c) => (
                <SelectChip key={c} label={c} checked={classSel.includes(c)} onToggle={() => toggle(classSel, setClassSel, c)} />
              ))}
            </Box>
          )}
          {dimension === 'Gender' && (
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1 }}>
              {GENDER_KEYS.map((g) => (
                <SelectChip key={g} label={g} checked={genderSel.includes(g)} onToggle={() => toggle(genderSel, setGenderSel, g)} />
              ))}
            </Box>
          )}
          {dimension === 'Category' && (
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1 }}>
              {CATEGORY_KEYS.map((c) => (
                <SelectChip key={c} label={c} checked={categorySel.includes(c)} onToggle={() => toggle(categorySel, setCategorySel, c)} />
              ))}
            </Box>
          )}

          <ReactECharts option={presentOption} style={{ height: 300 }} notMerge />
        </Box>
      </Paper>
    </Box>
  );
}
