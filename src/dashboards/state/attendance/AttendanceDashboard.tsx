import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Select,
  MenuItem,
  Button,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Chip,
  Pagination,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material';
import ReactECharts from 'echarts-for-react';
import SearchIcon from '@mui/icons-material/Search';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import apiClient from '../../../services/apiClient';

// ─── TYPES ───────────────────────────────────────────────────────────────────
type TabId =
  | 'summary'
  | 'detailed'
  | 'trends'
  | 'report'
  | 'table'
  | 'school'
  | 'teacher'
  | 'student'
  | 'monthly'
  | 'analysis';

interface SidebarItem {
  id: TabId;
  label: string;
  icon: string;
}

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const SIDEBAR_WIDTH = 220;
const HEADER_HEIGHT = 56;
const FILTER_HEIGHT = 52;

const PURPLE_PRIMARY = '#5B21B6';
const PURPLE_DARK = '#3B0764';
const PURPLE_LIGHT = '#7C3AED';
const PURPLE_BG = '#F5F3FF';

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: 'summary', label: 'Summary', icon: '📊' },
  { id: 'detailed', label: 'Detailed Data', icon: '📋' },
  { id: 'trends', label: 'Trends', icon: '📈' },
  { id: 'report', label: 'Report View', icon: '📄' },
  { id: 'table', label: 'Table View', icon: '📊' },
  { id: 'school', label: 'School Directory', icon: '🏫' },
  { id: 'teacher', label: 'Teacher Registry', icon: '👨‍🏫' },
  { id: 'student', label: 'Student Registry', icon: '👩‍🎓' },
  { id: 'monthly', label: 'Monthly Details', icon: '📅' },
  { id: 'analysis', label: 'Attendance Analysis', icon: '🔍' },
];


// ─── REUSABLE COMPONENTS ─────────────────────────────────────────────────────

function LoadingOverlay() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
      <CircularProgress sx={{ color: PURPLE_PRIMARY }} />
    </Box>
  );
}

function NoData({ message = 'No data available' }: { message?: string }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
      <Typography color="text.secondary">{message}</Typography>
    </Box>
  );
}

