import { Box, Typography, Paper, Grid } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import ReactECharts from 'echarts-for-react';
import { useQuery } from '@tanstack/react-query';
import { ATT_COLORS, formatIndian } from './attendanceColors';
import { mockAttendancePage, AttendancePageData } from './attendanceMockData';
import { attendanceApi } from './attendanceApi';
import { useDashboardFilters } from '../../shared/DashboardFilterLayout';
import AttendanceGeoSection from './AttendanceGeoSection';

/**
 * Page 1 — Attendance (design.md §7), laid out to match the approved reference:
 *   LEFT  column: Integration Coverage (3 gauges) + Integration Status (pill grid)
 *   RIGHT column: Schools Integration (concentric rings with school icon + legend)
 * Compact, full-width, single-screen. Mock-first.
 */

// Purple gradient section header bar (matches the reference).
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

// Single semicircular gauge box (white card, big number under the arc).
function gaugeOption(reported: number, expected: number) {
  return {
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: -5,
        center: ['50%', '62%'],
        radius: '95%',
        min: 0,
        max: expected,
        progress: { show: true, width: 13, roundCap: true, itemStyle: { color: ATT_COLORS.chrome } },
        // Remaining (unfilled) track — clearly visible light blue, matches reference.
        axisLine: { lineStyle: { width: 13, color: [[1, ATT_COLORS.reference]] } },
        pointer: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: {
          valueAnimation: true,
          offsetCenter: [0, '0%'],
          fontSize: 22,
          fontWeight: 700,
          color: ATT_COLORS.chrome,
          formatter: () => formatIndian(reported),
        },
        data: [{ value: reported }],
      },
    ],
  };
}

function GaugeBox({ label, reported, expected }: { label: string; reported: number; expected: number }) {
  return (
    <Box sx={{ bgcolor: '#fff', border: '1px solid #EEF0F5', borderRadius: '8px', p: 0.5, textAlign: 'center' }}>
      <Typography sx={{ fontWeight: 800, color: '#1F2937', fontSize: '0.92rem', mt: 0.4 }}>{label}</Typography>
      <ReactECharts option={gaugeOption(reported, expected)} style={{ height: 104 }} />
    </Box>
  );
}

// Coloured pill KPI card (title on top, big value below).
function Pill({ title, value, bg }: { title: string; value: string; bg: string }) {
  return (
    <Box sx={{ bgcolor: bg, color: '#fff', borderRadius: '6px', px: 1, py: 0.8, textAlign: 'center' }}>
      <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, lineHeight: 1.25 }}>{title}</Typography>
      <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.3 }}>{value}</Typography>
    </Box>
  );
}

// Concentric partial-arc rings for Schools Integration (gauge-style; each ring
// sweeps proportional to its share of the onboarded total, matching reference).
function ringsOption(d: AttendancePageData['schoolIntegration']) {
  const base = d.onboarded || 1;
  const ring = (value: number, color: string, r0: string, r1: string) => ({
    type: 'pie',
    radius: [r0, r1],
    center: ['50%', '52%'],
    startAngle: 90, // start at top
    silent: true,
    label: { show: false },
    // full 360° track (light) + the coloured portion for `value/base`
    data: [
      { value, itemStyle: { color, borderRadius: 8 } },
      { value: Math.max(base - value, 0), itemStyle: { color: '#EEF1F6' } },
    ],
  });
  return {
    series: [
      ring(d.onboarded, ATT_COLORS.school, '82%', '96%'),
      ring(d.reportingTeacher, ATT_COLORS.teacher, '65%', '79%'),
      ring(d.reportingStudent, ATT_COLORS.student, '48%', '62%'),
    ],
  };
}

// Legend row: colour swatch + label (value shown over the rings, not here).
function LegendStat({ color, label }: { color: string; label: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
      <Box sx={{ width: 16, height: 16, borderRadius: '4px', bgcolor: color, mt: 0.2, flexShrink: 0 }} />
      <Typography sx={{ color: '#374151', fontSize: '0.82rem', fontWeight: 500, lineHeight: 1.3 }}>{label}</Typography>
    </Box>
  );
}

