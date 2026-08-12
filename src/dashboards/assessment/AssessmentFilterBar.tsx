import { useState } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

const ACADEMIC_YEARS = ['2025-2026', '2024-2025', '2023-2024'];
const ASSESSMENT_TYPES = ['All Programs', 'Summative', 'Formative', 'Baseline'];
const STATES = ['All States / UTs', 'Andhra Pradesh', 'Bihar', 'Gujarat', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Rajasthan', 'Tamil Nadu', 'Uttar Pradesh'];
const DISTRICTS = ['All Districts'];

export interface AssessmentFilters {
  state: string;
  district: string;
  academicYear: string;
  assessmentType: string;
}

interface Props {
  onFilterChange?: (filters: AssessmentFilters) => void;
}

export default function AssessmentFilterBar({ onFilterChange }: Props) {
  const [state, setState] = useState('All States / UTs');
  const [district, setDistrict] = useState('All Districts');
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [assessmentType, setAssessmentType] = useState('All Programs');

  const handleChange = (field: string, value: string) => {
    const updated = { state, district, academicYear, assessmentType, [field]: value };
    if (field === 'state') { setState(value); updated.state = value; }
    if (field === 'district') { setDistrict(value); updated.district = value; }
    if (field === 'academicYear') { setAcademicYear(value); updated.academicYear = value; }
    if (field === 'assessmentType') { setAssessmentType(value); updated.assessmentType = value; }
    onFilterChange?.(updated);
  };

  const handleReset = () => {
    setState('All States / UTs');
    setDistrict('All Districts');
    setAcademicYear('2025-2026');
    setAssessmentType('All Programs');
    onFilterChange?.({ state: 'All States / UTs', district: 'All Districts', academicYear: '2025-2026', assessmentType: 'All Programs' });
  };

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1.5, px: 0, py: 1.5, mb: 2,
      borderBottom: '2px solid #1E3A8A', flexWrap: 'wrap',
    }}>
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>STATE/UT</InputLabel>
        <Select value={state} label="STATE/UT" onChange={(e) => handleChange('state', e.target.value)}>
          {STATES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel>DISTRICT</InputLabel>
        <Select value={district} label="DISTRICT" onChange={(e) => handleChange('district', e.target.value)}>
          {DISTRICTS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>ACADEMIC YEAR</InputLabel>
        <Select value={academicYear} label="ACADEMIC YEAR" onChange={(e) => handleChange('academicYear', e.target.value)}>
          {ACADEMIC_YEARS.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>ASSESSMENT TYPE</InputLabel>
        <Select value={assessmentType} label="ASSESSMENT TYPE" onChange={(e) => handleChange('assessmentType', e.target.value)}>
          {ASSESSMENT_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
        </Select>
      </FormControl>

      <Button size="small" startIcon={<RestartAltIcon />} onClick={handleReset}
        sx={{ ml: 'auto', textTransform: 'none', color: '#1E3A8A' }}>
        Reset
      </Button>
    </Box>
  );
}
