import { useState, useEffect } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box, TextField, Select, MenuItem, Button, FormControl, InputLabel,
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import apiClient from '../../../services/apiClient';
import { RootState } from '../../../store';

/**
 * Shared filter state for all attendance sub-pages.
 */
export interface AttendanceFilterContext {
  selectedDate: string;
  selectedStateId: number | '';
  selectedDistrictId: string;
  selectedBlockId: string;
  selectedClusterId: string;
  selectedSchoolId: string;
}

export function useAttendanceFilters() {
  return useOutletContext<AttendanceFilterContext>();
}

export default function AttendanceLayout() {
  const user = useSelector((state: RootState) => state.auth.user);

  // Determine role-based scope
  const userRole = user?.role || '';
  const userStateCode = user?.stateCode || '';
  const userDistrictCode = (user as any)?.districtCode || '';

  // National roles see all filters
  const isNational = ['Super_Admin', 'RVSK_Admin', 'Ministry_Admin'].includes(userRole);
  const isStateUser = userRole === 'State_Admin' && !!userStateCode;
  const isDistrictUser = userRole === 'District_Admin' && !!userDistrictCode;
  const isBlockUser = userRole === 'Block_Admin';

  // Determine which filters are visible
  const showStateFilter = isNational;
  const showDistrictFilter = isNational || isStateUser;
  const showBlockFilter = isNational || isStateUser || isDistrictUser;

  // Initialize with locked values based on scope
  const [selectedDate, setSelectedDate] = useState<string>('2024-05-04');
  const [selectedStateId, setSelectedStateId] = useState<number | ''>(
    isStateUser || isDistrictUser || isBlockUser ? (userStateCode as any) : ''
  );
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>(
    isDistrictUser || isBlockUser ? userDistrictCode : ''
  );
  const [selectedBlockId, setSelectedBlockId] = useState<string>('');
  const [selectedClusterId, setSelectedClusterId] = useState<string>('');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');

  const [states, setStates] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [clusters, setClusters] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);

  // Fetch states on mount (only for national users)
  useEffect(() => {
    if (showStateFilter) {
      apiClient.get('/attendance/filters/states')
        .then(res => setStates(res.data.data || []))
        .catch(() => {});
    }
  }, [showStateFilter]);

  // Auto-load districts for state-scoped users on mount
  useEffect(() => {
    const stateId = selectedStateId || userStateCode;
    if (stateId) {
      apiClient.get(`/attendance/filters/districts?stateId=${stateId}`)
        .then(res => setDistricts(res.data.data || []))
        .catch(() => setDistricts([]));
    } else { setDistricts([]); }
    if (!isDistrictUser) { setSelectedDistrictId(''); }
    setBlocks([]); setClusters([]); setSchools([]);
  }, [selectedStateId]);

  // Cascade: blocks when district changes
  useEffect(() => {
    const districtId = selectedDistrictId || userDistrictCode;
    if (districtId) {
      apiClient.get(`/attendance/filters/blocks?districtId=${districtId}`)
        .then(res => setBlocks(res.data.data || []))
        .catch(() => setBlocks([]));
    } else { setBlocks([]); }
    setSelectedBlockId(''); setClusters([]); setSchools([]);
  }, [selectedDistrictId]);

  // Cascade: clusters when block changes
  useEffect(() => {
    if (selectedBlockId) {
      apiClient.get(`/attendance/filters/clusters?blockId=${selectedBlockId}`)
        .then(res => setClusters(res.data.data || []))
        .catch(() => setClusters([]));
    } else { setClusters([]); }
    setSelectedClusterId(''); setSchools([]);
  }, [selectedBlockId]);

  // Cascade: schools when cluster changes
  useEffect(() => {
    if (selectedClusterId) {
      apiClient.get(`/attendance/filters/schools?clusterId=${selectedClusterId}`)
        .then(res => setSchools(res.data.data || []))
        .catch(() => setSchools([]));
    } else { setSchools([]); }
    setSelectedSchoolId('');
  }, [selectedClusterId]);

  // Reset only resets filters BELOW the user's locked level
  const handleReset = () => {
    setSelectedDate('2024-05-04');
    if (isNational) {
      setSelectedStateId('');
      setSelectedDistrictId('');
    } else if (isStateUser) {
      setSelectedDistrictId('');
    }
    // District user keeps both state + district locked
    setSelectedBlockId('');
    setSelectedClusterId('');
    setSelectedSchoolId('');
    setBlocks([]); setClusters([]); setSchools([]);
  };

  // The filter context passed to child routes uses effective values (locked or selected)
  const filterContext: AttendanceFilterContext = {
    selectedDate,
    selectedStateId: selectedStateId || (userStateCode as any) || '',
    selectedDistrictId: selectedDistrictId || userDistrictCode || '',
    selectedBlockId,
    selectedClusterId,
    selectedSchoolId,
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Filter Bar */}
      <Box sx={{
        bgcolor: '#fff',
        borderBottom: '1px solid #E5E7EB',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 1,
        overflowX: 'auto',
        flexShrink: 0,
      }}>
        <TextField type="date" size="small" label="Date" value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          InputLabelProps={{ shrink: true }} sx={{ minWidth: 140 }} />

        {/* State Filter — hidden for State/District/Block users */}
        {showStateFilter && (
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>State/UT</InputLabel>
            <Select value={selectedStateId} label="State/UT" onChange={(e) => setSelectedStateId(e.target.value as number | '')}>
              <MenuItem value="">All States</MenuItem>
              {states.map((s: any, idx: number) => <MenuItem key={`state_${idx}_${s.STATE_ID}`} value={s.STATE_ID}>{s.STATE_NAME}</MenuItem>)}
            </Select>
          </FormControl>
        )}

        {/* District Filter — hidden for District/Block users */}
        {showDistrictFilter && (
          <FormControl size="small" sx={{ minWidth: 110 }}>
            <InputLabel>District</InputLabel>
            <Select value={selectedDistrictId} label="District" onChange={(e) => setSelectedDistrictId(e.target.value as string)}>
              <MenuItem value="">All Districts</MenuItem>
              {districts.map((d: any, idx: number) => <MenuItem key={`district_${idx}_${d.DISTRICT_ID}`} value={d.DISTRICT_ID}>{d.DISTRICT_NAME}</MenuItem>)}
            </Select>
          </FormControl>
        )}

        {/* Block Filter — hidden for Block users */}
        {showBlockFilter && (
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Block</InputLabel>
            <Select value={selectedBlockId} label="Block" onChange={(e) => setSelectedBlockId(e.target.value as string)}>
              <MenuItem value="">All Blocks</MenuItem>
              {blocks.map((b: any, idx: number) => <MenuItem key={`block_${idx}_${b.BLOCK_ID}`} value={b.BLOCK_ID}>{b.BLOCK_NAME}</MenuItem>)}
            </Select>
          </FormControl>
        )}

        {/* Cluster Filter — always visible */}
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel>Cluster</InputLabel>
          <Select value={selectedClusterId} label="Cluster" onChange={(e) => setSelectedClusterId(e.target.value as string)}>
            <MenuItem value="">All Clusters</MenuItem>
            {clusters.map((c: any, idx: number) => <MenuItem key={`cluster_${idx}_${c.CLUSTER_ID}`} value={c.CLUSTER_ID}>{c.CLUSTER_NAME}</MenuItem>)}
          </Select>
        </FormControl>

        {/* School Filter — always visible */}
        <FormControl size="small" sx={{ minWidth: 110 }}>
          <InputLabel>School</InputLabel>
          <Select value={selectedSchoolId} label="School" onChange={(e) => setSelectedSchoolId(e.target.value as string)}>
            <MenuItem value="">All Schools</MenuItem>
            {schools.map((school: any, idx: number) => <MenuItem key={`school_${idx}_${school.SCHOOL_ID}`} value={school.SCHOOL_ID}>{school.SCHOOL_NAME}</MenuItem>)}
          </Select>
        </FormControl>

        <Button variant="contained" size="small" startIcon={<RestartAltIcon />} onClick={handleReset}
          sx={{ bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' }, textTransform: 'none', fontWeight: 600, ml: 'auto' }}>
          RESET
        </Button>
      </Box>

      {/* Content Area */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3, bgcolor: '#F8FAFC' }}>
        <Outlet context={filterContext} />
      </Box>
    </Box>
  );
}