// Attendance donut with % callout labels + icon in center (matches reference).
function attendanceDonut(segments: { name: string; value: number; color: string }[]) {
  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    series: [
      {
        type: 'pie',
        radius: ['58%', '82%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        labelLine: { length: 8, length2: 6 },
        label: { show: true, formatter: '{d}%', fontSize: 12, fontStyle: 'italic', color: '#374151' },
        data: segments.map((s) => ({ name: s.name, value: s.value, itemStyle: { color: s.color } })),
      },
    ],
  };
}

// Labeled row: label on the left, value in a coloured pill on the right.
function InfoRow({ label, value, bg }: { label: string; value: string; bg: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
      <Typography sx={{ fontSize: '0.66rem', color: '#374151', flex: 1, lineHeight: 1.2 }}>{label}</Typography>
      <Box sx={{ bgcolor: bg, color: '#fff', px: 1, py: 0.3, borderRadius: '4px', fontWeight: 700, fontSize: '0.78rem', minWidth: 78, textAlign: 'center' }}>
        {value}
      </Box>
    </Box>
  );
}

// Small coloured value chip (Present / Absent / Outside the School).
function ValueChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
      <Typography sx={{ fontSize: '0.66rem', color: '#374151', width: 90, lineHeight: 1.2 }}>{label}</Typography>
      <Box sx={{ bgcolor: color, color: '#fff', px: 1, py: 0.3, borderRadius: '4px', fontWeight: 700, fontSize: '0.78rem', minWidth: 90, textAlign: 'center' }}>
        {value}
      </Box>
    </Box>
  );
}

// "Reported %" with a thin progress bar underneath.
function ReportedBar({ pct, color }: { pct: number; color: string }) {
  return (
    <Box sx={{ my: 0.75 }}>
      <Box sx={{ height: 6, bgcolor: '#E5E7EB', borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ width: `${pct}%`, height: '100%', bgcolor: color, borderRadius: 3 }} />
      </Box>
      <Typography sx={{ color, fontWeight: 700, fontSize: '0.8rem', mt: 0.3 }}>{pct}% Reported</Typography>
    </Box>
  );
}

