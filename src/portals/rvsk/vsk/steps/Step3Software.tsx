import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, TextField, Grid, Card, CardContent, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, MenuItem, Select, FormControl, InputLabel,
  Radio, RadioGroup, FormControlLabel, FormLabel, Tooltip,
  Alert, CircularProgress, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ComputerIcon from '@mui/icons-material/Computer';
import SaveIcon from '@mui/icons-material/Save';

import {
  fetchSoftware,
  saveSoftware,
  VskSoftwareDto,
  SoftwareItemDto,
  saveAndNext,
} from '../vskApi';

// ─── Constants ────────────────────────────────────────────────────────────────

const SOFTWARE_NAME_OPTIONS = [
  'DIKSHA',
  'e-Pathshala',
  'SWAYAM',
  'National Digital Library',
  'Virtual Labs',
  'Other',
];

const SOFTWARE_TYPE_OPTIONS = ['License', 'Unlicensed'];
const SERVER_TYPE_OPTIONS = ['Central', 'State', 'Cloud', 'Hybrid'];

// ─── Types ────────────────────────────────────────────────────────────────────

interface SoftwareRow {
  localId: number;
  id?: string;
  softwareName: string;
  customSoftwareName: string;
  softwareType: string;
}

interface Step3SoftwareProps {
  stateCode: string;
  isReadOnly?: boolean;
  onStepComplete?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Step3Software({ stateCode, isReadOnly = false, onStepComplete }: Step3SoftwareProps) {
  // Header fields
  const [starterPack, setStarterPack] = useState<string>('Yes');
  const [serverType, setServerType] = useState<string>('');

  // Software items
  const [softwareRows, setSoftwareRows] = useState<SoftwareRow[]>([]);
  const [nextLocalId, setNextLocalId] = useState<number>(1);

  // State management
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [isCreate, setIsCreate] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Confirmation dialog for row removal
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [rowToDelete, setRowToDelete] = useState<number | null>(null);

  // ─── Load existing data on mount ──────────────────────────────────────────

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data: VskSoftwareDto | null = await fetchSoftware();
      if (data) {
        setIsCreate(false);
        setStarterPack(data.starterPack === 1 ? 'Yes' : 'No');
        setServerType(data.serverType ?? '');

        const items: SoftwareRow[] = (data.items ?? []).map((item, idx) => ({
          localId: idx + 1,
          id: item.id,
          softwareName: item.softwareName ?? '',
          customSoftwareName: item.customSoftwareName ?? '',
          softwareType: item.softwareType ?? '',
        }));
        setSoftwareRows(items);
        setNextLocalId(items.length + 1);
      } else {
        setIsCreate(true);
        setSoftwareRows([]);
        setNextLocalId(1);
      }
    } catch (err) {
      console.error('Failed to load software data:', err);
      setError('Failed to load software data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Row management ───────────────────────────────────────────────────────

  const handleAddRow = () => {
    setSoftwareRows([
      ...softwareRows,
      { localId: nextLocalId, softwareName: '', customSoftwareName: '', softwareType: '' },
    ]);
    setNextLocalId(nextLocalId + 1);
  };

  const handleRequestDelete = (localId: number) => {
    setRowToDelete(localId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (rowToDelete !== null) {
      setSoftwareRows(softwareRows.filter(r => r.localId !== rowToDelete));
    }
    setDeleteDialogOpen(false);
    setRowToDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setRowToDelete(null);
  };

  const updateRow = (localId: number, field: keyof SoftwareRow, value: string) => {
    setSoftwareRows(softwareRows.map(r => {
      if (r.localId !== localId) return r;
      const updated = { ...r, [field]: value };
      // Clear custom name if software name changed away from "Other"
      if (field === 'softwareName' && value !== 'Other') {
        updated.customSoftwareName = '';
      }
      return updated;
    }));
  };

  // ─── Save & Next ──────────────────────────────────────────────────────────

  const handleSave = async () => {
    setError(null);

    // Validation: at least 1 software item required
    if (softwareRows.length === 0) {
      setError('At least one software item is required to proceed.');
      return;
    }

    // Check for duplicate software names (excluding "Other")
    const nonOtherNames = softwareRows
      .filter(r => r.softwareName && r.softwareName !== 'Other')
      .map(r => r.softwareName);
    const duplicates = nonOtherNames.filter((name, idx) => nonOtherNames.indexOf(name) !== idx);
    if (duplicates.length > 0) {
      setError(`Duplicate software: "${duplicates[0]}" appears multiple times. Each software can only be added once.`);
      return;
    }

    // Validate each row has required fields
    for (let i = 0; i < softwareRows.length; i++) {
      const row = softwareRows[i];
      if (!row.softwareName) {
        setError(`Row ${i + 1}: Software Name is required.`);
        return;
      }
      if (!row.softwareType) {
        setError(`Row ${i + 1}: Software Type is required.`);
        return;
      }
      if (row.softwareName === 'Other' && !row.customSoftwareName.trim()) {
        setError(`Row ${i + 1}: Custom software name is required when "Other" is selected.`);
        return;
      }
      if (row.softwareName === 'Other' && row.customSoftwareName.trim().length < 2) {
        setError(`Row ${i + 1}: Custom software name must be at least 2 characters.`);
        return;
      }
    }

    // Warning if server type not selected (non-blocking)
    if (!serverType && softwareRows.length > 0) {
      // Show as warning but don't block — continue with save
    }

    setSaving(true);
    try {
      const items: SoftwareItemDto[] = softwareRows.map(row => ({
        id: row.id,
        softwareName: row.softwareName,
        customSoftwareName: row.softwareName === 'Other' ? row.customSoftwareName : undefined,
        softwareType: row.softwareType,
      }));

      const dto: VskSoftwareDto = {
        stateCode,
        starterPack: starterPack === 'Yes' ? 1 : 0,
        serverType: serverType || undefined,
        items,
      };

      await saveSoftware(dto, isCreate);
      setIsCreate(false);
      // Mark step 3 as COMPLETE via the wizard API
      await saveAndNext({ step: 3, data: {} });
      setSuccessMsg('Software details saved successfully.');
      onStepComplete?.();
    } catch (err) {
      console.error('Failed to save software data:', err);
      setError('Failed to save software details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ─── Loading state ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress size={40} sx={{ color: '#7C3AED' }} />
        <Typography sx={{ ml: 2 }} color="text.secondary">Loading software details...</Typography>
      </Box>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 3, color: '#1E293B' }}>
        <ComputerIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#7C3AED' }} />
        Software Details
      </Typography>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Server Type Warning */}
      {!serverType && softwareRows.length > 0 && !isReadOnly && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
          Server Type is not selected. Consider selecting a server type before proceeding.
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
              <FormControl component="fieldset" disabled={isReadOnly}>
                <FormLabel component="legend" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  Starter Pack Available?
                </FormLabel>
                <RadioGroup
                  row
                  value={starterPack}
                  onChange={e => setStarterPack(e.target.value)}
                >
                  <FormControlLabel value="Yes" control={<Radio size="small" />} label="Yes" />
                  <FormControlLabel value="No" control={<Radio size="small" />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" disabled={isReadOnly}>
                <InputLabel>Server Type</InputLabel>
                <Select
                  value={serverType}
                  label="Server Type"
                  onChange={e => setServerType(e.target.value)}
                >
                  {SERVER_TYPE_OPTIONS.map(opt => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Dynamic Software Table */}
      <Card sx={{ mb: 3, borderRadius: 2, border: '1px solid #E2E8F0' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>Software Inventory</Typography>
            {!isReadOnly && (
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddRow}
                sx={{ textTransform: 'none', bgcolor: '#7C3AED', '&:hover': { bgcolor: '#6D28D9' } }}
              >
                Add Software
              </Button>
            )}
          </Box>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 600, width: '5%' }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: '30%' }}>Software Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: '25%' }}>Custom Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: '25%' }}>Type</TableCell>
                  {!isReadOnly && (
                    <TableCell sx={{ fontWeight: 600, width: '15%' }} align="center">Actions</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {softwareRows.map((row, index) => (
                  <TableRow key={row.localId} hover>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{index + 1}</Typography>
                    </TableCell>
                    <TableCell>
                      {isReadOnly ? (
                        <Typography variant="body2">{row.softwareName || '—'}</Typography>
                      ) : (
                        <FormControl fullWidth size="small">
                          <Select
                            value={row.softwareName}
                            displayEmpty
                            onChange={e => updateRow(row.localId, 'softwareName', e.target.value)}
                          >
                            <MenuItem value="" disabled>Select software</MenuItem>
                            {SOFTWARE_NAME_OPTIONS.map(opt => (
                              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    </TableCell>
                    <TableCell>
                      {row.softwareName === 'Other' ? (
                        isReadOnly ? (
                          <Typography variant="body2">{row.customSoftwareName || '—'}</Typography>
                        ) : (
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="Enter software name"
                            value={row.customSoftwareName}
                            onChange={e => updateRow(row.localId, 'customSoftwareName', e.target.value)}
                          />
                        )
                      ) : (
                        <Typography variant="body2" color="text.secondary">—</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {isReadOnly ? (
                        <Typography variant="body2">{row.softwareType || '—'}</Typography>
                      ) : (
                        <FormControl fullWidth size="small">
                          <Select
                            value={row.softwareType}
                            displayEmpty
                            onChange={e => updateRow(row.localId, 'softwareType', e.target.value)}
                          >
                            <MenuItem value="" disabled>Select type</MenuItem>
                            {SOFTWARE_TYPE_OPTIONS.map(opt => (
                              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    </TableCell>
                    {!isReadOnly && (
                      <TableCell align="center">
                        <Tooltip title="Remove">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRequestDelete(row.localId)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {softwareRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={isReadOnly ? 4 : 5} align="center" sx={{ py: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        No software entries added. Click "Add Software" to begin.
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

      {/* Confirmation Dialog for Row Deletion */}
      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Remove Software Entry</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove this software entry? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Remove
          </Button>
        </DialogActions>
      </Dialog>

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
