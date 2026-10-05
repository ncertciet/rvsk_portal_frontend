import { useMemo, useState } from 'react';
import { Box, Typography, Paper, Grid, ToggleButtonGroup, ToggleButton } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import { useQuery } from '@tanstack/react-query';
import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ATT_COLORS } from './attendanceColors';
import { attendanceApi, GeoRegion } from './attendanceApi';
import { useDashboardFilters } from '../../shared/DashboardFilterLayout';

/**
 * Bottom section of Page 1:
 *   LEFT  — "Attendance by Geography": a MapLibre (OpenStreetMap) map with one
 *           coloured dot per child region at its centroid, coloured by STUDENT
 *           attendance % (4 bands). Click a dot to drill
 *           national→state→district→block→cluster→school (lat/long points).
 *   RIGHT — "State/UT-wise Attendance": 100% stacked Reported/Not-Reported bar
 *           (teacher reported % / student attendance %), sorted desc, click to
 *           drill into that region.
 * Both read the same drill-aware /attendance/geo payload (regions + childLevel).
 */

// Free OpenStreetMap raster style (no API key). Attribution shown by the map.
const OSM_STYLE: any = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
};

// India bounding box — used to centre the map and to reject garbage coordinates
// (some master rows have lat/lng like 0.49/1.47).
const INDIA = { minLat: 6, maxLat: 37.5, minLng: 68, maxLng: 97.5 };
const inIndia = (lat: number | null, lng: number | null): lat is number =>
  lat != null && lng != null &&
  lat >= INDIA.minLat && lat <= INDIA.maxLat && lng >= INDIA.minLng && lng <= INDIA.maxLng;

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
  { label: '0% - 25%', color: '#F87171', lte: 25 },
  { label: '25% - 50%', color: '#FBBF24', lte: 50 },
  { label: '50% - 75%', color: '#A3E635', lte: 75 },
  { label: '75% - 100%', color: '#15803D', lte: 100.01 },
];
function bandColor(pct: number): string {
  for (const b of BANDS) if (pct <= b.lte) return b.color;
  return BANDS[BANDS.length - 1].color;
}

// 100% stacked horizontal Reported/Not-Reported bar. `rows` carry a key so a
// click can drill. Sorted desc; highest at top.
function barOption(rows: { key: string; name: string; pct: number }[]) {
  const sorted = [...rows].sort((a, b) => b.pct - a.pct);
  const cats = sorted.map((r) => r.name).reverse();
  const reported = sorted.map((r) => r.pct).reverse();
  const notReported = sorted.map((r) => Math.max(0, 100 - r.pct)).reverse();
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (p: any[]) =>
        `${p[0].name}<br/>Reported: ${p[0].value}%<br/>Not-Reported: ${p[1].value}%<br/><span style="color:#6B7280">click to drill down</span>`,
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

export default function AttendanceGeoSection() {
  const [audience, setAudience] = useState<'teachers' | 'students'>('teachers');

  const f = useDashboardFilters();
  const geoParams = {
    date: f.selectedDate || undefined,
    stateKey: f.stateKey || undefined,
    districtKey: f.districtKey || undefined,
    blockKey: f.blockKey || undefined,
    clusterKey: f.clusterKey || undefined,
  };
  const { data: geoEnvelope } = useQuery({
    queryKey: ['attendance', 'geo', geoParams],
    queryFn: () => attendanceApi.getGeo(geoParams),
    staleTime: 5 * 60 * 1000,
  });
  const regions: GeoRegion[] = geoEnvelope?.data?.regions ?? [];
  const childLevel = geoEnvelope?.data?.childLevel ?? 'state';

  // Drill: clicking a dot/bar sets that child level in the shared cascade.
  const drill = (region: GeoRegion) => f.drillTo(region.level, region.key);

  // Map markers: valid-coordinate regions coloured by student attendance %.
  const markers = useMemo(
    () => regions.filter((r) => inIndia(r.lat, r.lng)),
    [regions],
  );

  // Bar rows (teacher reported % or student attendance %), keyed for drill.
  const barRows = useMemo(
    () =>
      regions.map((r) => ({
        key: r.key,
        name: r.name,
        level: r.level,
        pct: audience === 'teachers' ? r.teacherReportedPct : r.studentAttendancePct,
      })),
    [regions, audience],
  );
  const barOpt = useMemo(() => barOption(barRows), [barRows]);
  const onBarClick = (p: any) => {
    // yAxis categories are reversed; find the region by name.
    const r = regions.find((x) => x.name === p.name);
    if (r) drill(r);
  };

  const levelLabel =
    childLevel === 'state' ? 'States/UTs'
    : childLevel === 'district' ? 'Districts'
    : childLevel === 'block' ? 'Blocks'
    : childLevel === 'cluster' ? 'Clusters'
    : 'Schools';

  return (
    <Grid container spacing={1.25}>
      {/* LEFT — MapLibre map + legend */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <SectionBar title={`Attendance by Geography — ${levelLabel}`} />
          <Box sx={{ p: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end', mb: 0.5, flexWrap: 'wrap' }}>
              {BANDS.map((b) => (
                <Box key={b.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: b.color }} />
                  <Typography sx={{ fontSize: '0.66rem', color: '#374151' }}>{b.label}</Typography>
                </Box>
              ))}
            </Box>

            <Box sx={{ height: 460, borderRadius: 1, overflow: 'hidden', position: 'relative' }}>
              <Map
                initialViewState={{ longitude: 82.5, latitude: 22.5, zoom: 3.4 }}
                mapStyle={OSM_STYLE}
                style={{ width: '100%', height: '100%' }}
                attributionControl={false}
              >
                <NavigationControl position="top-right" showCompass={false} />
                {markers.map((r) => (
                  <Marker
                    key={`${r.level}:${r.key}`}
                    longitude={r.lng as number}
                    latitude={r.lat as number}
                    anchor="center"
                    onClick={(e) => { e.originalEvent.stopPropagation(); drill(r); }}
                  >
                    <Box
                      title={`${r.name}: ${r.studentAttendancePct}% (click to drill)`}
                      sx={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        bgcolor: bandColor(r.studentAttendancePct),
                        border: '2px solid #fff',
                        boxShadow: '0 0 3px rgba(0,0,0,0.4)',
                        cursor: 'pointer',
                      }}
                    />
                  </Marker>
                ))}
              </Map>
              {markers.length === 0 && (
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '0.78rem', pointerEvents: 'none' }}>
                  No mappable locations for this selection.
                </Box>
              )}
            </Box>
          </Box>
        </Paper>
      </Grid>

      {/* RIGHT — State/UT wise bars + audience toggle */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <SectionBar title={`${levelLabel} wise Attendance (${audience === 'teachers' ? 'Teachers' : 'Students'})`} />
          <Box sx={{ p: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <ReactECharts
              option={barOpt}
              style={{ height: 460 }}
              notMerge
              onEvents={{ click: onBarClick }}
            />
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