export default function AttendanceSummary() {
  // Live data from the shared top-row filters (date + scope). React Query caches
  // per (date, scope) so switching filters is instant on repeat.
  const f = useDashboardFilters();
  const params = {
    date: f.selectedDate || undefined,
    stateKey: f.stateKey || undefined,
    districtKey: f.districtKey || undefined,
    blockKey: f.blockKey || undefined,
    clusterKey: f.clusterKey || undefined,
    udiseCode: f.udiseCode || undefined,
  };

  const { data: envelope } = useQuery({
    queryKey: ['attendance', 'page', params],
    queryFn: () => attendanceApi.getAttendancePage(params),
    staleTime: 5 * 60 * 1000, // align with the 5–10 min KPI TTL
  });

  // Use live data when present; fall back to the mock while loading or when the
  // API returns meta.empty (keys not yet populated by the cron).
  const d: AttendancePageData = envelope?.data ?? mockAttendancePage;
  const isMock = !envelope?.data;
  const si = d.schoolIntegration;
  const udiseRef = d.integrationStatus.udiseRef;

  const teacherDonut = attendanceDonut([
    { name: 'Present', value: d.teacher.present, color: ATT_COLORS.present },
    { name: 'Absent', value: d.teacher.absent, color: ATT_COLORS.absent },
    { name: 'On-Duty', value: d.teacher.onDuty, color: ATT_COLORS.onDuty },
  ]);
  const studentDonut = attendanceDonut([
    { name: 'Present', value: d.student.present, color: ATT_COLORS.present },
    { name: 'Absent', value: d.student.absent, color: ATT_COLORS.absent },
  ]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, height: '100%' }}>
      {/* Header: title + data date + view level */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Typography sx={{ fontWeight: 800, color: '#111827', fontSize: '1.05rem' }}>
          RVSK Attendance Dashboard
        </Typography>
        <Typography sx={{ fontWeight: 700, color: ATT_COLORS.chrome, fontSize: '0.8rem' }}>
          Data as on {d.asOfDate} (Previous Day)
        </Typography>
        <Typography sx={{ fontWeight: 700, color: '#374151', fontSize: '0.8rem' }}>
          View Level: {d.scopeLevel === 'national' ? 'National Level' : d.scopeLevel === 'state' ? 'State Level' : 'District Level'}
        </Typography>
        {isMock && (
          <Typography sx={{ color: '#9CA3AF', fontSize: '0.62rem', ml: 'auto' }}>
            Mock preview — live data loads once the ADW cache is populated.
          </Typography>
        )}
      </Box>

      <Grid container spacing={1.25}>
        {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
        <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          {/* Integration Coverage */}
          <Paper sx={{ overflow: 'hidden' }}>
            <SectionBar title="Integration Coverage" />
            <Grid container spacing={1} sx={{ p: 1 }}>
              <Grid item xs={4}><GaugeBox label="States/UTs" reported={d.integrationCoverage.states.reported} expected={d.integrationCoverage.states.expected} /></Grid>
              <Grid item xs={4}><GaugeBox label="Districts" reported={d.integrationCoverage.districts.reported} expected={d.integrationCoverage.districts.expected} /></Grid>
              <Grid item xs={4}><GaugeBox label="Blocks" reported={d.integrationCoverage.blocks.reported} expected={d.integrationCoverage.blocks.expected} /></Grid>
            </Grid>
          </Paper>

          {/* Integration Status */}
          <Paper sx={{ overflow: 'hidden', flex: 1 }}>
            <SectionBar title="Integration Status" />
            <Grid container spacing={0.75} sx={{ p: 1 }}>
              {/* Row 1 — UDISE 25-26 reference (light blue). Only at National/State
                  grain; below State the static reference is not available. */}
              <Grid item xs={4}><Pill title="Total Schools (UDISE 25-26)" value={udiseRef ? formatIndian(udiseRef.schools) : 'N/A'} bg={ATT_COLORS.reference} /></Grid>
              <Grid item xs={4}><Pill title="Total Teachers (UDISE 25-26)" value={udiseRef ? formatIndian(udiseRef.teachers) : 'N/A'} bg={ATT_COLORS.reference} /></Grid>
              <Grid item xs={4}><Pill title="Total Students (UDISE 25-26)" value={udiseRef ? formatIndian(udiseRef.students) : 'N/A'} bg={ATT_COLORS.reference} /></Grid>
              {/* Row 2 — RVSK Master (teal / blue / orange) */}
              <Grid item xs={4}><Pill title="Total Schools (RVSK MASTER)" value={formatIndian(d.integrationStatus.rvskMaster.schools)} bg={ATT_COLORS.school} /></Grid>
              <Grid item xs={4}><Pill title="Total Teachers (RVSK MASTER)" value={formatIndian(d.integrationStatus.rvskMaster.teachers)} bg={ATT_COLORS.teacher} /></Grid>
              <Grid item xs={4}><Pill title="Total Students (RVSK MASTER)" value={formatIndian(d.integrationStatus.rvskMaster.students)} bg={ATT_COLORS.student} /></Grid>
              {/* Row 3 — Onboarded (teal / blue / orange) */}
              <Grid item xs={4}><Pill title="Schools Onboarded" value={formatIndian(d.integrationStatus.onboarded.schools)} bg={ATT_COLORS.school} /></Grid>
              <Grid item xs={4}><Pill title="Teachers Onboarded" value={formatIndian(d.integrationStatus.onboarded.teachers)} bg={ATT_COLORS.teacher} /></Grid>
              <Grid item xs={4}><Pill title="Students Onboarded" value={formatIndian(d.integrationStatus.onboarded.students)} bg={ATT_COLORS.student} /></Grid>
              {/* Row 3 — Yet to onboard (light blue) */}
              <Grid item xs={4}><Pill title="Schools Yet to be Onboarded" value={formatIndian(d.integrationStatus.yetToOnboard.schools)} bg={ATT_COLORS.reference} /></Grid>
              <Grid item xs={4}><Pill title="Teachers Yet to be Onboarded" value={formatIndian(d.integrationStatus.yetToOnboard.teachers)} bg={ATT_COLORS.reference} /></Grid>
              <Grid item xs={4}><Pill title="Students Yet to be Onboarded" value={formatIndian(d.integrationStatus.yetToOnboard.students)} bg={ATT_COLORS.reference} /></Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* ── RIGHT COLUMN: Schools Integration ───────────────────── */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <SectionBar title="Schools Integration" />
            <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
              {/* Rings — school icon centered; values placed in the empty
                  top-left gap of the arcs (arcs start at top & sweep clockwise,
                  so the upper-left is the light/empty zone — no colour overlap). */}
              <Box sx={{ position: 'relative', flex: '0 0 55%', minWidth: 0, alignSelf: 'stretch', display: 'flex', alignItems: 'center' }}>
                <ReactECharts option={ringsOption(si)} style={{ height: '100%', width: '100%', minHeight: 300 }} />
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SchoolIcon sx={{ fontSize: 52, color: ATT_COLORS.chrome }} />
                </Box>
                {/* Stacked values in the top-left empty gap, right-aligned so
                    they nest just inside the arc openings. */}
                <Box sx={{ position: 'absolute', top: '16%', left: 0, width: '46%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.1, pr: 0.5 }}>
                  <Typography sx={{ color: ATT_COLORS.school, fontWeight: 800, fontSize: '1rem', lineHeight: 1.25 }}>{formatIndian(si.onboarded)}</Typography>
                  <Typography sx={{ color: ATT_COLORS.teacher, fontWeight: 800, fontSize: '1rem', lineHeight: 1.25 }}>{formatIndian(si.reportingTeacher)}</Typography>
                  <Typography sx={{ color: ATT_COLORS.student, fontWeight: 800, fontSize: '1rem', lineHeight: 1.25 }}>{formatIndian(si.reportingStudent)}</Typography>
                </Box>
              </Box>
              {/* Plain legend on the right, vertically centered */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1.5 }}>
                <LegendStat color={ATT_COLORS.school} label="Total Schools Onboarded" />
                <LegendStat color={ATT_COLORS.teacher} label="Total Schools Reporting Teachers Attendance" />
                <LegendStat color={ATT_COLORS.student} label="Total Schools Reporting Students Attendance" />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ── Row 2: Teacher | Student Attendance (info column + donut) ── */}
      <Grid container spacing={1.25}>
        {/* Teachers Attendance */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ overflow: 'hidden' }}>
            <SectionBar title="Teachers Attendance" />
            <Box sx={{ p: 1, display: 'flex', gap: 1 }}>
              {/* left info column */}
              <Box sx={{ flex: '0 0 52%', minWidth: 0 }}>
                <InfoRow label="Total Teachers in Schools" value={formatIndian(d.teacher.totalInSchools)} bg={ATT_COLORS.teacher} />
                <InfoRow label="Total Teachers attendance reported" value={formatIndian(d.teacher.totalReported)} bg={ATT_COLORS.teacher} />
                <ReportedBar pct={d.teacher.reportedPct} color={ATT_COLORS.teacher} />
                <ValueChip label="Present" value={formatIndian(d.teacher.present)} color={ATT_COLORS.present} />
                <ValueChip label="Outside the School" value={formatIndian(d.teacher.onDuty)} color={ATT_COLORS.onDuty} />
                <ValueChip label="Absent" value={formatIndian(d.teacher.absent)} color={ATT_COLORS.absent} />
              </Box>
              {/* right donut */}
              <Box sx={{ position: 'relative', flex: 1 }}>
                <ReactECharts option={teacherDonut} style={{ height: 200 }} />
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <SchoolIcon sx={{ fontSize: 34, color: ATT_COLORS.teacher }} />
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Students Attendance */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ overflow: 'hidden' }}>
            <SectionBar title="Students Attendance" />
            <Box sx={{ p: 1, display: 'flex', gap: 1 }}>
              <Box sx={{ flex: '0 0 52%', minWidth: 0 }}>
                <InfoRow label="Total Students in Schools" value={formatIndian(d.student.totalInSchools)} bg={ATT_COLORS.student} />
                <InfoRow label="Total Students attendance reported" value={formatIndian(d.student.totalReported)} bg={ATT_COLORS.student} />
                <ReportedBar pct={d.student.reportedPct} color={ATT_COLORS.student} />
                <ValueChip label="Present" value={formatIndian(d.student.present)} color={ATT_COLORS.present} />
                <ValueChip label="Absent" value={formatIndian(d.student.absent)} color={ATT_COLORS.absent} />
              </Box>
              <Box sx={{ position: 'relative', flex: 1 }}>
                <ReactECharts option={studentDonut} style={{ height: 200 }} />
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <SchoolIcon sx={{ fontSize: 34, color: ATT_COLORS.student }} />
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ── Row 3: Attendance by Geography | State/UT-wise bars ──────── */}
      <AttendanceGeoSection />
    </Box>
  );
}
