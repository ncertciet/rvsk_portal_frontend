import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  CircularProgress,
  Alert,
  IconButton,
  Collapse,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import apiClient from '../../../../services/apiClient';

interface SchoolDetailData {
  udiseCode: number;
  schoolName: string;
  districtName: string;
  blockName: string;
  stateName: string;
  totalStudents: number;
  totalTeachers: number;
  totalCwsn: number;
  classrooms: number;
  smartClassrooms: number;
  hasLibrary: boolean;
  hasInternet: boolean;
  hasPlayground: boolean;
}

interface SchoolwiseTabProps {
  selectedState: string;
  selectedDistrict: string;
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

function DataRow({ label, value }: { label: string; value: number | string | boolean }) {
  let formatted: string;
  if (typeof value === 'boolean') formatted = value ? 'Yes' : 'No';
  else if (typeof value === 'number') formatted = value.toLocaleString('en-IN');
  else formatted = value;
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, borderBottom: '1px solid #f0f0f0' }}>
      <Typography variant="body2">{label}</Typography>
      <Typography variant="body2" fontWeight={600}>{formatted}</Typography>
    </Box>
  );
}

export default function SchoolwiseTab({ selectedState, selectedDistrict }: SchoolwiseTabProps) {
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [schools, setSchools] = useState<string[]>([]);
  const [localState, setLocalState] = useState(selectedState || '');
  const [localDistrict, setLocalDistrict] = useState(selectedDistrict || '');
  const [localSchool, setLocalSchool] = useState('');
  const [schoolData, setSchoolData] = useState<SchoolDetailData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiClient.get('/schemes/PM_SHRI/filters').then((res) => {
      setStates(res.data.states || []);
    });
  }, []);

  useEffect(() => { setLocalState(selectedState || ''); }, [selectedState]);
  useEffect(() => { setLocalDistrict(selectedDistrict || ''); }, [selectedDistrict]);

  useEffect(() => {
    if (localState) {
      apiClient.get(`/schemes/PM_SHRI/filters/districts?stateName=${encodeURIComponent(localState)}`).then((res) => {
        setDistricts(res.data.districts || []);
      });
    } else {
      setDistricts([]);
      setLocalDistrict('');
      setSchools([]);
      setLocalSchool('');
    }
  }, [localState]);

  useEffect(() => {
    if (localState && localDistrict) {
      apiClient.get(`/schemes/PM_SHRI/filters/schools?stateName=${encodeURIComponent(localState)}&districtName=${encodeURIComponent(localDistrict)}`).then((res) => {
        setSchools(res.data.schools || []);
      });
    } else {
      setSchools([]);
      setLocalSchool('');
    }
  }, [localState, localDistrict]);

  useEffect(() => {
    if (!localSchool || !localState || !localDistrict) {
      setSchoolData(null);
      return;
    }
    setLoading(true);
    const params = new URLSearchParams();
    params.append('stateName', localState);
    params.append('districtName', localDistrict);
    apiClient
      .get(`/schemes/PM_SHRI/schoolwise?${params.toString()}`)
      .then((res) => {
        const allSchools: SchoolDetailData[] = res.data || [];
        const found = allSchools.find((s) => s.schoolName === localSchool) || null;
        setSchoolData(found);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [localSchool, localState, localDistrict]);

  const handleDownload = () => {
    const params = new URLSearchParams();
    if (localState) params.append('stateName', localState);
    if (localDistrict) params.append('districtName', localDistrict);
    window.open(`/api/v1/schemes/PM_SHRI/schoolwise?${params.toString()}`, '_blank');
  };

  return (
    <Box>
      {/* Filter Dropdowns */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>State Name</InputLabel>
          <Select value={localState} label="State Name" onChange={(e) => { setLocalState(e.target.value); setLocalDistrict(''); setLocalSchool(''); }}>
            {states.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>District Name</InputLabel>
          <Select value={localDistrict} label="District Name" onChange={(e) => { setLocalDistrict(e.target.value); setLocalSchool(''); }} disabled={!localState}>
            {districts.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 250 }}>
          <InputLabel>School Name</InputLabel>
          <Select value={localSchool} label="School Name" onChange={(e) => setLocalSchool(e.target.value)} disabled={!localDistrict}>
            {schools.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
        <IconButton
          onClick={handleDownload}
          title="Download Report"
          sx={{ bgcolor: '#1976D2', color: '#fff', '&:hover': { bgcolor: '#1565C0' } }}
        >
          <DownloadIcon />
        </IconButton>
      </Box>

      {!localState && (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Please select a state, district, and school to view school-wise performance.
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      )}

      {!loading && localSchool && schoolData && (
        <Box>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
            {schoolData.schoolName}
          </Typography>

          <AccordionSection title="School Information" defaultExpanded>
            <DataRow label="UDISE Code" value={schoolData.udiseCode} />
            <DataRow label="School Name" value={schoolData.schoolName} />
            <DataRow label="State" value={schoolData.stateName} />
            <DataRow label="District" value={schoolData.districtName} />
            <DataRow label="Block" value={schoolData.blockName || 'N/A'} />
          </AccordionSection>

          <AccordionSection title="Students" defaultExpanded>
            <DataRow label="Total Students" value={schoolData.totalStudents} />
            <DataRow label="CWSN Students" value={schoolData.totalCwsn} />
          </AccordionSection>

          <AccordionSection title="Teachers">
            <DataRow label="Total Teachers" value={schoolData.totalTeachers} />
          </AccordionSection>

          <AccordionSection title="Infrastructure">
            <DataRow label="Classrooms" value={schoolData.classrooms} />
            <DataRow label="Smart Classrooms" value={schoolData.smartClassrooms} />
            <DataRow label="Library" value={schoolData.hasLibrary} />
            <DataRow label="Internet" value={schoolData.hasInternet} />
            <DataRow label="Playground" value={schoolData.hasPlayground} />
          </AccordionSection>
        </Box>
      )}

      {!loading && localSchool && !schoolData && (
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          No data found for the selected school.
        </Alert>
      )}

      {/* Last Updated */}
      <Box sx={{ mt: 3, textAlign: 'right' }}>
        <Typography variant="caption" color="text.secondary">
          Last Updated date : 08-MAY-2025
        </Typography>
      </Box>
    </Box>
  );
}
