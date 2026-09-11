import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, InputAdornment, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import LockResetIcon from '@mui/icons-material/LockReset';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';

export default function AdminUserList() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [resetDialog, setResetDialog] = useState<{ open: boolean; user: any; tempPassword?: string }>({ open: false, user: null });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter) params.append('role', roleFilter);
      if (search) params.append('search', search);
      const res = await apiClient.get(`/users?${params}`);
      setUsers(res.data || []);
    } catch { setUsers([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [roleFilter]);

  const handleSearch = () => fetchUsers();

  const handleResetPassword = async (user: any) => {
    try {
      const res = await apiClient.put(`/users/${user.id}/reset-password`);
      setResetDialog({ open: true, user, tempPassword: res.data.tempPassword });
    } catch (err: any) {
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.message || err?.message || 'Unknown error';
      console.error('[ResetPassword] failed:', status, err?.response?.data || err);
      alert(`Failed to reset password${status ? ` (HTTP ${status})` : ''}: ${serverMsg}`);
    }
  };

  const handleToggleActive = async (user: any) => {
    try {
      await apiClient.put(`/users/${user.id}/toggle-active`);
      fetchUsers();
    } catch { alert('Failed to toggle status'); }
  };

  const handleUnlock = async (user: any) => {
    try {
      await apiClient.put(`/users/${user.id}/unlock`);
      fetchUsers();
    } catch { alert('Failed to unlock'); }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>User Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/rvsk/admin/users/new')}
          sx={{ bgcolor: '#5B21B6', '&:hover': { bgcolor: '#4C1D95' } }}>
          Create User
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField size="small" placeholder="Search by name or email..." value={search}
          onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          sx={{ flex: 1 }} />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Role</InputLabel>
          <Select value={roleFilter} label="Role" onChange={e => setRoleFilter(e.target.value)}>
            <MenuItem value="">All Roles</MenuItem>
            <MenuItem value="Super_Admin">Super Admin</MenuItem>
            <MenuItem value="RVSK_Admin">RVSK Admin</MenuItem>
            <MenuItem value="Ministry_Admin">Ministry Admin</MenuItem>
            <MenuItem value="State_Admin">State Admin</MenuItem>
            <MenuItem value="District_Admin">District Admin</MenuItem>
            <MenuItem value="Block_Admin">Block Admin</MenuItem>
            <MenuItem value="Viewer">Viewer</MenuItem>
          </Select>
        </FormControl>
        <Button variant="outlined" onClick={handleSearch}>Search</Button>
      </Paper>

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#1E293B' }}>
              {['#', 'Name', 'Username', 'Role', 'State', 'Status', 'Last Login', 'Actions'].map(h => (
                <TableCell key={h} sx={{ color: '#fff', fontWeight: 600 }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user, idx) => (
              <TableRow key={user.id} hover>
                <TableCell>{idx + 1}</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{user.displayName}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{user.username}</TableCell>
                <TableCell><Chip label={user.role} size="small" variant="outlined" /></TableCell>
                <TableCell>{user.stateCode || '—'}</TableCell>
                <TableCell>
                  <Chip label={user.isActive ? 'Active' : 'Inactive'} size="small"
                    color={user.isActive ? 'success' : 'error'} />
                </TableCell>
                <TableCell sx={{ fontSize: 11 }}>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}</TableCell>
                <TableCell>
                  <IconButton size="small" title="Edit" onClick={() => navigate(`/rvsk/admin/users/${user.id}/edit`)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" title="Reset Password" onClick={() => handleResetPassword(user)}>
                    <LockResetIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" title="Unlock" onClick={() => handleUnlock(user)}>
                    <LockOpenIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" title={user.isActive ? 'Deactivate' : 'Activate'} onClick={() => handleToggleActive(user)}>
                    {user.isActive ? <BlockIcon fontSize="small" color="error" /> : <CheckCircleIcon fontSize="small" color="success" />}
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && !loading && (
              <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4 }}>No users found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Reset Password Dialog */}
      <Dialog open={resetDialog.open} onClose={() => setResetDialog({ open: false, user: null })}>
        <DialogTitle>Password Reset</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>New temporary credentials for <b>{resetDialog.user?.displayName}</b>:</Typography>
          <Paper sx={{ p: 2, bgcolor: '#F5F3FF', mt: 1 }}>
            <Typography variant="body2"><b>Username:</b> {resetDialog.user?.username}</Typography>
            <Typography variant="body2"><b>Temp Password:</b> <code style={{ fontSize: 16, color: '#5B21B6' }}>{resetDialog.tempPassword}</code></Typography>
          </Paper>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            User must change this password on next login.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { navigator.clipboard.writeText(`${resetDialog.user?.username} / ${resetDialog.tempPassword}`); }}>
            Copy to Clipboard
          </Button>
          <Button onClick={() => setResetDialog({ open: false, user: null })} variant="contained">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
