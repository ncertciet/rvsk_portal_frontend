import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  CircularProgress,
  IconButton,
  Collapse,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ReactECharts from 'echarts-for-react';
import apiClient from '../../../../services/apiClient';

interface DetailedStats {
  school: {
    totalSchools: number;
    schoolCategory: Record<string, number>;
    schoolManagement: Record<string, number>;
    schoolType: Record<string, number>;
  };
  physicalInfrastructures: Record<string, number>;
  digitalInfrastructures: Record<string, number>;
  laboratories: Record<string, number>;
  teachers: Record<string, number>;
  students: Record<string, number>;
  enrollmentByStreams: Record<string, number>;
  ptr: Record<string, number>;
}

interface StatewiseTabProps {
  selectedState: string;
}

const INNER_TABS = [
  'School',
  'Physical Infrastructures',
  'Digital Infrastructures',
  'Laboratories',
  'Teachers',
  'Students',
  'Enrollment by Streams',
  'PTR',
];

const CHART_COLORS = {
  school: {
    category: ['#00695C', '#1976D2', '#F9A825', '#00ACC1', '#1A237E'],
    management: ['#0D2B5B', '#00695C', '#4DD0E1', '#80CBC4', '#1565C0', '#1A237E', '#E91E63'],
    type: ['#1A237E', '#E91E63', '#F9A825'],
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  prePrimary: 'Pre-Primary School',
  primary: 'Primary School',
  upperPrimary: 'Upper Primary School',
  secondary: 'Secondary School',
  higherSecondary: 'Higher Secondary School',
};

const MANAGEMENT_LABELS: Record<string, string> = {
  centralGovtPsu: 'Schools Managed by Central Govt (PSU Schools)',
  kvs: 'KVS School',
  nvs: 'NVS School',
  stateGovtLocalBody: 'Schools Managed by State Govt (Local Body)',
  stateGovtSocialWelfare: 'Schools Managed by State Govt (Social Welfare Dept)',
  stateGovtTribalWelfare: 'Schools Managed by State Govt (Tribal Welfare Dept)',
  stateGovtDeptEducation: 'Schools Managed by State Govt (Dept of Education)',
};

const TYPE_LABELS: Record<string, string> = {
  boys: 'Boys School',
  girls: 'Girls School',
  coEd: 'Co-ed School',
};

function getSchoolChartOption(stats: DetailedStats) {
  const total = stats.school.totalSchools || 1;
  const categoryData = Object.entries(stats.school.schoolCategory);
  const managementData = Object.entries(stats.school.schoolManagement).filter(([k]) => k !== 'cwsnEnrollments');
  const typeData = Object.entries(stats.school.schoolType);

  const allSeries: { name: string; data: number[]; color: string }[] = [];

  categoryData.forEach(([key, val], i) => {
    allSeries.push({
      name: CATEGORY_LABELS[key] || key,
      data: [Math.round((val / total) * 10000) / 100, 0, 0],
      color: CHART_COLORS.school.category[i % CHART_COLORS.school.category.length],
    });
  });

  managementData.forEach(([key, val], i) => {
    allSeries.push({
      name: MANAGEMENT_LABELS[key] || key,
      data: [0, Math.round((val / total) * 10000) / 100, 0],
      color: CHART_COLORS.school.management[i % CHART_COLORS.school.management.length],
    });
  });

  typeData.forEach(([key, val], i) => {
    allSeries.push({
      name: TYPE_LABELS[key] || key,
      data: [0, 0, Math.round((val / total) * 10000) / 100],
      color: CHART_COLORS.school.type[i % CHART_COLORS.school.type.length],
    });
  });

  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { orient: 'vertical' as const, right: 0, top: 'center', data: allSeries.map((s) => s.name), textStyle: { fontSize: 10 } },
    grid: { left: '15%', right: '30%', top: '5%', bottom: '5%' },
    xAxis: { type: 'value' as const, max: 100, axisLabel: { formatter: '{value}' } },
    yAxis: { type: 'category' as const, data: ['School Category', 'School Management', 'School Type'] },
    series: allSeries.map((s) => ({
      name: s.name,
      type: 'bar' as const,
      stack: 'total',
      data: s.data,
      itemStyle: { color: s.color },
      barMaxWidth: 30,
    })),
  };
}

