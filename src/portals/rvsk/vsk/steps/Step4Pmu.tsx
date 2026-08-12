import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Typography, TextField, Grid, Card, CardContent, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, MenuItem, Select, FormControl, InputLabel,
  Tooltip, Alert, CircularProgress, Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupsIcon from '@mui/icons-material/Groups';
import SaveIcon from '@mui/icons-material/Save';

import {
  fetchPmu,
  savePmu,
  VskPmuDto,
  PmuRoleDto,
  saveAndNext,
} from '../vskApi';

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLE_NAME_OPTIONS = [
  'Project Manager',
  'Developer',
  'System Administrator',
  'Data Analyst',
  'Technical Support',
  'Trainer',
  'Other',
];

const PMU_TEAM_TYPE_OPTIONS = ['In-house', 'Outsourced', 'Hybrid'];

// ─── Types ────────────────────────────────────────────────────────────────────

interface PmuRoleRow {
  localId: number;
  id?: string;
  roleName: string;
  customRoleName: string;
  noOfMembers: number | '';
}

interface Step4PmuProps {
  stateCode: string;
  isReadOnly?: boolean;
  onStepComplete?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Step4Pmu({ stateCode, isReadOnly = false, onStepComplete }: Step4PmuProps) {
  // Header fields
  const [pmuTeamType, setPmuTeamType] = useState<string>('');
  const [totalTeamMembers, setTotalTeamMembers] = useState<number | ''>('');

  // Role rows
  const [roleRows, setRoleRows] = useState<PmuRoleRow[]>([]);
  const [nextLocalId, setNextLocalId] = useState<number>(1);

  // State management
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [isCreate, setIsCreate] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // ─── Cross-validation: running sum of all role members ────────────────────

  const membersSum = useMemo(() => {
    return roleRows.reduce((sum, row) => {
      const val = typeof row.noOfMembers === 'number' ? row.noOfMembers : 0;
      return sum + val;
    }, 0);
  }, [roleRows]);

  const totalNum = typeof totalTeamMembers === 'number' ? totalTeamMembers : 0;
  const hasMismatch = roleRows.length > 0 && totalNum > 0 && membersSum !== totalNum;

  // ─── Load existing data on mount ──────────────────────────────────────────

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data: VskPmuDto | null = await fetchPmu();
      if (data) {
        setIsCreate(false);
        setPmuTeamType(data.pmuTeamType ?? '');
        setTotalTeamMembers(data.totalTeamMembers ?? '');

        const roles: PmuRoleRow[] = (data.roles ?? []).map((role, idx) => ({
          localId: idx + 1,
          id: role.id,
          roleName: role.roleName ?? '',
          customRoleName: role.customRoleName ?? '',
          noOfMembers: role.noOfMembers ?? '',
        }));
        setRoleRows(roles);
        setNextLocalId(roles.length + 1);
      } else {
        setIsCreate(true);
        setRoleRows([]);
        setNextLocalId(1);
      }
    } catch (err) {
      console.error('Failed to load PMU data:', err);
      setError('Failed to load PMU data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Row management ───────────────────────────────────────────────────────

  const handleAddRow = () => {
    setRoleRows([
      ...roleRows,
      { localId: nextLocalId, roleName: '', customRoleName: '', noOfMembers: '' },
    ]);
    setNextLocalId(nextLocalId + 1);
  };

  const handleRemoveRow = (localId: number) => {
    setRoleRows(roleRows.filter(r => r.localId !== localId));
  };

  const updateRow = (localId: number, field: keyof PmuRoleRow, value: string | number | '') => {
    setRoleRows(roleRows.map(r => {
      if (r.localId !== localId) return r;
      const updated = { ...r, [field]: value };
      // Clear custom role name if role changed away from "Other"
      if (field === 'roleName' && value !== 'Other') {
        updated.customRoleName = '';
      }
      return updated;
    }));
  };

  // ─── Save & Next ──────────────────────────────────────────────────────────

  const handleSave = async () => {
    setError(null);

    // Validation: PMU Team Type is required
    if (!pmuTeamType) {
      setError('PMU Team Type is required.');
      return;
    }

    // Validation: Total Team Members must be a positive integer
    if (!totalTeamMembers || totalTeamMembers <= 0) {
      setError('Total Team Members must be a positive number.');
      return;
    }
    if (!Number.isInteger(totalTeamMembers)) {
      setError('Total Team Members must be a whole number.');
      return;
    }

    // Validation: at least 1 role row required
    if (roleRows.length === 0) {
      setError('At least one role entry is required to proceed.');
      return;
    }

    // Validate each row
    for (let i = 0; i < roleRows.length; i++) {
      const row = roleRows[i];
      if (!row.roleName) {
        setError(`Row ${i + 1}: Role Name is required.`);
        return;
      }
      if (row.roleName === 'Other' && !row.customRoleName.trim()) {
        setError(`Row ${i + 1}: Custom role name is required when "Other" is selected.`);
        return;
      }
      if (row.roleName === 'Other' && row.customRoleName.trim().length < 2) {
        setError(`Row ${i + 1}: Custom role name must be at least 2 characters.`);
        return;
      }
      if (!row.noOfMembers || row.noOfMembers <= 0) {
        setError(`Row ${i + 1}: Number of Members must be a positive number.`);
        return;
      }
      if (typeof row.noOfMembers === 'number' && !Number.isInteger(row.noOfMembers)) {
        setError(`Row ${i + 1}: Number of Members must be a whole number.`);
        return;
      }
    }

    // Cross-validation: sum of members must equal total
    const sum = roleRows.reduce((acc, row) => acc + (typeof row.noOfMembers === 'number' ? row.noOfMembers : 0), 0);
    if (sum !== totalTeamMembers) {
      setError(`Sum of role members (${sum}) must equal Total Team Members (${totalTeamMembers}).`);
      return;
    }

    setSaving(true);
    try {
      const roles: PmuRoleDto[] = roleRows.map(row => ({
        id: row.id,
        roleName: row.roleName,
        customRoleName: row.roleName === 'Other' ? row.customRoleName : undefined,
        noOfMembers: typeof row.noOfMembers === 'number' ? row.noOfMembers : 0,
      }));

      const dto: VskPmuDto = {
        stateCode,
        pmuTeamType: pmuTeamType || undefined,
        totalTeamMembers: typeof totalTeamMembers === 'number' ? totalTeamMembers : undefined,
        roles,
      };

      await savePmu(dto, isCreate);
      setIsCreate(false);
      // Mark step 4 as COMPLETE via the wizard API
      await saveAndNext({ step: 4, data: {} });
      setSuccessMsg('PMU details saved successfully.');
      onStepComplete?.();
    } catch (err) {
      console.error('Failed to save PMU data:', err);
      setError('Failed to save PMU details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ─── Loading state ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress size={40} sx={{ color: '#7C3AED' }} />
        <Typography sx={{ ml: 2 }} color="text.secondary">Loading PMU details...</Typography>
      </Box>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 3, color: '#1E293B' }}>
        <GroupsIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#7C3AED' }} />
        PMU (Project Management Unit) Details
      </Typography>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Read-only banner */}
      {isReadOnly && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
          This form has been submitted and is now read-only.
        </Alert>
      )}

      {/* Header Section */}
      <Card sx={{ mb: 3, borderRadius: 2, border: '1px solid #E2E8F0' }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" disabled={isReadOnly}>
                <InputLabel>PMU Team Type</InputLabel>
                <Select
                  value={pmuTeamType}
                  label="PMU Team Type"
                  onChange={e => setPmuTeamType(e.target.value)}
                >
                  {PMU_TEAM_TYPE_OPTIONS.map(opt => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Total Team Members"
                type="number"
                value={totalTeamMembers}
                onChange={e => {
                  const val = e.target.value;
                  setTotalTeamMembers(val === '' ? '' : parseInt(val, 10));
                }}
                disabled={isReadOnly}
                inputProps={{ min: 1 }}
                error={totalTeamMembers !== '' && (totalTeamMembers <= 0 || !Number.isInteger(totalTeamMembers))}
                helperText={
                  totalTeamMembers !== '' && totalTeamMembers <= 0
                    ? 'Must be a positive integer (≥ 1)'
                    : undefined
                }
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Cross-Validation Indicator */}
      {(roleRows.length > 0 || totalNum > 0) && (
        <Box
          sx={{
            mb: 2,
            p: 1.5,
            borderRadius: 2,
            border: hasMismatch ? '1px solid #EF4444' : '1px solid #10B981',
            bgcolor: hasMismatch ? '#FEF2F2' : '#F0FDF4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="body1"
            fontWeight={600}
            sx={{ color: hasMismatch ? '#DC2626' : '#059669' }}
          >
            Members assigned: {membersSum} / Total: {totalNum || '—'}
            {hasMismatch && ' ⚠ Mismatch — totals must be equal'}
          </Typography>
        </Box>
      )}

      {/* Dynamic Role Structure Table */}
      <Card sx={{ mb: 3, borderRadius: 2, border: '1px solid #E2E8F0' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>Role Structure</Typography>
            {!isReadOnly && (
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddRow}
                sx={{ textTransform: 'none', bgcolor: '#7C3AED', '&:hover': { bgcolor: '#6D28D9' } }}
              >
                Add Role
              </Button>
            )}
          </Box>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 600, width: '5%' }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: '30%' }}>Role Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: '25%' }}>Custom Role Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: '20%' }}>No. of Members</TableCell>
                  {!isReadOnly && (
                    <TableCell sx={{ fontWeight: 600, width: '20%' }} align="center">Actions</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {roleRows.map((row, index) => (
                  <TableRow key={row.localId} hover>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{index + 1}</Typography>
                    </TableCell>
                    <TableCell>
                      {isReadOnly ? (
                        <Typography variant="body2">{row.roleName || '—'}</Typography>
                      ) : (
                        <FormControl fullWidth size="small">
                          <Select
                            value={row.roleName}
                            displayEmpty
                            onChange={e => updateRow(row.localId, 'roleName', e.target.value)}
                          >
                            <MenuItem value="" disabled>Select role</MenuItem>
                            {ROLE_NAME_OPTIONS.map(opt => (
                              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    </TableCell>
                    <TableCell>
                      {row.roleName === 'Other' ? (
                        isReadOnly ? (
                          <Typography variant="body2">{row.customRoleName || '—'}</Typography>
                        ) : (
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="Enter role name"
                            value={row.customRoleName}
                            onChange={e => updateRow(row.localId, 'customRoleName', e.target.value)}
                          />
                        )
                      ) : (
                        <Typography variant="body2" color="text.secondary">—</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {isReadOnly ? (
                        <Typography variant="body2">{row.noOfMembers || '—'}</Typography>
                      ) : (
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          placeholder="0"
                          value={row.noOfMembers}
                          onChange={e => {
                            const val = e.target.value;
                            updateRow(row.localId, 'noOfMembers', val === '' ? '' : parseInt(val, 10));
                          }}
                          inputProps={{ min: 1 }}
                          error={row.noOfMembers !== '' && typeof row.noOfMembers === 'number' && row.noOfMembers <= 0}
                          helperText={
                            row.noOfMembers !== '' && typeof row.noOfMembers === 'number' && row.noOfMembers <= 0
                              ? 'Must be ≥ 1'
                              : undefined
                          }
                        />
                      )}
                    </TableCell>
                    {!isReadOnly && (
                      <TableCell align="center">
                        <Tooltip title="Remove">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveRow(row.localId)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {roleRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={isReadOnly ? 4 : 5} align="center" sx={{ py: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        No role entries added. Click "Add Role" to begin.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Save Button */}
      {!isReadOnly && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
            onClick={handleSave}
            disabled={saving}
            sx={{
              textTransform: 'none',
              bgcolor: '#7C3AED',
              '&:hover': { bgcolor: '#6D28D9' },
              px: 4,
              py: 1,
            }}
          >
            {saving ? 'Saving...' : 'Save & Next'}
          </Button>
        </Box>
      )}

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMsg}
        autoHideDuration={4000}
        onClose={() => setSuccessMsg(null)}
        message={successMsg}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