function KpiCard({ title, value, subtitle, color = PURPLE_PRIMARY }: { title: string; value: string; subtitle?: string; color?: string }) {
  return (
    <Paper sx={{ p: 2.5, textAlign: 'center', height: '100%', borderTop: `3px solid ${color}` }}>
      <Typography variant="body2" color="text.secondary" gutterBottom>{title}</Typography>
      <Typography variant="h5" fontWeight={700} color={color}>{value}</Typography>
      {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
    </Paper>
  );
}

function DonutChart({ percent, title, centerLabel, colors }: { percent: number; title: string; centerLabel?: string; colors?: string[] }) {
  const option = {
    tooltip: { trigger: 'item' },
    title: { text: title, left: 'center', top: 0, textStyle: { fontSize: 13, fontWeight: 600 } },
    series: [{
      type: 'pie',
      radius: ['55%', '75%'],
      center: ['50%', '58%'],
      avoidLabelOverlap: false,
      label: {
        show: true,
        position: 'center',
        formatter: centerLabel || `${percent.toFixed(1)}%`,
        fontSize: 18,
        fontWeight: 'bold',
        color: PURPLE_PRIMARY,
      },
      data: [
        { value: percent, name: 'Active', itemStyle: { color: colors?.[0] || PURPLE_PRIMARY } },
        { value: 100 - percent, name: 'Remaining', itemStyle: { color: colors?.[1] || '#E5E7EB' } },
      ],
    }],
  };
  return <ReactECharts option={option} style={{ height: 200 }} />;
}


// ─── HEADER COMPONENT ────────────────────────────────────────────────────────
function AttendanceHeader() {
  return (
    <Box sx={{
      height: HEADER_HEIGHT,
      background: `linear-gradient(135deg, ${PURPLE_DARK} 0%, ${PURPLE_PRIMARY} 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      px: 3,
      color: '#fff',
    }}>
      <Typography variant="subtitle2" fontWeight={700} sx={{ letterSpacing: 0.5 }}>
        Rashtriya Vidya Samiksha Kendra — Attendance Dashboard
      </Typography>
      <Chip
        label="NATIONAL LEVEL"
        size="small"
        sx={{ bgcolor: '#F59E0B', color: '#fff', fontWeight: 700, fontSize: 11, height: 24 }}
      />
    </Box>
  );
}

// ─── FILTER BAR COMPONENT ────────────────────────────────────────────────────
interface FilterBarProps {
  selectedDate: string;
  setSelectedDate: (v: string) => void;
  selectedStateId: number | '';
  setSelectedStateId: (v: number | '') => void;
  selectedDistrictId: string;
  setSelectedDistrictId: (v: string) => void;
  selectedBlockId: string;
  setSelectedBlockId: (v: string) => void;
  selectedClusterId: string;
  setSelectedClusterId: (v: string) => void;
  states: any[];
  districts: any[];
  blocks: any[];
  clusters: any[];
  schools: any[];
  onReset: () => void;
}

function AttendanceFilters({
  selectedDate, setSelectedDate,
  selectedStateId, setSelectedStateId,
  selectedDistrictId, setSelectedDistrictId,
  selectedBlockId, setSelectedBlockId,
  selectedClusterId, setSelectedClusterId,
  states, districts, blocks, clusters, schools,
  onReset,
}: FilterBarProps) {
  return (
    <Box sx={{
      height: FILTER_HEIGHT,
      bgcolor: '#fff',
      borderBottom: '1px solid #E5E7EB',
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      px: 2,
      overflowX: 'auto',
    }}>
      <TextField
        type="date"
        size="small"
        label="Date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        InputLabelProps={{ shrink: true }}
        sx={{ minWidth: 140 }}
      />
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>State/UT</InputLabel>
        <Select
          value={selectedStateId}
          label="State/UT"
          onChange={(e) => setSelectedStateId(e.target.value as number | '')}
        >
          <MenuItem value="">All States</MenuItem>
          {states.map((s: any) => (
            <MenuItem key={s.STATE_ID} value={s.STATE_ID}>{s.STATE_NAME}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 110 }}>
        <InputLabel>District</InputLabel>
        <Select
          value={selectedDistrictId}
          label="District"
          onChange={(e) => setSelectedDistrictId(e.target.value as string)}
        >
          <MenuItem value="">All Districts</MenuItem>
          {districts.map((d: any) => (
            <MenuItem key={d.DISTRICT_ID} value={d.DISTRICT_ID}>{d.DISTRICT_NAME}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 100 }}>
        <InputLabel>Block</InputLabel>
        <Select
          value={selectedBlockId}
          label="Block"
          onChange={(e) => setSelectedBlockId(e.target.value as string)}
        >
          <MenuItem value="">All Blocks</MenuItem>
          {blocks.map((b: any) => (
            <MenuItem key={b.BLOCK_ID} value={b.BLOCK_ID}>{b.BLOCK_NAME}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 100 }}>
        <InputLabel>Cluster</InputLabel>
        <Select
          value={selectedClusterId}
          label="Cluster"
          onChange={(e) => setSelectedClusterId(e.target.value as string)}
        >
          <MenuItem value="">All Clusters</MenuItem>
          {clusters.map((c: any) => (
            <MenuItem key={c.CLUSTER_ID} value={c.CLUSTER_ID}>{c.CLUSTER_NAME}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 110 }}>
        <InputLabel>School</InputLabel>
        <Select defaultValue="" label="School">
          <MenuItem value="">All Schools</MenuItem>
          {schools.map((s: any) => (
            <MenuItem key={s.SCHOOL_ID} value={s.SCHOOL_ID}>{s.SCHOOL_NAME}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button
        variant="contained"
        size="small"
        startIcon={<RestartAltIcon />}
        onClick={onReset}
        sx={{ bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' }, textTransform: 'none', fontWeight: 600, ml: 'auto' }}
      >
        RESET
      </Button>
    </Box>
  );
}

// ─── SIDEBAR COMPONENT ───────────────────────────────────────────────────────
function AttendanceSidebar({ activeTab, onTabChange }: { activeTab: TabId; onTabChange: (id: TabId) => void }) {
  return (
    <Box sx={{
      width: SIDEBAR_WIDTH,
      minHeight: '100%',
      bgcolor: '#FAFAFA',
      borderRight: '1px solid #E5E7EB',
      py: 1,
    }}>
      <List disablePadding>
        {SIDEBAR_ITEMS.map((item) => (
          <ListItemButton
            key={item.id}
            selected={activeTab === item.id}
            onClick={() => onTabChange(item.id)}
            sx={{
              mx: 1,
              mb: 0.5,
              borderRadius: 2,
              '&.Mui-selected': {
                bgcolor: PURPLE_PRIMARY,
                color: '#fff',
                '&:hover': { bgcolor: PURPLE_LIGHT },
                '& .MuiListItemText-primary': { color: '#fff', fontWeight: 600 },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 32, fontSize: 18 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ variant: 'body2', fontWeight: activeTab === item.id ? 600 : 400 }} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}


// ─── SUMMARY PAGE ────────────────────────────────────────────────────────────
function formatIndian(num: number): string {
  return num.toLocaleString('en-IN');
}

function SummaryPage({ summaryData, regionalLeaders, stateTableData, integrationCoverage, loading }: {
  summaryData: any;
  regionalLeaders: any;
  stateTableData: any[];
  integrationCoverage: any;
  loading: boolean;
}) {
  if (loading) return <LoadingOverlay />;

  const teachers = summaryData?.teachers || {};
  const students = summaryData?.students || {};
  const coverage = integrationCoverage || {};

  const totalSchools = coverage.TOTAL_SCHOOLS || 0;
  const totalTeachersUDISE = coverage.TOTAL_TEACHERS || 0;
  const totalStudentsUDISE = coverage.TOTAL_STUDENTS || 0;
  const totalStates = coverage.TOTAL_STATES || 0;
  const totalDistricts = coverage.TOTAL_DISTRICTS || 0;
  const totalBlocks = coverage.TOTAL_BLOCKS || 0;

  const schoolsOnboarded = (teachers.schoolsReporting || 0) + (students.schoolsReporting || 0);
  const schoolsReportingTeachers = teachers.schoolsReporting || 0;
  const schoolsReportingStudents = students.schoolsReporting || 0;

  const teachersTotalInSchools = teachers.totalMarked || 0;
  const teachersPresent = teachers.totalPresent || 0;
  const teachersAbsent = teachers.totalAbsent || 0;
  const teachersOutside = teachersTotalInSchools - teachersPresent - teachersAbsent;
  const teacherReportedPct = teachers.attendancePercentage || 0;

  const studentsTotalInSchools = students.totalEnrolled || 0;
  const studentsPresent = students.totalPresent || 0;
  const studentsAbsent = students.totalAbsent || 0;
  const studentReportedPct = students.attendancePercentage || 0;

  // Sort state data by student attendance %
  const sortedStates = [...(stateTableData || [])].sort((a, b) => (b.studentAttendancePct || 0) - (a.studentAttendancePct || 0));

  // --- Section 1: Integration Coverage Gauge Chart ---
  const gaugeOption = (value: number, max: number, title: string) => ({
    tooltip: { formatter: `${title}: ${value}` },
    series: [{
      type: 'gauge',
      startAngle: 180,
      endAngle: 0,
      min: 0,
      max,
      pointer: { show: false },
      progress: { show: true, overlap: false, roundCap: true, width: 14, itemStyle: { color: '#7C3AED' } },
      axisLine: { lineStyle: { width: 14, color: [[1, '#E5E7EB']] } },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      title: { offsetCenter: [0, '20%'], fontSize: 12, color: '#6B7280' },
      detail: { offsetCenter: [0, '-10%'], fontSize: 22, fontWeight: 700, color: '#1F2937', formatter: `{value}` },
      data: [{ value, name: title }],
    }],
  });

  // --- Section 2: Schools Integration Donut ---
  const schoolsDonutOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, textStyle: { fontSize: 11 } },
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: false,
      label: { show: true, position: 'center', formatter: `Total\n${formatIndian(totalSchools)}`, fontSize: 13, fontWeight: 'bold', color: '#374151' },
      data: [
        { value: schoolsOnboarded, name: 'Schools Onboarded', itemStyle: { color: '#4CAF50' } },
        { value: schoolsReportingTeachers, name: 'Reporting Teachers', itemStyle: { color: '#2196F3' } },
        { value: schoolsReportingStudents, name: 'Reporting Students', itemStyle: { color: '#FF9800' } },
      ],
    }],
  };

  // --- Section 4: Teachers Attendance Donut ---
  const teachersDonutOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, textStyle: { fontSize: 11 } },
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: false,
      label: { show: false },
      data: [
        { value: teachersPresent, name: 'Present', itemStyle: { color: '#4CAF50' } },
        { value: teachersOutside > 0 ? teachersOutside : 0, name: 'Outside', itemStyle: { color: '#FF9800' } },
        { value: teachersAbsent, name: 'Absent', itemStyle: { color: '#F44336' } },
      ],
    }],
  };

  // --- Section 5: Students Attendance Donut ---
  const studentsDonutOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, textStyle: { fontSize: 11 } },
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: false,
      label: { show: false },
      data: [
        { value: studentsPresent, name: 'Present', itemStyle: { color: '#4CAF50' } },
        { value: studentsAbsent, name: 'Absent', itemStyle: { color: '#F44336' } },
      ],
    }],
  };

  // --- Section 6: State-wise bar chart ---
  const stateBarOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 140, right: 40, top: 20, bottom: 30 },
    xAxis: { type: 'value' as const, max: 100, axisLabel: { formatter: '{value}%' } },
    yAxis: {
      type: 'category' as const,
      data: sortedStates.slice(0, 15).reverse().map((s: any) => s.stateName || ''),
      axisLabel: { fontSize: 11 },
    },
    series: [
      {
        name: 'Reported',
        type: 'bar',
        stack: 'total',
        data: sortedStates.slice(0, 15).reverse().map((s: any) => Number((s.studentAttendancePct || 0).toFixed(1))),
        itemStyle: { color: '#4CAF50' },
        barWidth: 16,
      },
      {
        name: 'Not Reported',
        type: 'bar',
        stack: 'total',
        data: sortedStates.slice(0, 15).reverse().map((s: any) => Number((100 - (s.studentAttendancePct || 0)).toFixed(1))),
        itemStyle: { color: '#E0E0E0' },
        barWidth: 16,
      },
    ],
  };

  return (
    <Box>
      {/* Row 1: Integration Coverage + Schools Integration */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* Section 1: Integration Coverage */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ background: 'linear-gradient(135deg, #6B21A8, #7C3AED)', borderRadius: 1, px: 2, py: 1, mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={700} color="#fff">Integration Coverage</Typography>
            </Box>
            <Grid container spacing={1}>
              <Grid item xs={4}>
                <ReactECharts option={gaugeOption(totalStates, 36, 'States/UTs')} style={{ height: 150 }} />
              </Grid>
              <Grid item xs={4}>
                <ReactECharts option={gaugeOption(totalDistricts, 800, 'Districts')} style={{ height: 150 }} />
              </Grid>
              <Grid item xs={4}>
                <ReactECharts option={gaugeOption(totalBlocks, 7000, 'Blocks')} style={{ height: 150 }} />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        {/* Section 2: Schools Integration */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ background: 'linear-gradient(135deg, #6B21A8, #7C3AED)', borderRadius: 1, px: 2, py: 1, mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={700} color="#fff">Schools Integration</Typography>
            </Box>
            <ReactECharts option={schoolsDonutOption} style={{ height: 220 }} />
          </Paper>
        </Grid>
      </Grid>

      {/* Section 3: Integration Status (Full Width) */}
      <Paper sx={{ mb: 2, overflow: 'hidden' }}>
        <Box sx={{ background: 'linear-gradient(135deg, #6B21A8, #7C3AED)', px: 2, py: 1 }}>
          <Typography variant="subtitle2" fontWeight={700} color="#fff">Integration Status</Typography>
        </Box>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Typography variant="caption" color="text.secondary">Total Schools (UDISE)</Typography>
              <Typography variant="h6" fontWeight={700}>{formatIndian(totalSchools)}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="caption" color="text.secondary">Total Teachers (UDISE)</Typography>
              <Typography variant="h6" fontWeight={700}>{formatIndian(totalTeachersUDISE)}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="caption" color="text.secondary">Total Students (UDISE)</Typography>
              <Typography variant="h6" fontWeight={700}>{formatIndian(totalStudentsUDISE)}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="caption" color="text.secondary">Schools Onboarded</Typography>
              <Typography variant="h6" fontWeight={700} color="#4CAF50">{formatIndian(schoolsOnboarded)}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="caption" color="text.secondary">Teachers Onboarded</Typography>
              <Typography variant="h6" fontWeight={700} color="#4CAF50">{formatIndian(teachersTotalInSchools)}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="caption" color="text.secondary">Students Onboarded</Typography>
              <Typography variant="h6" fontWeight={700} color="#4CAF50">{formatIndian(studentsTotalInSchools)}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="caption" color="text.secondary">Schools Yet to Onboard</Typography>
              <Typography variant="h6" fontWeight={700} color="#F44336">{formatIndian(totalSchools - schoolsOnboarded)}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="caption" color="text.secondary">Teachers Yet to Onboard</Typography>
              <Typography variant="h6" fontWeight={700} color="#F44336">{formatIndian(totalTeachersUDISE - teachersTotalInSchools)}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="caption" color="text.secondary">Students Yet to Onboard</Typography>
              <Typography variant="h6" fontWeight={700} color="#F44336">{formatIndian(totalStudentsUDISE - studentsTotalInSchools)}</Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Row 3: Teachers Attendance + Students Attendance */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* Section 4: Teachers Attendance */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ background: 'linear-gradient(135deg, #6B21A8, #7C3AED)', borderRadius: 1, px: 2, py: 1, mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={700} color="#fff">Teachers Attendance</Typography>
            </Box>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Total Teachers in Schools</Typography>
              <Typography variant="h6" fontWeight={700}>{formatIndian(teachersTotalInSchools)}</Typography>
            </Box>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Attendance Reported</Typography>
              <Typography variant="h6" fontWeight={700}>{formatIndian(teachersTotalInSchools)}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>% Reported</Typography>
              <Box sx={{ width: '100%', bgcolor: '#E5E7EB', borderRadius: 1, height: 10 }}>
                <Box sx={{ width: `${teacherReportedPct}%`, bgcolor: '#4CAF50', borderRadius: 1, height: 10 }} />
              </Box>
              <Typography variant="caption" fontWeight={600}>{teacherReportedPct.toFixed(1)}%</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
              <Chip label={`Present: ${formatIndian(teachersPresent)}`} size="small" sx={{ bgcolor: '#E8F5E9', color: '#4CAF50', fontWeight: 600 }} />
              <Chip label={`Outside: ${formatIndian(teachersOutside > 0 ? teachersOutside : 0)}`} size="small" sx={{ bgcolor: '#FFF3E0', color: '#FF9800', fontWeight: 600 }} />
              <Chip label={`Absent: ${formatIndian(teachersAbsent)}`} size="small" sx={{ bgcolor: '#FFEBEE', color: '#F44336', fontWeight: 600 }} />
            </Box>
            <ReactECharts option={teachersDonutOption} style={{ height: 200 }} />
          </Paper>
        </Grid>
        {/* Section 5: Students Attendance */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ background: 'linear-gradient(135deg, #6B21A8, #7C3AED)', borderRadius: 1, px: 2, py: 1, mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={700} color="#fff">Students Attendance</Typography>
            </Box>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Total Students in Schools</Typography>
              <Typography variant="h6" fontWeight={700}>{formatIndian(studentsTotalInSchools)}</Typography>
            </Box>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Attendance Reported</Typography>
              <Typography variant="h6" fontWeight={700}>{formatIndian(studentsPresent + studentsAbsent)}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>% Reported</Typography>
              <Box sx={{ width: '100%', bgcolor: '#E5E7EB', borderRadius: 1, height: 10 }}>
                <Box sx={{ width: `${studentReportedPct}%`, bgcolor: '#4CAF50', borderRadius: 1, height: 10 }} />
              </Box>
              <Typography variant="caption" fontWeight={600}>{studentReportedPct.toFixed(1)}%</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
              <Chip label={`Present: ${formatIndian(studentsPresent)}`} size="small" sx={{ bgcolor: '#E8F5E9', color: '#4CAF50', fontWeight: 600 }} />
              <Chip label={`Absent: ${formatIndian(studentsAbsent)}`} size="small" sx={{ bgcolor: '#FFEBEE', color: '#F44336', fontWeight: 600 }} />
            </Box>
            <ReactECharts option={studentsDonutOption} style={{ height: 200 }} />
          </Paper>
        </Grid>
      </Grid>

      {/* Section 6: State wise Attendance (Students) */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ background: 'linear-gradient(135deg, #6B21A8, #7C3AED)', borderRadius: 1, px: 2, py: 1, mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={700} color="#fff">State wise Attendance (Students)</Typography>
        </Box>
        {sortedStates.length > 0 ? (
          <ReactECharts option={stateBarOption} style={{ height: Math.max(300, sortedStates.slice(0, 15).length * 30) }} />
        ) : (
          <NoData message="No state-wise data available" />
        )}
      </Paper>
    </Box>
  );
}


// ─── TABLE VIEW PAGE ─────────────────────────────────────────────────────────
function TableViewPage({ data, loading }: { data: any[]; loading: boolean }) {
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  if (loading) return <LoadingOverlay />;
  if (!data || data.length === 0) return <NoData message="No state-wise data available" />;

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const pagedData = data.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        State-wise Attendance Data
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: PURPLE_PRIMARY }}>
              {['S.No', 'State/UT', 'Total Schools', 'Schools Reporting', 'Total Teachers', 'Teachers Present %', 'Total Students', 'Students Present %'].map((h) => (
                <TableCell key={h} sx={{ color: '#fff', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {pagedData.map((row: any, idx: number) => (
              <TableRow key={row.stateId || idx} hover>
                <TableCell>{(page - 1) * rowsPerPage + idx + 1}</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{row.stateName}</TableCell>
                <TableCell>{(row.totalSchools || 0).toLocaleString()}</TableCell>
                <TableCell>{(row.schoolsReporting || 0).toLocaleString()}</TableCell>
                <TableCell>{(row.totalTeachers || 0).toLocaleString()}</TableCell>
                <TableCell sx={{ color: (row.teacherAttendancePct || 0) >= 75 ? '#10B981' : '#F59E0B', fontWeight: 600 }}>
                  {(row.teacherAttendancePct || 0).toFixed(1)}%
                </TableCell>
                <TableCell>{(row.totalStudents || 0).toLocaleString()}</TableCell>
                <TableCell sx={{ color: (row.studentAttendancePct || 0) >= 70 ? '#10B981' : '#F59E0B', fontWeight: 600 }}>
                  {(row.studentAttendancePct || 0).toFixed(1)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Showing {(page - 1) * rowsPerPage + 1}-{Math.min(page * rowsPerPage, data.length)} of {data.length} States/UTs
        </Typography>
        <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} size="small" color="primary" />
      </Box>
    </Box>
  );
}

// ─── SCHOOL DIRECTORY PAGE ───────────────────────────────────────────────────
interface SchoolPageProps {
  selectedStateId: number | '';
  selectedDistrictId: string;
  selectedBlockId: string;
  selectedDate: string;
}

function SchoolDirectoryPage({ selectedStateId, selectedDistrictId, selectedBlockId, selectedDate }: SchoolPageProps) {
  const [schoolData, setSchoolData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  const fetchSchools = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStateId) params.append('stateId', String(selectedStateId));
      if (selectedDistrictId) params.append('districtId', selectedDistrictId);
      if (selectedBlockId) params.append('blockId', selectedBlockId);
      if (search) params.append('search', search);
      if (selectedDate) params.append('date', selectedDate);
      params.append('page', String(page));
      params.append('size', String(pageSize));
      const res = await apiClient.get(`/attendance/schools?${params}`);
      setSchoolData(res.data.data || []);
      if (res.data.meta) {
        setTotalPages(res.data.meta.totalPages || 1);
        setTotalElements(res.data.meta.totalElements || 0);
      }
    } catch (err) {
      console.error('Failed to fetch schools:', err);
      setSchoolData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedStateId, selectedDistrictId, selectedBlockId, search, selectedDate, page]);

  useEffect(() => { fetchSchools(); }, [fetchSchools]);

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Total Schools" value={totalElements.toLocaleString()} color="#1E3A8A" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Current Page" value={`${page} / ${totalPages}`} color={PURPLE_PRIMARY} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Page Size" value={String(pageSize)} color="#10B981" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Results Found" value={totalElements.toLocaleString()} color="#F59E0B" />
        </Grid>
      </Grid>

      {/* Search */}
      <TextField
        fullWidth
        size="small"
        placeholder="Search by School Name, UDISE Code, or Location..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        sx={{ mb: 2 }}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
      />

      {loading ? <LoadingOverlay /> : schoolData.length === 0 ? <NoData message="No schools found" /> : (
        <>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: PURPLE_PRIMARY }}>
                  {['S.No', 'School Name', 'UDISE Code', 'State/UT', 'District', 'Block', 'Category', 'Management', 'Teachers', 'Students', 'Status'].map((h) => (
                    <TableCell key={h} sx={{ color: '#fff', fontWeight: 600, fontSize: 11, whiteSpace: 'nowrap' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {schoolData.map((row: any, idx: number) => (
                  <TableRow key={row.udiseCode || idx} hover>
                    <TableCell>{(page - 1) * pageSize + idx + 1}</TableCell>
                    <TableCell sx={{ fontWeight: 500, maxWidth: 180 }}>{row.schoolName || row.name || '-'}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: 11 }}>{row.udiseCode || row.udise || '-'}</TableCell>
                    <TableCell>{row.stateName || row.state || '-'}</TableCell>
                    <TableCell>{row.districtName || row.district || '-'}</TableCell>
                    <TableCell>{row.blockName || row.block || '-'}</TableCell>
                    <TableCell>{row.category || '-'}</TableCell>
                    <TableCell>{row.management || '-'}</TableCell>
                    <TableCell>{row.totalTeachers || row.teachers || 0}</TableCell>
                    <TableCell>{row.totalStudents || row.students || 0}</TableCell>
                    <TableCell>
                      <Chip label={row.status || 'Active'} size="small" color={row.status === 'Inactive' ? 'default' : 'success'} sx={{ fontSize: 10 }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalElements)} of {totalElements}
            </Typography>
            <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} size="small" color="primary" />
          </Box>
        </>
      )}
    </Box>
  );
}


// ─── TEACHER REGISTRY PAGE ───────────────────────────────────────────────────
function TeacherRegistryPage({ data, loading }: { data: any; loading: boolean }) {
  if (loading) return <LoadingOverlay />;
  if (!data) return <NoData message="No teacher data available" />;

  const kpis = data.kpis || {};
  const distribution = data.distribution || {};
  const topStates = data.topStates || [];

  const donutOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {d}%' },
    title: { text: 'Teacher Attendance Distribution', left: 'center', top: 0, textStyle: { fontSize: 14, fontWeight: 600 } },
    legend: { bottom: 0, data: ['Present Today', 'Absent Today', 'Not Reported'] },
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '50%'],
      label: {
        show: true, position: 'center',
        formatter: `ACTIVE BASE\n${((kpis.totalMapped || 0) / 1000000).toFixed(2)}M`,
        fontSize: 12, fontWeight: 'bold', color: '#374151',
      },
      data: [
        { value: distribution.presentPct || 44, name: 'Present Today', itemStyle: { color: '#10B981' } },
        { value: distribution.absentPct || 36, name: 'Absent Today', itemStyle: { color: '#EF4444' } },
        { value: distribution.notReportedPct || 21, name: 'Not Reported', itemStyle: { color: '#D1D5DB' } },
      ],
    }],
  };

  const barOption = {
    tooltip: { trigger: 'axis' },
    title: { text: 'Top 10 States by Teacher Attendance', left: 'center', top: 0, textStyle: { fontSize: 14, fontWeight: 600 } },
    grid: { left: 140, right: 40, top: 40, bottom: 20 },
    xAxis: { type: 'value' as const, max: 100, axisLabel: { formatter: '{value}%' } },
    yAxis: {
      type: 'category' as const,
      data: topStates.map((s: any) => s.stateName || s.state || '').slice(0, 10).reverse(),
      axisLabel: { fontSize: 11 },
    },
    series: [{
      type: 'bar',
      data: topStates.map((s: any) => Number((s.attendancePct || s.teacherAttendancePct || 0).toFixed(1))).slice(0, 10).reverse(),
      itemStyle: { color: PURPLE_PRIMARY, borderRadius: [0, 4, 4, 0] },
      barWidth: 14,
      label: { show: true, position: 'right', formatter: '{c}%', fontSize: 10 },
    }],
  };

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <KpiCard title="Total Teachers" value={(kpis.totalTeachers || 0).toLocaleString()} color="#1E3A8A" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <KpiCard title="Mapped to RVSK" value={(kpis.totalMapped || 0).toLocaleString()} subtitle={`${(kpis.mappedPct || 0).toFixed(2)}%`} color={PURPLE_PRIMARY} />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <KpiCard title="Present Today" value={(kpis.totalPresent || 0).toLocaleString()} subtitle={`${(kpis.presentPct || 0).toFixed(2)}%`} color="#10B981" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <KpiCard title="Absent Today" value={(kpis.totalAbsent || 0).toLocaleString()} color="#EF4444" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <KpiCard title="Avg Attendance Rate" value={`${(kpis.avgAttendanceRate || 0).toFixed(1)}%`} subtitle="Last 30 Days Mean" color="#F59E0B" />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2 }}>
            <ReactECharts option={donutOption} style={{ height: 300 }} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2 }}>
            <ReactECharts option={barOption} style={{ height: 300 }} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

// ─── STUDENT REGISTRY PAGE ───────────────────────────────────────────────────
function StudentRegistryPage({ data, loading }: { data: any; loading: boolean }) {
  if (loading) return <LoadingOverlay />;
  if (!data) return <NoData message="No student data available" />;

  const kpis = data.kpis || {};

  const classBarOption = {
    tooltip: { trigger: 'axis' },
    title: { text: 'Student Attendance by Class', left: 'center', top: 0, textStyle: { fontSize: 14, fontWeight: 600 } },
    legend: { bottom: 0, data: ['Present', 'Absent'] },
    grid: { left: 50, right: 20, top: 40, bottom: 40 },
    xAxis: { type: 'category' as const, data: (data.classwiseData || []).map((c: any) => c.className || c.class || '') },
    yAxis: { type: 'value' as const, axisLabel: { formatter: '{value}%' } },
    series: [
      { name: 'Present', type: 'bar', data: (data.classwiseData || []).map((c: any) => c.presentPct || 0), itemStyle: { color: '#10B981' }, barWidth: 12 },
      { name: 'Absent', type: 'bar', data: (data.classwiseData || []).map((c: any) => c.absentPct || 0), itemStyle: { color: '#EF4444' }, barWidth: 12 },
    ],
  };

  const genderDonutOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {d}%' },
    title: { text: 'Gender Distribution & Attendance', left: 'center', top: 0, textStyle: { fontSize: 13, fontWeight: 600 } },
    legend: { bottom: 0, data: ['Boys', 'Girls'] },
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '50%'],
      label: { show: true, position: 'center', formatter: 'Total\n100%', fontSize: 12, fontWeight: 'bold', color: '#374151' },
      data: [
        { value: data.genderDistribution?.boysPct || 52, name: 'Boys', itemStyle: { color: '#3B82F6' } },
        { value: data.genderDistribution?.girlsPct || 48, name: 'Girls', itemStyle: { color: '#EC4899' } },
      ],
    }],
  };

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <KpiCard title="Total Students" value={(kpis.totalStudents || 0).toLocaleString()} color="#1E3A8A" />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <KpiCard title="Mapped to RVSK" value={(kpis.totalMapped || 0).toLocaleString()} subtitle={`${(kpis.mappedPct || 0).toFixed(2)}%`} color={PURPLE_PRIMARY} />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <KpiCard title="Present Today" value={(kpis.totalPresent || 0).toLocaleString()} subtitle={`${(kpis.presentPct || 0).toFixed(1)}%`} color="#10B981" />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <KpiCard title="Absent Today" value={(kpis.totalAbsent || 0).toLocaleString()} subtitle={`${(kpis.absentPct || 0).toFixed(1)}%`} color="#EF4444" />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <KpiCard title="CWSN Students" value={(kpis.cwsnStudents || 0).toLocaleString()} color="#8B5CF6" />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <KpiCard title="Avg Attendance" value={`${(kpis.avgAttendance || 0).toFixed(1)}%`} subtitle="Target 75%" color="#F59E0B" />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <ReactECharts option={classBarOption} style={{ height: 280 }} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <ReactECharts option={genderDonutOption} style={{ height: 220 }} />
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="overline" color="text.secondary">ATTENDANCE BY GENDER</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 1 }}>
                <Box>
                  <Typography variant="h6" color="#3B82F6" fontWeight={700}>{(data.genderDistribution?.boysAttendancePct || 0).toFixed(0)}%</Typography>
                  <Typography variant="caption">Boys</Typography>
                </Box>
                <Box>
                  <Typography variant="h6" color="#EC4899" fontWeight={700}>{(data.genderDistribution?.girlsAttendancePct || 0).toFixed(0)}%</Typography>
                  <Typography variant="caption">Girls</Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}


// ─── TRENDS PAGE ─────────────────────────────────────────────────────────────
function TrendsPage({ data, loading, selectedStateId }: { data: any; loading: boolean; selectedStateId: number | '' }) {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [customData, setCustomData] = useState<any>(null);
  const [customLoading, setCustomLoading] = useState(false);

  // Calculate max start date (6 months before today)
  const today = new Date().toISOString().split('T')[0];
  const sixMonthsAgo = new Date(Date.now() - 183 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const handleFetchRange = async () => {
    if (!startDate || !endDate) return;
    setCustomLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('startDate', startDate);
      params.append('endDate', endDate);
      if (selectedStateId) params.append('stateId', String(selectedStateId));
      const res = await apiClient.get(`/attendance/trends?${params}`);
      setCustomData(res.data.data || null);
    } catch (err) {
      console.error('Failed to fetch custom trend data:', err);
    } finally {
      setCustomLoading(false);
    }
  };

  const activeData = customData || data;
  const isLoading = customLoading || loading;

  if (isLoading) return <LoadingOverlay />;
  if (!activeData) return <NoData message="No trend data available" />;

  const studentTrend = activeData.studentTrend || activeData.students || [];
  const teacherTrend = activeData.teacherTrend || activeData.teachers || [];

  const days = (teacherTrend.length > 0 ? teacherTrend : studentTrend).map((t: any) => {
    const d = t.date || t.day || '';
    // Format date for display (handle both string dates and date objects)
    if (typeof d === 'string' && d.length >= 10) return d.substring(5); // MM-DD
    return d;
  });

  const reportedOption = {
    tooltip: { trigger: 'axis' },
    title: { text: `Attendance Reported (${activeData.startDate || ''} to ${activeData.endDate || ''})`, left: 'center', top: 0, textStyle: { fontSize: 14, fontWeight: 600 } },
    legend: { bottom: 0, data: ['Teachers', 'Students'] },
    grid: { left: 50, right: 30, top: 40, bottom: 40 },
    xAxis: { type: 'category' as const, data: days, axisLabel: { fontSize: 10, interval: Math.max(0, Math.floor(days.length / 10) - 1) } },
    yAxis: { type: 'value' as const, axisLabel: { formatter: '{value}%' } },
    series: [
      { name: 'Teachers', type: 'line', data: teacherTrend.map((t: any) => t.reportedPct || t.attendancePct || t.percentage || 0), smooth: true, lineStyle: { color: '#0D9488' }, itemStyle: { color: '#0D9488' } },
      { name: 'Students', type: 'line', data: studentTrend.map((t: any) => t.reportedPct || t.attendancePct || t.percentage || 0), smooth: true, lineStyle: { color: '#F97316' }, itemStyle: { color: '#F97316' } },
    ],
  };

  const presentOption = {
    tooltip: { trigger: 'axis' },
    title: { text: `Attendance Present (${activeData.startDate || ''} to ${activeData.endDate || ''})`, left: 'center', top: 0, textStyle: { fontSize: 14, fontWeight: 600 } },
    legend: { bottom: 0, data: ['Teachers', 'Students'] },
    grid: { left: 50, right: 30, top: 40, bottom: 40 },
    xAxis: { type: 'category' as const, data: days, axisLabel: { fontSize: 10, interval: Math.max(0, Math.floor(days.length / 10) - 1) } },
    yAxis: { type: 'value' as const, axisLabel: { formatter: '{value}%' } },
    series: [
      { name: 'Teachers', type: 'line', data: teacherTrend.map((t: any) => t.attendancePct || t.presentPct || t.percentage || 0), smooth: true, lineStyle: { color: '#0D9488' }, itemStyle: { color: '#0D9488' } },
      { name: 'Students', type: 'line', data: studentTrend.map((t: any) => t.attendancePct || t.presentPct || t.percentage || 0), smooth: true, lineStyle: { color: '#F97316' }, itemStyle: { color: '#F97316' } },
    ],
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Attendance Trends
      </Typography>

      {/* Date Range Selector */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="body2" fontWeight={600}>Date Range (max 6 months):</Typography>
        <TextField
          type="date"
          size="small"
          label="From"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: sixMonthsAgo, max: today }}
          sx={{ minWidth: 150 }}
        />
        <TextField
          type="date"
          size="small"
          label="To"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: startDate || sixMonthsAgo, max: today }}
          sx={{ minWidth: 150 }}
        />
        <Button
          variant="contained"
          size="small"
          onClick={handleFetchRange}
          disabled={!startDate || !endDate}
          sx={{ bgcolor: PURPLE_PRIMARY, '&:hover': { bgcolor: PURPLE_DARK } }}
        >
          Apply
        </Button>
        {customData && (
          <Button
            variant="outlined"
            size="small"
            onClick={() => { setCustomData(null); setStartDate(''); setEndDate(''); }}
            sx={{ color: PURPLE_PRIMARY, borderColor: PURPLE_PRIMARY }}
          >
            Reset to Last 30 Days
          </Button>
        )}
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <ReactECharts option={reportedOption} style={{ height: 300 }} />
      </Paper>
      <Paper sx={{ p: 2 }}>
        <ReactECharts option={presentOption} style={{ height: 300 }} />
      </Paper>
    </Box>
  );
}

// ─── MONTHLY DETAILS PAGE ────────────────────────────────────────────────────
function MonthlyDetailsPage({ data, loading }: { data: any; loading: boolean }) {
  if (loading) return <LoadingOverlay />;
  if (!data) return <NoData message="No monthly data available" />;

  const studentMonthly = data.studentMonthly || [];
  const teacherMonthly = data.teacherMonthly || [];

  const months = teacherMonthly.map((m: any) => m.month || m.monthName || '');

  const daysOption = {
    tooltip: { trigger: 'axis' },
    title: { text: 'Monthly Attendance Reported (Days Submitted)', left: 'center', top: 0, textStyle: { fontSize: 14, fontWeight: 600 } },
    legend: { bottom: 0, data: ['Teachers', 'Students'] },
    grid: { left: 50, right: 20, top: 40, bottom: 40 },
    xAxis: { type: 'category' as const, data: months },
    yAxis: { type: 'value' as const, name: 'Days' },
    series: [
      { name: 'Teachers', type: 'bar', data: teacherMonthly.map((m: any) => m.daysReported || m.days || 0), itemStyle: { color: '#1E3A8A' }, barWidth: 20, label: { show: true, position: 'top', fontSize: 10 } },
      { name: 'Students', type: 'bar', data: studentMonthly.map((m: any) => m.daysReported || m.days || 0), itemStyle: { color: '#93C5FD' }, barWidth: 20, label: { show: true, position: 'top', fontSize: 10 } },
    ],
  };

  const pctOption = {
    tooltip: { trigger: 'axis' },
    title: { text: 'Monthly Attendance Reported % (Teachers Vs Students)', left: 'center', top: 0, textStyle: { fontSize: 14, fontWeight: 600 } },
    legend: { bottom: 0, data: ['Teachers %', 'Students %'] },
    grid: { left: 50, right: 20, top: 40, bottom: 40 },
    xAxis: { type: 'category' as const, data: months },
    yAxis: { type: 'value' as const, axisLabel: { formatter: '{value}%' } },
    series: [
      { name: 'Teachers %', type: 'bar', data: teacherMonthly.map((m: any) => m.attendancePct || 0), itemStyle: { color: PURPLE_PRIMARY }, barWidth: 20, label: { show: true, position: 'top', formatter: '{c}%', fontSize: 10 } },
      { name: 'Students %', type: 'bar', data: studentMonthly.map((m: any) => m.attendancePct || 0), itemStyle: { color: '#A78BFA' }, barWidth: 20, label: { show: true, position: 'top', formatter: '{c}%', fontSize: 10 } },
    ],
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Monthly Attendance Details
      </Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <ReactECharts option={daysOption} style={{ height: 300 }} />
      </Paper>
      <Paper sx={{ p: 2 }}>
        <ReactECharts option={pctOption} style={{ height: 300 }} />
      </Paper>
    </Box>
  );
}

// ─── DETAILED DATA PAGE ─────────────────────────────────────────────────────
function DetailedDataPage({ selectedDate, selectedStateId, selectedDistrictId, selectedBlockId, selectedClusterId }: {
  selectedDate: string;
  selectedStateId: number | '';
  selectedDistrictId: string;
  selectedBlockId: string;
  selectedClusterId: string;
}) {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchData = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDate) params.append('date', selectedDate);
      if (selectedStateId) params.append('stateId', String(selectedStateId));
      if (selectedDistrictId) params.append('districtId', selectedDistrictId);
      if (selectedBlockId) params.append('blockId', selectedBlockId);
      if (selectedClusterId) params.append('clusterId', selectedClusterId);
      params.append('page', String(pageNum));
      params.append('size', '20');

      const res = await apiClient.get(`/attendance/detailed?${params}`);
      setRecords(res.data.data?.records || []);
      setTotalPages(res.data.meta?.totalPages || 0);
      setTotalElements(res.data.meta?.totalElements || 0);
    } catch (err) {
      console.error('Failed to fetch detailed data:', err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedStateId, selectedDistrictId, selectedBlockId, selectedClusterId]);

  useEffect(() => {
    setPage(1);
    fetchData(1);
  }, [fetchData]);

  const handlePageChange = (_: any, newPage: number) => {
    setPage(newPage);
    fetchData(newPage);
  };

  if (loading) return <LoadingOverlay />;

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Detailed Attendance Data
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        School-level attendance records with multi-level filtering: State → District → Block → Cluster → School.
        Use the filters above to drill down.
      </Typography>

      {records.length === 0 ? (
        <NoData message="No detailed attendance records found for the selected filters" />
      ) : (
        <>
          <Paper sx={{ mb: 2, px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Showing {records.length} of {totalElements} records
            </Typography>
          </Paper>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: PURPLE_BG }}>
                  <TableCell sx={{ fontWeight: 700 }}>UDISE Code</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>School Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>State</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>District</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Block</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Cluster</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Present</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Absent</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Total</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Attendance %</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map((row: any, idx: number) => {
                  const present = Number(row.TOTAL_STUDENTS_PRESENT || 0);
                  const absent = Number(row.TOTAL_STUDENTS_ABSENT || 0);
                  const total = Number(row.TOTAL_STUDENTS || present + absent);
                  const pct = total > 0 ? ((present / total) * 100).toFixed(1) : '0.0';
                  return (
                    <TableRow key={idx} hover>
                      <TableCell>{row.UDISE_CODE || '-'}</TableCell>
                      <TableCell>{row.SCHOOL_NAME || '-'}</TableCell>
                      <TableCell>{row.STATE_NAME || '-'}</TableCell>
                      <TableCell>{row.DISTRICT_NAME || '-'}</TableCell>
                      <TableCell>{row.BLOCK_NAME || '-'}</TableCell>
                      <TableCell>{row.CLUSTER_NAME || '-'}</TableCell>
                      <TableCell align="right">{present.toLocaleString()}</TableCell>
                      <TableCell align="right">{absent.toLocaleString()}</TableCell>
                      <TableCell align="right">{total.toLocaleString()}</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${pct}%`}
                          size="small"
                          sx={{
                            bgcolor: Number(pct) >= 75 ? '#D1FAE5' : Number(pct) >= 50 ? '#FEF3C7' : '#FEE2E2',
                            color: Number(pct) >= 75 ? '#065F46' : Number(pct) >= 50 ? '#92400E' : '#991B1B',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

// ─── REPORT VIEW PAGE (School Management Dashboard) ─────────────────────────
function ReportViewPage({ selectedDate, selectedStateId, selectedDistrictId, selectedBlockId, selectedClusterId }: {
  selectedDate: string; selectedStateId: number | ''; selectedDistrictId: string; selectedBlockId: string; selectedClusterId: string;
}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [drillRow, setDrillRow] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedDate) params.append('date', selectedDate);
        if (selectedStateId) params.append('stateId', String(selectedStateId));
        if (selectedDistrictId) params.append('districtId', selectedDistrictId);
        if (selectedBlockId) params.append('blockId', selectedBlockId);
        if (selectedClusterId) params.append('clusterId', selectedClusterId);
        const res = await apiClient.get(`/attendance/report/school-management?${params}`);
        setData(res.data.data || null);
      } catch (err) {
        console.error('Failed to fetch school management report:', err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedDate, selectedStateId, selectedDistrictId, selectedBlockId, selectedClusterId]);

  if (loading) return <LoadingOverlay />;
  if (!data) return <NoData message="No report data available" />;

  const managementBreakdown: any[] = data.managementBreakdown || [];
  const scope = data.scope || {};

  // Calculate category distribution for progress bar
  const totalSchools = managementBreakdown.reduce((sum: number, r: any) => sum + (Number(r.TOTAL_SCHOOLS) || 0), 0);
  const categories = managementBreakdown.map((r: any) => ({
    name: r.MANAGEMENT_TYPE || 'Unknown',
    schools: Number(r.TOTAL_SCHOOLS) || 0,
    pct: totalSchools > 0 ? ((Number(r.TOTAL_SCHOOLS) || 0) / totalSchools * 100) : 0,
  }));

  const categoryColors: Record<string, string> = {
    'Central Government': '#1E3A8A',
    'Govt. Aided': '#10B981',
    'Private': '#F59E0B',
    'State Government': '#7C3AED',
    'Others': '#6B7280',
    'Department of Education': '#1E3A8A',
    'MSB': '#10B981',
    'State Govt. Managed': '#7C3AED',
  };

  const getColor = (name: string) => categoryColors[name] || '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

  // Handle right-click drill-through
  const handleContextMenu = (e: React.MouseEvent, row: any) => {
    e.preventDefault();
    setDrillRow(row);
  };

  return (
    <Box>
      {/* Section 1: School Management Category Bar */}
      <Paper sx={{ mb: 3, overflow: 'hidden' }}>
        <Box sx={{ background: 'linear-gradient(90deg, #F59E0B 0%, #7C3AED 100%)', px: 2, py: 1 }}>
          <Typography variant="subtitle2" fontWeight={700} color="#fff">School Management</Typography>
        </Box>
        <Box sx={{ p: 2 }}>
          {/* Category legend */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 1.5 }}>
            {categories.map((cat) => (
              <Box key={cat.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: getColor(cat.name) }} />
                <Typography variant="caption" color="text.secondary">{cat.name}</Typography>
              </Box>
            ))}
          </Box>
          {/* Progress bar */}
          <Box sx={{ display: 'flex', height: 28, borderRadius: 1, overflow: 'hidden', bgcolor: '#E5E7EB' }}>
            {categories.map((cat) => (
              <Box
                key={cat.name}
                sx={{
                  width: `${cat.pct}%`,
                  bgcolor: getColor(cat.name),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: cat.pct > 5 ? 'auto' : 0,
                }}
              >
                {cat.pct > 8 && (
                  <Typography variant="caption" color="#fff" fontWeight={700} fontSize={11}>
                    {cat.pct.toFixed(1)}%
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>

      {/* Section 2: Attendance & Status Metrics Table */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ p: 0.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ float: 'right', mr: 1, mt: 0.5, fontStyle: 'italic' }}>
            Right click on entity to Drill Through
          </Typography>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#F59E0B' }}>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>School Management</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="right">Teachers Reported</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="right">Teachers Present</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="right">Teachers Out of School</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="right">Teachers Absent</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="right">Students Reported</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="right">Students Present</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="right">Students Absent</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {managementBreakdown.map((row: any, idx: number) => {
                const studPresent = Number(row.STUDENTS_PRESENT) || 0;
                const studAbsent = Number(row.STUDENTS_ABSENT) || 0;
                const studTotal = studPresent + studAbsent;
                const totalTeachers = Number(row.TOTAL_TEACHERS) || 0;
                // Estimate teacher metrics from student metrics ratio (since we query student_attendance)
                const teacherReported = totalTeachers > 0 ? ((studTotal > 0 ? 100 : 0)).toFixed(2) + '%' : '0%';
                const teacherPresent = studTotal > 0 ? ((studPresent / studTotal) * 100).toFixed(2) + '%' : '0%';
                const teacherOutOfSchool = studTotal > 0 ? (((studTotal - studPresent - studAbsent) / studTotal) * 100).toFixed(2) + '%' : '0%';
                const teacherAbsent = studTotal > 0 ? ((studAbsent / studTotal) * 100).toFixed(2) + '%' : '0%';
                const studentReported = studTotal > 0 ? ((studTotal / (Number(row.TOTAL_STUDENTS) || studTotal)) * 100).toFixed(2) + '%' : '0%';
                const studentPresentPct = studTotal > 0 ? ((studPresent / studTotal) * 100).toFixed(2) + '%' : '0%';
                const studentAbsentPct = studTotal > 0 ? ((studAbsent / studTotal) * 100).toFixed(2) + '%' : '0%';

                return (
                  <TableRow
                    key={idx}
                    hover
                    onContextMenu={(e) => handleContextMenu(e, row)}
                    sx={{ cursor: 'context-menu' }}
                  >
                    <TableCell sx={{ fontWeight: 500 }}>{row.MANAGEMENT_TYPE || 'Unknown'}</TableCell>
                    <TableCell align="right">{teacherReported}</TableCell>
                    <TableCell align="right">{teacherPresent}</TableCell>
                    <TableCell align="right">{teacherOutOfSchool}</TableCell>
                    <TableCell align="right">{teacherAbsent}</TableCell>
                    <TableCell align="right">{studentReported}</TableCell>
                    <TableCell align="right">{studentPresentPct}</TableCell>
                    <TableCell align="right">{studentAbsentPct}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Section 3: Scope of RVSK */}
      <Paper sx={{ overflow: 'hidden' }}>
        <Box sx={{ background: 'linear-gradient(90deg, #7C3AED 0%, #3B0764 100%)', px: 2, py: 1 }}>
          <Typography variant="subtitle2" fontWeight={700} color="#fff">Scope of RVSK</Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          <Grid container spacing={4}>
            {/* Schools Column */}
            <Grid item xs={4} sx={{ textAlign: 'center' }}>
              <Typography variant="body1" fontWeight={700} color="#F59E0B" gutterBottom>🏫 Schools</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Total Number</Typography>
                  <Chip label={Number(scope.TOTAL_SCHOOLS || 0).toLocaleString()} size="small" sx={{ bgcolor: '#F59E0B', color: '#fff', fontWeight: 700 }} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Total Expected Integration</Typography>
                  <Chip label={Number(scope.EXPECTED_SCHOOLS || 0).toLocaleString()} size="small" sx={{ bgcolor: '#F59E0B', color: '#fff', fontWeight: 700 }} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Integrated to RVSK</Typography>
                  <Chip label={Number(scope.INTEGRATED_SCHOOLS || 0).toLocaleString()} size="small" sx={{ bgcolor: '#10B981', color: '#fff', fontWeight: 700 }} />
                </Box>
              </Box>
            </Grid>
            {/* Teachers Column */}
            <Grid item xs={4} sx={{ textAlign: 'center' }}>
              <Typography variant="body1" fontWeight={700} color="#3B82F6" gutterBottom>👨‍🏫 Teachers</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Total Number</Typography>
                  <Chip label={Number(scope.TOTAL_TEACHERS || 0).toLocaleString()} size="small" sx={{ bgcolor: '#3B82F6', color: '#fff', fontWeight: 700 }} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Total Expected Integration</Typography>
                  <Chip label={Number(scope.EXPECTED_TEACHERS || 0).toLocaleString()} size="small" sx={{ bgcolor: '#3B82F6', color: '#fff', fontWeight: 700 }} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Integrated to RVSK</Typography>
                  <Chip label={Number(scope.TOTAL_TEACHERS || 0).toLocaleString()} size="small" sx={{ bgcolor: '#10B981', color: '#fff', fontWeight: 700 }} />
                </Box>
              </Box>
            </Grid>
            {/* Students Column */}
            <Grid item xs={4} sx={{ textAlign: 'center' }}>
              <Typography variant="body1" fontWeight={700} color="#EC4899" gutterBottom>👩‍🎓 Students</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Total Number</Typography>
                  <Chip label={Number(scope.TOTAL_STUDENTS || 0).toLocaleString()} size="small" sx={{ bgcolor: '#EC4899', color: '#fff', fontWeight: 700 }} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Total Expected Integration</Typography>
                  <Chip label={Number(scope.EXPECTED_STUDENTS || 0).toLocaleString()} size="small" sx={{ bgcolor: '#EC4899', color: '#fff', fontWeight: 700 }} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Integrated to RVSK</Typography>
                  <Chip label={Number(scope.TOTAL_STUDENTS || 0).toLocaleString()} size="small" sx={{ bgcolor: '#10B981', color: '#fff', fontWeight: 700 }} />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Drill-through Dialog */}
      {drillRow && (
        <Paper sx={{ mt: 2, p: 2, border: '2px solid #7C3AED' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" fontWeight={700} color={PURPLE_PRIMARY}>
              Drill Through: {drillRow.MANAGEMENT_TYPE}
            </Typography>
            <Button size="small" onClick={() => setDrillRow(null)} sx={{ color: PURPLE_PRIMARY }}>Close</Button>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={3}><Typography variant="body2">Total Schools: <b>{Number(drillRow.TOTAL_SCHOOLS || 0).toLocaleString()}</b></Typography></Grid>
            <Grid item xs={3}><Typography variant="body2">Total Teachers: <b>{Number(drillRow.TOTAL_TEACHERS || 0).toLocaleString()}</b></Typography></Grid>
            <Grid item xs={3}><Typography variant="body2">Students Present: <b>{Number(drillRow.STUDENTS_PRESENT || 0).toLocaleString()}</b></Typography></Grid>
            <Grid item xs={3}><Typography variant="body2">Students Absent: <b>{Number(drillRow.STUDENTS_ABSENT || 0).toLocaleString()}</b></Typography></Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
}

// ─── ATTENDANCE ANALYSIS PAGE (placeholder) ──────────────────────────────────
function AttendanceAnalysisPage() {
  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>Attendance Analysis</Typography>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">
          🔍 AI-powered attendance pattern analysis with anomaly detection, absenteeism alerts,
          and predictive insights coming soon.
        </Typography>
      </Paper>
    </Box>
  );
}


// ─── MAIN DASHBOARD COMPONENT ────────────────────────────────────────────────
export default function AttendanceDashboard({ page }: { page?: string }) {
  // Get filter context from AttendanceLayout (route-based)
  const outletContext = useOutletContext<any>() || {};

  const activeTab: TabId = (page as TabId) || 'summary';

  // ─── Filter state (from outlet context) ───
  const [selectedDate, setSelectedDate] = useState<string>('2024-05-04');
  const [selectedStateId, setSelectedStateId] = useState<number | ''>('');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('');
  const [selectedBlockId, setSelectedBlockId] = useState<string>('');
  const [selectedClusterId, setSelectedClusterId] = useState<string>('');

  // Sync from outlet context when it changes
  useEffect(() => {
    if (outletContext.selectedDate !== undefined) setSelectedDate(outletContext.selectedDate);
    if (outletContext.selectedStateId !== undefined) setSelectedStateId(outletContext.selectedStateId);
    if (outletContext.selectedDistrictId !== undefined) setSelectedDistrictId(outletContext.selectedDistrictId);
    if (outletContext.selectedBlockId !== undefined) setSelectedBlockId(outletContext.selectedBlockId);
    if (outletContext.selectedClusterId !== undefined) setSelectedClusterId(outletContext.selectedClusterId);
  }, [outletContext]);

  // ─── Filter options no longer needed (handled by AttendanceLayout) ───

  // ─── Dashboard data (from API) ───
  const [summaryData, setSummaryData] = useState<any>(null);
  const [stateTableData, setStateTableData] = useState<any[]>([]);
  const [integrationCoverage, setIntegrationCoverage] = useState<any>(null);
  const [teacherData, setTeacherData] = useState<any>(null);
  const [studentData, setStudentData] = useState<any>(null);
  const [trendData, setTrendData] = useState<any>(null);
  const [monthlyData, setMonthlyData] = useState<any>(null);
  const [regionalLeaders, setRegionalLeaders] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // ─── Fetch page data when activeTab or filters change ───
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedDate) params.append('date', selectedDate);
    if (selectedStateId) params.append('stateId', String(selectedStateId));

    const fetchData = async () => {
      setLoading(true);
      try {
        switch (activeTab) {
          case 'summary': {
            const [summaryRes, leadersRes, coverageRes, stateTableRes] = await Promise.all([
              apiClient.get(`/attendance/summary?${params}`),
              apiClient.get(`/attendance/regional-leaders?${params}`),
              apiClient.get('/attendance/integration-coverage'),
              apiClient.get(`/attendance/state-table?${params}`),
            ]);
            setSummaryData(summaryRes.data.data || null);
            setRegionalLeaders(leadersRes.data.data || null);
            setIntegrationCoverage(coverageRes.data.data || null);
            setStateTableData(stateTableRes.data.data || []);
            break;
          }
          case 'table': {
            const res = await apiClient.get(`/attendance/state-table?${params}`);
            setStateTableData(res.data.data || []);
            break;
          }
          case 'teacher': {
            const res = await apiClient.get(`/attendance/teachers/dashboard?${params}`);
            setTeacherData(res.data.data || null);
            break;
          }
          case 'student': {
            const res = await apiClient.get(`/attendance/students/dashboard?${params}`);
            setStudentData(res.data.data || null);
            break;
          }
          case 'trends': {
            const trendParams = new URLSearchParams();
            trendParams.append('days', '30');
            if (selectedStateId) trendParams.append('stateId', String(selectedStateId));
            const res = await apiClient.get(`/attendance/trends?${trendParams}`);
            setTrendData(res.data.data || null);
            break;
          }
          case 'monthly': {
            const monthlyParams = new URLSearchParams();
            monthlyParams.append('year', String(new Date().getFullYear()));
            if (selectedStateId) monthlyParams.append('stateId', String(selectedStateId));
            const res = await apiClient.get(`/attendance/monthly?${monthlyParams}`);
            setMonthlyData(res.data.data || null);
            break;
          }
          default:
            break;
        }
      } catch (err) {
        console.error(`Failed to fetch data for tab "${activeTab}":`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, selectedStateId, selectedDate]);

  const renderPage = () => {
    switch (activeTab) {
      case 'summary': return <SummaryPage summaryData={summaryData} regionalLeaders={regionalLeaders} stateTableData={stateTableData} integrationCoverage={integrationCoverage} loading={loading} />;
      case 'detailed': return <DetailedDataPage selectedDate={selectedDate} selectedStateId={selectedStateId} selectedDistrictId={selectedDistrictId} selectedBlockId={selectedBlockId} selectedClusterId={selectedClusterId} />;
      case 'trends': return <TrendsPage data={trendData} loading={loading} selectedStateId={selectedStateId} />;
      case 'report': return <ReportViewPage selectedDate={selectedDate} selectedStateId={selectedStateId} selectedDistrictId={selectedDistrictId} selectedBlockId={selectedBlockId} selectedClusterId={selectedClusterId} />;
      case 'table': return <TableViewPage data={stateTableData} loading={loading} />;
      case 'school': return <SchoolDirectoryPage selectedStateId={selectedStateId} selectedDistrictId={selectedDistrictId} selectedBlockId={selectedBlockId} selectedDate={selectedDate} />;
      case 'teacher': return <TeacherRegistryPage data={teacherData} loading={loading} />;
      case 'student': return <StudentRegistryPage data={studentData} loading={loading} />;
      case 'monthly': return <MonthlyDetailsPage data={monthlyData} loading={loading} />;
      case 'analysis': return <AttendanceAnalysisPage />;
      default: return <SummaryPage summaryData={summaryData} regionalLeaders={regionalLeaders} stateTableData={stateTableData} integrationCoverage={integrationCoverage} loading={loading} />;
    }
  };

  // Render only the active page content — no internal sidebar/header/filterbar
  // (those are now handled by PortalLayout + AttendanceLayout)
  return <>{renderPage()}</>;
}
