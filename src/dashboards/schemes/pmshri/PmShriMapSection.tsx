import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  FormControl,
  Select,
  MenuItem,
  Button,
  IconButton,
  InputLabel,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import apiClient from '../../../services/apiClient';
import ImplementationStatusTab from './tabs/ImplementationStatusTab';
import StatewiseTab from './tabs/StatewiseTab';
import DistrictwiseTab from './tabs/DistrictwiseTab';
import SchoolwiseTab from './tabs/SchoolwiseTab';

interface PmShriMapSectionProps {
  states: string[];
}

export default function PmShriMapSection({ states }: PmShriMapSectionProps) {
  const [tab, setTab] = useState(0);
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedKpi, setSelectedKpi] = useState<string>('');
  const [districts, setDistricts] = useState<string[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Fetch districts when state changes
  useEffect(() => {
    if (selectedState) {
      setLoadingDistricts(true);
      apiClient
        .get(`/schemes/PM_SHRI/filters/districts?stateName=${encodeURIComponent(selectedState)}`)
        .then((res) => {
          setDistricts(res.data.districts || []);
          setLoadingDistricts(false);
        })
        .catch(() => setLoadingDistricts(false));
    } else {
      setDistricts([]);
      setSelectedDistrict('');
    }
  }, [selectedState]);

  const handleReset = useCallback(() => {
    setSelectedState('');
    setSelectedDistrict('');
    setSelectedCategory('');
    setSelectedKpi('');
  }, []);

  const categories = ['KVS', 'NVS', 'State Govt', 'All'];
  const kpiOptions = ['Total Schools', 'Total Students', 'Total Teachers', 'CWSN Enrollment'];

  return (
    <Box
      sx={{
        mt: 4,
        border: '1px solid #E2E8F0',
        borderTop: '3px solid #2563EB',
        borderRadius: '16px',
        p: 3,
        bgcolor: '#FFFFFF',
        boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
      }}
    >
      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          mb: 2,
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            minHeight: 40,
            borderRadius: '6px 6px 0 0',
            transition: 'background-color 0.2s ease',
          },
          '& .Mui-selected': {
            color: '#1A4F99',
            bgcolor: '#EFF6FF',
            fontWeight: 700,
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#FF9933',
            height: 3,
            borderRadius: '3px 3px 0 0',
          },
        }}
      >
        <Tab label="Implementation Status" />
        <Tab label="State wise performance" />
        <Tab label="District wise performance" />
        <Tab label="School wise performance" />
      </Tabs>

      {/* Filter Row */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 3,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {/* State Dropdown */}
        <FormControl size="small" sx={{ minWidth: 180, '& .MuiOutlinedInput-root': { boxShadow: '0 1px 2px rgba(0,0,0,0.04)' } }}>
          <InputLabel>State</InputLabel>
          <Select
            value={selectedState}
            label="State"
            onChange={(e) => {
              setSelectedState(e.target.value);
              setSelectedDistrict('');
            }}
            endAdornment={
              selectedState ? (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedState('');
                    setSelectedDistrict('');
                  }}
                  sx={{ mr: 1.5 }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              ) : undefined
            }
          >
            {states.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* District Dropdown */}
        <FormControl size="small" sx={{ minWidth: 180, '& .MuiOutlinedInput-root': { boxShadow: '0 1px 2px rgba(0,0,0,0.04)' } }}>
          <InputLabel>District</InputLabel>
          <Select
            value={selectedDistrict}
            label="District"
            onChange={(e) => setSelectedDistrict(e.target.value)}
            disabled={!selectedState || loadingDistricts}
            endAdornment={
              selectedDistrict ? (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDistrict('');
                  }}
                  sx={{ mr: 1.5 }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              ) : undefined
            }
          >
            {districts.map((d) => (
              <MenuItem key={d} value={d}>
                {d}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Category Dropdown */}
        <FormControl size="small" sx={{ minWidth: 140, '& .MuiOutlinedInput-root': { boxShadow: '0 1px 2px rgba(0,0,0,0.04)' } }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategory}
            label="Category"
            onChange={(e) => setSelectedCategory(e.target.value)}
            endAdornment={
              selectedCategory ? (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCategory('');
                  }}
                  sx={{ mr: 1.5 }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              ) : undefined
            }
          >
            {categories.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* KPI Dropdown */}
        <FormControl size="small" sx={{ minWidth: 160, '& .MuiOutlinedInput-root': { boxShadow: '0 1px 2px rgba(0,0,0,0.04)' } }}>
          <InputLabel>KPI</InputLabel>
          <Select
            value={selectedKpi}
            label="KPI"
            onChange={(e) => setSelectedKpi(e.target.value)}
            endAdornment={
              selectedKpi ? (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedKpi('');
                  }}
                  sx={{ mr: 1.5 }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              ) : undefined
            }
          >
            {kpiOptions.map((k) => (
              <MenuItem key={k} value={k}>
                {k}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Reset Button */}
        <Button
          variant="contained"
          onClick={handleReset}
          sx={{
            bgcolor: '#1A4F99',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            '&:hover': { bgcolor: '#0D2B5B' },
          }}
        >
          Reset
        </Button>
      </Box>

      {/* Tab Content */}
      {tab === 0 && (
        <ImplementationStatusTab
          selectedState={selectedState}
          states={states}
        />
      )}
      {tab === 1 && (
        <StatewiseTab selectedState={selectedState} />
      )}
      {tab === 2 && (
        <DistrictwiseTab
          selectedState={selectedState}
          selectedDistrict={selectedDistrict}
        />
      )}
      {tab === 3 && (
        <SchoolwiseTab
          selectedState={selectedState}
          selectedDistrict={selectedDistrict}
        />
      )}

      {/* Last Updated */}
      <Box sx={{ mt: 2, textAlign: 'right' }}>
        <Typography variant="caption" color="text.secondary">
          Last Updated date : 08-MAY-2025
        </Typography>
      </Box>
    </Box>
  );
}
