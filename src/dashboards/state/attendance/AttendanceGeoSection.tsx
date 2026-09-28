import { useState, useMemo, useEffect } from 'react';
import { Box, Typography, Paper, Grid, ToggleButtonGroup, ToggleButton, Tabs, Tab } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { feature } from 'topojson-client';
import { ATT_COLORS } from './attendanceColors';
import {
  mockStateAttendanceTeachers,
  mockStateAttendanceStudents,
  StateAttendanceRow,
} from './attendanceMockData';

/**
 * Bottom section of Page 1:
 *   LEFT  — India choropleth: each state coloured by attendance % band.
 *   RIGHT — State/UT-wise Reported vs Not-Reported bars, TEACHERS/STUDENTS toggle.
 * Fully data-driven: both the map colours and the bars read the same
 * per-state dataset (mock now; swap for the live API in one place).
 *
 * Map source: udit-001/india-maps-data (TopoJSON, states object, `st_nm`).
 * Registered with ECharts once as 'india' (TopoJSON → GeoJSON via topojson-client).
 */

// India map is loaded once from /public and registered with ECharts as 'india'.
// Fetched at runtime (not bundled) so the ~886KB TopoJSON stays out of the JS
// bundle and out of tsc's type inference.
const MAP_NAME = 'india';
let mapPromise: Promise<void> | null = null;
function loadIndiaMap(): Promise<void> {
  if (!mapPromise) {
    mapPromise = fetch('/geo/india-topo.json')
      .then((r) => r.json())
      .then((topo: any) => {
        const geo = feature(topo, topo.objects.states);
        echarts.registerMap(MAP_NAME, geo as any);
      });
  }
  return mapPromise;
}

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

const BANDS = [
  { label: '0% - 25%', color: '#F87171', max: 25 },
  { label: '25% - 50%', color: '#FBBF24', max: 50 },
  { label: '50% - 75%', color: '#A3E635', max: 75 },
  { label: '75% - 100%', color: '#15803D', max: 101 },
];

// Map dataset state names → the geojson `st_nm` names (handle the few that differ).
const NAME_MAP: Record<string, string> = {
  'Andaman And Nicobar': 'Andaman and Nicobar Islands',
  'DNH & DD': 'Dadra and Nagar Haveli and Daman and Diu',
  'Jammu & Kashmir': 'Jammu and Kashmir',
};
const toMapName = (s: string) => NAME_MAP[s] ?? s;

function mapOption(rows: StateAttendanceRow[]) {
  const data = rows.map((r) => ({ name: toMapName(r.state), value: r.reportedPct }));
  return {
    tooltip: {
      trigger: 'item',
      formatter: (p: any) => (p.value == null || Number.isNaN(p.value) ? `${p.name}: no data` : `${p.name}: ${p.value}%`),
    },
    visualMap: {
      type: 'piecewise',
      show: false, // legend is rendered separately to match the reference
      pieces: [
        { lte: 25, color: BANDS[0].color },
        { gt: 25, lte: 50, color: BANDS[1].color },
        { gt: 50, lte: 75, color: BANDS[2].color },
        { gt: 75, color: BANDS[3].color },
      ],
    },
    series: [
      {
        type: 'map',
        map: MAP_NAME,
        roam: false,
        // Fit fully inside the panel (no clipping); slightly under full size so
        // the map edges (esp. north/south tips) are never cut off.
        layoutCenter: ['50%', '50%'],
        layoutSize: '92%',
        zoom: 1,
        emphasis: { label: { show: false }, itemStyle: { areaColor: undefined } },
        itemStyle: { borderColor: '#fff', borderWidth: 0.5, areaColor: '#E5E7EB' },
        data,
      },
    ],
  };
}

