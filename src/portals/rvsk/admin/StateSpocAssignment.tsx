import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
  TextField,
  CircularProgress,
  Alert,
  Drawer,
  Divider,
  Tooltip,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import HistoryIcon from '@mui/icons-material/History';
import apiClient from '../../../services/apiClient';

const ADMIN_ROLES = ['Super_Admin', 'RVSK_Admin'];

interface RootState {
  auth: { user: { role: string } | null };
}

interface AssignmentRow {
  stateKey: string;
  stateName: string | null;
  stateId: string | null;
  spocUserId: string | null;
  spocName: string | null;
  assignedAt: string | null;
  assignedByName: string | null;
  isActive: boolean;
}

interface SpocUser {
  id: string;
  name: string;
  email: string | null;
}

interface HistoryRow {
  id: string;
  stateKey: string;
  spocName: string | null;
  isActive: boolean;
  assignedAt: string;
  assignedByName: string | null;
  unassignedAt: string | null;
  unassignedByName: string | null;
  note: string | null;
}

const fmtDate = (v: string | null): string =>
  v ? new Date(v).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const StateSpocAssignment: React.FC = () => {
  const user = useSelector((s: RootState) => s.auth.user);
  const navigate = useNavigate();
  const isAdmin = user && ADMIN_ROLES.includes(user.role);

  const [rows, setRows] = useState<AssignmentRow[]>([]);
  const [spocs, setSpocs] = useState<SpocUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Assign dialog
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignSpoc, setAssignSpoc] = useState('');
  const [assignStates, setAssignStates] = useState<string[]>([]);
  const [assignNote, setAssignNote] = useState('');
  const [saving, setSaving] = useState(false);

  // Reassign dialog
  const [reassignOpen, setReassignOpen] = useState(false);
  const [reassignRow, setReassignRow] = useState<AssignmentRow | null>(null);
  const [reassignSpoc, setReassignSpoc] = useState('');

  // History drawer
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyState, setHistoryState] = useState<AssignmentRow | null>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/rvsk/home');
      return;
    }
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [assignRes, spocRes] = await Promise.all([
        apiClient.get('/spoc-mappings'),
        apiClient.get('/spoc-mappings/spocs'),
      ]);
      setRows(assignRes.data);
      setSpocs(spocRes.data);
      setError('');
    } catch (err) {
      console.error('Failed to load SPOC assignments', err);
      setError('Failed to load State–SPOC assignments.');
    } finally {
      setLoading(false);
    }
  };

  const flash = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const handleAssign = async () => {
    if (!assignSpoc || assignStates.length === 0) {
      setError('Select a SPOC and at least one state.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await apiClient.post('/spoc-mappings/assign', {
        spocUserId: assignSpoc,
        stateKeys: assignStates,
        note: assignNote.trim() || undefined,
      });
      setRows(res.data);
      setAssignOpen(false);
      setAssignSpoc('');
      setAssignStates([]);
      setAssignNote('');
      flash('States assigned successfully.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to assign states.');
    } finally {
      setSaving(false);
    }
  };

  const openReassign = (row: AssignmentRow) => {
    setReassignRow(row);
    setReassignSpoc(row.spocUserId || '');
    setError('');
    setReassignOpen(true);
  };

  const handleReassign = async () => {
    if (!reassignRow || !reassignSpoc) {
      setError('Select a SPOC.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await apiClient.post('/spoc-mappings/reassign', {
        stateKey: reassignRow.stateKey,
        spocUserId: reassignSpoc,
      });
      setRows(res.data);
      setReassignOpen(false);
      setReassignRow(null);
      flash('State reassigned successfully.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reassign state.');
    } finally {
      setSaving(false);
    }
  };

  const openHistory = async (row: AssignmentRow) => {
    setHistoryState(row);
    setHistoryOpen(true);
    setHistory([]);
    try {
      const res = await apiClient.get(`/spoc-mappings/${row.stateKey}/history`);
      setHistory(res.data);
    } catch (err) {
      console.error('Failed to load history', err);
    }
  };

  if (!isAdmin) return null;

  const selectedReassignName = spocs.find((s) => s.id === reassignSpoc)?.name || '';

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          State–SPOC Assignment
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setError(''); setAssignOpen(true); }}>
          Assign States
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        A grievance belongs to a State; a State belongs to one active SPOC; a SPOC can manage many States.
        Reassigning a State moves all its grievances (existing and future) to the new SPOC.
      </Typography>

      {error && !assignOpen && !reassignOpen && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>
      )}
      {successMsg && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMsg('')}>{successMsg}</Alert>
      )}

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>State</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Current SPOC</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Assignment Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Assigned By</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}><CircularProgress size={30} /></TableCell></TableRow>
              ) : rows.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">No states found.</Typography>
                </TableCell></TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.stateKey} hover>
                    <TableCell>{row.stateName || row.stateKey}</TableCell>
                    <TableCell>{row.spocName || <Typography variant="body2" color="text.secondary">—</Typography>}</TableCell>
                    <TableCell>{fmtDate(row.assignedAt)}</TableCell>
                    <TableCell>{row.assignedByName || '—'}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={row.isActive ? 'Active' : 'Unassigned'}
                        color={row.isActive ? 'success' : 'default'}
                        variant={row.isActive ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Reassign SPOC">
                        <IconButton size="small" onClick={() => openReassign(row)}>
                          <SwapHorizIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Assignment history">
                        <IconButton size="small" onClick={() => openHistory(row)}>
                          <HistoryIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Assign dialog */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign States to a SPOC</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
            <InputLabel>SPOC</InputLabel>
            <Select value={assignSpoc} label="SPOC" onChange={(e) => setAssignSpoc(e.target.value)}>
              {spocs.map((s) => (
                <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>States</InputLabel>
            <Select
              multiple
              value={assignStates}
              onChange={(e) => setAssignStates(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
              input={<OutlinedInput label="States" />}
              renderValue={(selected) =>
                rows.filter((r) => selected.includes(r.stateKey)).map((r) => r.stateName || r.stateKey).join(', ')
              }
            >
              {rows.map((r) => (
                <MenuItem key={r.stateKey} value={r.stateKey}>
                  <Checkbox checked={assignStates.indexOf(r.stateKey) > -1} />
                  <ListItemText
                    primary={r.stateName || r.stateKey}
                    secondary={r.spocName ? `Currently: ${r.spocName}` : 'Currently: unassigned'}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Note (optional)"
            value={assignNote}
            onChange={(e) => setAssignNote(e.target.value)}
            multiline
            rows={2}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Any selected state already owned by another SPOC will be reassigned; its grievances move to this SPOC.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAssign} disabled={saving}>
            {saving ? 'Saving...' : 'Assign'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reassign dialog */}
      <Dialog open={reassignOpen} onClose={() => setReassignOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reassign {reassignRow?.stateName || reassignRow?.stateKey}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Current SPOC: <strong>{reassignRow?.spocName || 'Unassigned'}</strong>
          </Typography>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>New SPOC</InputLabel>
            <Select value={reassignSpoc} label="New SPOC" onChange={(e) => setReassignSpoc(e.target.value)}>
              {spocs.map((s) => (
                <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {reassignSpoc && reassignSpoc !== reassignRow?.spocUserId && (
            <Alert severity="info" sx={{ mt: 2 }}>
              {reassignRow?.spocName || 'The current SPOC'} will lose access to this state.
              All existing and future grievances for {reassignRow?.stateName || 'this state'} will move to {selectedReassignName}.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReassignOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleReassign} disabled={saving || reassignSpoc === reassignRow?.spocUserId}>
            {saving ? 'Saving...' : 'Reassign'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* History drawer */}
      <Drawer anchor="right" open={historyOpen} onClose={() => setHistoryOpen(false)}>
        <Box sx={{ width: 380, p: 3 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>Assignment History</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {historyState?.stateName || historyState?.stateKey}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {history.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No history yet.</Typography>
          ) : (
            history.map((h) => (
              <Paper key={h.id} variant="outlined" sx={{ p: 1.5, mb: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" fontWeight={600}>{h.spocName || '—'}</Typography>
                  <Chip size="small" label={h.isActive ? 'Active' : 'Ended'} color={h.isActive ? 'success' : 'default'} variant={h.isActive ? 'filled' : 'outlined'} />
                </Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  From: {fmtDate(h.assignedAt)}{h.assignedByName ? ` · by ${h.assignedByName}` : ''}
                </Typography>
                {h.unassignedAt && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    Until: {fmtDate(h.unassignedAt)}{h.unassignedByName ? ` · by ${h.unassignedByName}` : ''}
                  </Typography>
                )}
                {h.note && (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>{h.note}</Typography>
                )}
              </Paper>
            ))
          )}
        </Box>
      </Drawer>
    </Box>
  );
};

export default StateSpocAssignment;
