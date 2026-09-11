import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { accreditationApi } from '../api';

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface FilterState {
  academicYear: string;
  stateCode: string;
}

interface AcademicYear {
  academic_year: string;
  is_current: boolean;
}

interface StateOption {
  state_code: string;
  state_name: string;
}

interface FilterBarProps {
  /** Called whenever the user changes a filter value */
  onFilterChange: (filters: FilterState) => void;
}

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const FILTER_HEIGHT = 52;

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function FilterBar({ onFilterChange }: FilterBarProps) {
  // Dropdown options
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [states, setStates] = useState<StateOption[]>([]);

  // Selected values
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('ALL');

  // Loading states
  const [loadingYears, setLoadingYears] = useState(true);
  const [loadingStates, setLoadingStates] = useState(true);

  // Error states
  const [errorYears, setErrorYears] = useState<string | null>(null);
  const [errorStates, setErrorStates] = useState<string | null>(null);

  // ─── FETCH ACADEMIC YEARS ────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function fetchYears() {
      setLoadingYears(true);
      setErrorYears(null);
      try {
        const response = await accreditationApi.getMetaYears();
        const data: AcademicYear[] = response.data?.data ?? response.data ?? [];
        if (!cancelled) {
          setAcademicYears(data);
          // Default to the current active year
          const currentYear = data.find((y) => y.is_current);
          const defaultYear = currentYear?.academic_year ?? (data.length > 0 ? data[0].academic_year : '');
          setSelectedYear(defaultYear);
        }
      } catch (err) {
        if (!cancelled) {
          setErrorYears('Failed to load academic years');
          console.error('FilterBar: Error fetching academic years', err);
        }
      } finally {
        if (!cancelled) setLoadingYears(false);
      }
    }

    fetchYears();
    return () => { cancelled = true; };
  }, []);

  // ─── FETCH STATES ────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function fetchStates() {
      setLoadingStates(true);
      setErrorStates(null);
      try {
        const response = await accreditationApi.getMetaStates();
        const data: StateOption[] = response.data?.data ?? response.data ?? [];
        if (!cancelled) {
          setStates(data);
        }
      } catch (err) {
        if (!cancelled) {
          setErrorStates('Failed to load states');
          console.error('FilterBar: Error fetching states', err);
        }
      } finally {
        if (!cancelled) setLoadingStates(false);
      }
    }

    fetchStates();
    return () => { cancelled = true; };
  }, []);

  // ─── EMIT FILTER CHANGES ────────────────────────────────────────────────
  const emitFilterChange = useCallback(
    (year: string, state: string) => {
      if (year) {
        onFilterChange({ academicYear: year, stateCode: state });
      }
    },
    [onFilterChange]
  );

  // Emit initial filters once years are loaded
  useEffect(() => {
    if (!loadingYears && selectedYear) {
      emitFilterChange(selectedYear, selectedState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingYears]);

  // ─── HANDLERS ────────────────────────────────────────────────────────────
  const handleYearChange = (event: SelectChangeEvent<string>) => {
    const newYear = event.target.value;
    setSelectedYear(newYear);
    emitFilterChange(newYear, selectedState);
  };

  const handleStateChange = (event: SelectChangeEvent<string>) => {
    const newState = event.target.value;
    setSelectedState(newState);
    emitFilterChange(selectedYear, newState);
  };

  // ─── RENDER ──────────────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        height: FILTER_HEIGHT,
        bgcolor: '#fff',
        borderBottom: '1px solid #E5E7EB',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 2,
      }}
    >
      {/* Academic Year Dropdown */}
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel id="filter-academic-year-label">Academic Year</InputLabel>
        <Select
          labelId="filter-academic-year-label"
          id="filter-academic-year"
          value={selectedYear}
          label="Academic Year"
          onChange={handleYearChange}
          disabled={loadingYears}
          endAdornment={loadingYears ? <CircularProgress size={16} sx={{ mr: 2 }} /> : undefined}
        >
          {academicYears.map((year) => (
            <MenuItem key={year.academic_year} value={year.academic_year}>
              {year.academic_year}
              {year.is_current ? ' (Current)' : ''}
            </MenuItem>
          ))}
        </Select>
        {errorYears && (
          <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
            {errorYears}
          </Typography>
        )}
      </FormControl>

      {/* State/UT Dropdown */}
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel id="filter-state-label">State/UT</InputLabel>
        <Select
          labelId="filter-state-label"
          id="filter-state"
          value={selectedState}
          label="State/UT"
          onChange={handleStateChange}
          disabled={loadingStates}
          endAdornment={loadingStates ? <CircularProgress size={16} sx={{ mr: 2 }} /> : undefined}
        >
          <MenuItem value="ALL">All States/UTs</MenuItem>
          {states.map((s) => (
            <MenuItem key={s.state_code} value={s.state_code}>
              {s.state_name}
            </MenuItem>
          ))}
        </Select>
        {errorStates && (
          <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
            {errorStates}
          </Typography>
        )}
      </FormControl>
    </Box>
  );
}