function getGenericBarOption(data: Record<string, number>, title: string) {
  const entries = Object.entries(data).filter(([k]) => k !== 'totalSchools');
  const total = (data.totalSchools || 1);
  const labels = entries.map(([k]) => k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()));
  const values = entries.map(([, v]) => Math.round((v / total) * 10000) / 100);
  const colors = ['#00695C', '#1976D2', '#F9A825', '#00ACC1', '#1A237E', '#E91E63', '#4DD0E1'];

  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { orient: 'vertical' as const, right: 0, top: 'center', data: labels, textStyle: { fontSize: 10 } },
    grid: { left: '15%', right: '30%', top: '5%', bottom: '5%' },
    xAxis: { type: 'value' as const, max: 100, axisLabel: { formatter: '{value}' } },
    yAxis: { type: 'category' as const, data: [title] },
    series: entries.map((_, i) => ({
      name: labels[i],
      type: 'bar' as const,
      stack: 'total',
      data: [values[i]],
      itemStyle: { color: colors[i % colors.length] },
      barMaxWidth: 30,
    })),
  };
}

function getTeacherBarOption(data: Record<string, number>) {
  const entries = Object.entries(data);
  const labels = entries.map(([k]) => k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()));
  const colors = ['#1A237E', '#1976D2', '#F9A825', '#00695C', '#E91E63', '#00ACC1', '#4DD0E1'];

  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { orient: 'vertical' as const, right: 0, top: 'center', data: labels, textStyle: { fontSize: 10 } },
    grid: { left: '15%', right: '30%', top: '5%', bottom: '5%' },
    xAxis: { type: 'value' as const },
    yAxis: { type: 'category' as const, data: ['Teachers'] },
    series: entries.map(([, v], i) => ({
      name: labels[i],
      type: 'bar' as const,
      stack: 'total',
      data: [v],
      itemStyle: { color: colors[i % colors.length] },
      barMaxWidth: 30,
    })),
  };
}

function getPtrOption(data: Record<string, number>) {
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: '15%', right: '15%', top: '10%', bottom: '10%' },
    xAxis: { type: 'category' as const, data: ['PTR'] },
    yAxis: { type: 'value' as const },
    series: [{ type: 'bar' as const, data: [data.ptr || 0], itemStyle: { color: '#1976D2' }, barMaxWidth: 60 }],
  };
}

function AccordionSection({ title, children, defaultExpanded = false }: { title: string; children: React.ReactNode; defaultExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  return (
    <Box sx={{ mb: 1 }}>
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          bgcolor: '#1A237E', color: '#fff', px: 2, py: 1, borderRadius: 1, cursor: 'pointer',
          '&:hover': { bgcolor: '#0D2B5B' },
        }}
      >
        <Typography variant="subtitle2" fontWeight={600}>{title}</Typography>
        <IconButton size="small" sx={{ color: '#fff' }}>
          {expanded ? <RemoveIcon fontSize="small" /> : <AddIcon fontSize="small" />}
        </IconButton>
      </Box>
      <Collapse in={expanded}>
        <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderTop: 0, borderRadius: '0 0 4px 4px' }}>
          {children}
        </Box>
      </Collapse>
    </Box>
  );
}

function DataRow({ label, value }: { label: string; value: number | string }) {
  const formatted = typeof value === 'number' ? value.toLocaleString('en-IN') : value;
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, borderBottom: '1px solid #f0f0f0' }}>
      <Typography variant="body2">{label}</Typography>
      <Typography variant="body2" fontWeight={600}>{formatted}</Typography>
    </Box>
  );
}