function barOption(rows: StateAttendanceRow[]) {
  const sorted = [...rows].sort((a, b) => b.reportedPct - a.reportedPct);
  const cats = sorted.map((r) => r.state).reverse();
  const reported = sorted.map((r) => r.reportedPct).reverse();
  const notReported = sorted.map((r) => 100 - r.reportedPct).reverse();
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (p: any[]) => `${p[0].name}<br/>Reported: ${p[0].value}%<br/>Not-Reported: ${p[1].value}%`,
    },
    legend: { data: ['Reported', 'Not- Reported'], top: 0, itemWidth: 12, itemHeight: 12 },
    grid: { left: 130, right: 30, top: 28, bottom: 20 },
    xAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
    yAxis: { type: 'category', data: cats, axisLabel: { fontSize: 10 } },
    series: [
      { name: 'Reported', type: 'bar', stack: 'a', data: reported, itemStyle: { color: ATT_COLORS.present } },
      { name: 'Not- Reported', type: 'bar', stack: 'a', data: notReported, itemStyle: { color: '#D1D5DB' } },
    ],
  };
}

const LEVELS = ['States/UTs', 'Districts', 'Blocks', 'Clusters', 'Schools'];

export default function AttendanceGeoSection() {
  const [audience, setAudience] = useState<'teachers' | 'students'>('teachers');
  const [level, setLevel] = useState(0);
  const [mapReady, setMapReady] = useState(false);

  // Load + register the India map once, then allow the map chart to render.
  useEffect(() => {
    let active = true;
    loadIndiaMap().then(() => { if (active) setMapReady(true); }).catch(() => {});
    return () => { active = false; };
  }, []);

  const rows = audience === 'teachers' ? mockStateAttendanceTeachers : mockStateAttendanceStudents;
  const mapOpt = useMemo(() => mapOption(rows), [rows]);
  const barOpt = useMemo(() => barOption(rows), [rows]);

  return (
    <Grid container spacing={1.25}>
      {/* LEFT — India choropleth + legend + level tabs */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <SectionBar title="Attendance by Geography" />
          <Box sx={{ p: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end', mb: 0.5, flexWrap: 'wrap' }}>
              {BANDS.map((b) => (
                <Box key={b.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: b.color }} />
                  <Typography sx={{ fontSize: '0.66rem', color: '#374151' }}>{b.label}</Typography>
                </Box>
              ))}
            </Box>

            {mapReady ? (
              <ReactECharts option={mapOpt} style={{ height: 460, flex: 1 }} notMerge />
            ) : (
              <Box sx={{ height: 460, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '0.8rem' }}>
                Loading map…
              </Box>
            )}

            <Tabs
              value={level}
              onChange={(_, v) => setLevel(v)}
              variant="fullWidth"
              sx={{ mt: 0.5, minHeight: 34, '& .MuiTab-root': { minHeight: 34, fontSize: '0.72rem', textTransform: 'none', fontWeight: 600 } }}
            >
              {LEVELS.map((l) => (
                <Tab key={l} label={l} />
              ))}
            </Tabs>
          </Box>
        </Paper>
      </Grid>

      {/* RIGHT — State/UT wise bars + audience toggle */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <SectionBar title={`State/UT wise Attendance (${audience === 'teachers' ? 'Teachers' : 'Students'})`} />
          <Box sx={{ p: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <ReactECharts option={barOpt} style={{ height: 460 }} notMerge />
            <ToggleButtonGroup
              exclusive
              fullWidth
              size="small"
              value={audience}
              onChange={(_, v) => v && setAudience(v)}
              sx={{ mt: 0.5 }}
            >
              <ToggleButton value="teachers" sx={{ fontWeight: 700, '&.Mui-selected': { bgcolor: ATT_COLORS.teacher, color: '#fff', '&:hover': { bgcolor: ATT_COLORS.teacher } } }}>
                TEACHERS
              </ToggleButton>
              <ToggleButton value="students" sx={{ fontWeight: 700, '&.Mui-selected': { bgcolor: ATT_COLORS.student, color: '#fff', '&:hover': { bgcolor: ATT_COLORS.student } } }}>
                STUDENTS
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}