export default function StatewiseTab({ selectedState }: StatewiseTabProps) {
  const [subTab, setSubTab] = useState(0); // 0 = Graph Report, 1 = Tabular Data Report
  const [innerTab, setInnerTab] = useState(0);
  const [stats, setStats] = useState<DetailedStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState<string[]>([]);
  const [localState, setLocalState] = useState(selectedState || '');

  useEffect(() => {
    apiClient.get('/schemes/PM_SHRI/filters').then((res) => {
      setStates(res.data.states || []);
    });
  }, []);

  useEffect(() => {
    setLocalState(selectedState || '');
  }, [selectedState]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (localState) params.append('stateName', localState);
    apiClient
      .get(`/schemes/PM_SHRI/detailed-stats?${params.toString()}`)
      .then((res) => { setStats(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [localState]);

  const handleDownload = () => {
    const params = new URLSearchParams();
    if (localState) params.append('stateName', localState);
    window.open(`/api/v1/schemes/PM_SHRI/detailed-stats?${params.toString()}`, '_blank');
  };

  const getChartOption = () => {
    if (!stats) return {};
    switch (innerTab) {
      case 0: return getSchoolChartOption(stats);
      case 1: return getGenericBarOption(stats.physicalInfrastructures, 'Physical Infrastructures');
      case 2: return getGenericBarOption(stats.digitalInfrastructures, 'Digital Infrastructures');
      case 3: return getGenericBarOption(stats.laboratories, 'Laboratories');
      case 4: return getTeacherBarOption(stats.teachers);
      case 5: return getGenericBarOption(stats.students, 'Students');
      case 6: return getGenericBarOption(stats.enrollmentByStreams, 'Enrollment by Streams');
      case 7: return getPtrOption(stats.ptr);
      default: return {};
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Sub-tabs: Graph Report | Tabular Data Report */}
      <Tabs
        value={subTab}
        onChange={(_, v) => setSubTab(v)}
        sx={{
          mb: 2,
          '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', minHeight: 36 },
          '& .Mui-selected': { color: '#1A4F99' },
          '& .MuiTabs-indicator': { backgroundColor: '#FF9933', height: 3 },
        }}
      >
        <Tab label="Graph Report" />
        <Tab label="Tabular Data Report" />
      </Tabs>

      {/* State Dropdown */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Select State</InputLabel>
          <Select value={localState} label="Select State" onChange={(e) => setLocalState(e.target.value)}>
            <MenuItem value="">All States</MenuItem>
            {states.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
        {subTab === 1 && (
          <IconButton onClick={handleDownload} sx={{ bgcolor: '#1976D2', color: '#fff', '&:hover': { bgcolor: '#1565C0' } }}>
            <DownloadIcon />
          </IconButton>
        )}
      </Box>

      {/* Graph Report View */}
      {subTab === 0 && stats && (
        <Box>
          {/* Inner Tabs */}
          <Tabs
            value={innerTab}
            onChange={(_, v) => setInnerTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              mb: 2,
              '& .MuiTab-root': { textTransform: 'none', fontSize: '0.75rem', minHeight: 32, py: 0.5 },
              '& .Mui-selected': { color: '#1976D2' },
              '& .MuiTabs-indicator': { backgroundColor: '#1976D2', height: 2 },
            }}
          >
            {INNER_TABS.map((t) => <Tab key={t} label={t} />)}
          </Tabs>
          <ReactECharts option={getChartOption()} style={{ height: 350 }} />
        </Box>
      )}

      {/* Tabular Data Report View */}
      {subTab === 1 && stats && (
        <Box>
          <AccordionSection title="School" defaultExpanded>
            <DataRow label="Total Schools" value={stats.school.totalSchools} />
            <Typography variant="caption" fontWeight={600} sx={{ mt: 1, display: 'block' }}>School Category</Typography>
            {Object.entries(stats.school.schoolCategory).map(([k, v]) => (
              <DataRow key={k} label={CATEGORY_LABELS[k] || k} value={v} />
            ))}
            <Typography variant="caption" fontWeight={600} sx={{ mt: 1, display: 'block' }}>School Management</Typography>
            {Object.entries(stats.school.schoolManagement).map(([k, v]) => (
              <DataRow key={k} label={MANAGEMENT_LABELS[k] || (k === 'cwsnEnrollments' ? 'CWSN Enrollments' : k)} value={v} />
            ))}
            <Typography variant="caption" fontWeight={600} sx={{ mt: 1, display: 'block' }}>School Type</Typography>
            {Object.entries(stats.school.schoolType).map(([k, v]) => (
              <DataRow key={k} label={TYPE_LABELS[k] || k} value={v} />
            ))}
          </AccordionSection>

          <AccordionSection title="Physical Infrastructures">
            {Object.entries(stats.physicalInfrastructures).map(([k, v]) => (
              <DataRow key={k} label={k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())} value={v} />
            ))}
          </AccordionSection>

          <AccordionSection title="Digital Infrastructures">
            {Object.entries(stats.digitalInfrastructures).map(([k, v]) => (
              <DataRow key={k} label={k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())} value={v} />
            ))}
          </AccordionSection>

          <AccordionSection title="Laboratories">
            {Object.entries(stats.laboratories).map(([k, v]) => (
              <DataRow key={k} label={k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())} value={v} />
            ))}
          </AccordionSection>

          <AccordionSection title="Teachers">
            {Object.entries(stats.teachers).map(([k, v]) => (
              <DataRow key={k} label={k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())} value={v} />
            ))}
          </AccordionSection>

          <AccordionSection title="Students">
            {Object.entries(stats.students).map(([k, v]) => (
              <DataRow key={k} label={k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())} value={v} />
            ))}
          </AccordionSection>

          <AccordionSection title="Enrollment by Streams">
            {Object.entries(stats.enrollmentByStreams).map(([k, v]) => (
              <DataRow key={k} label={k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())} value={v} />
            ))}
          </AccordionSection>

          <AccordionSection title="PTR">
            {Object.entries(stats.ptr).map(([k, v]) => (
              <DataRow key={k} label={k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).replace('Ptr', 'PTR')} value={v} />
            ))}
          </AccordionSection>
        </Box>
      )}
    </Box>
  );
}
