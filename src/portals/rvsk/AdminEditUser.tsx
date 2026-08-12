import { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, Alert, FormControl, InputLabel, Select, MenuItem, Grid } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../services/apiClient';

export default function AdminEditUser() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [districtCode, setDistrictCode] = useState('');
  const [username, setUsername] = useState('');
  const [states, setStates] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/attendance/filters/states').then(r => setStates(r.data.data || [])).catch(() => {});
    if (id) {
      apiClient.get(`/users/${id}`)
        .then(res => {
          const u = res.data;
          setUsername(u.username || '');
          setDisplayName(u.displayName || '');
          setRole(u.role || '');
          setStateCode(u.stateCode || '');
          setDistrictCode(u.districtCode || '');
        })
        .catch(() => setError('Failed to load user'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleSave = async () => {
    setError(''); setSuccess('');
    try {
      await apiClient.put(`/users/${id}`, { username, displayName, role, stateCode: stateCode || null, districtCode: districtCode || null });
      setSuccess('User updated successfully');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update user');
    }
  };

  if (loading) return <Box sx={{ p: 4 }}><Typography>Loading...</Typography></Box>;

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>Edit User</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField fullWidth label="Username (Email)" value={username} disabled size="small" />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Display Name" value={displayName} onChange={e => setDisplayName(e.target.value)} />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select value={role} label="Role" onChange={e => setRole(e.target.value)}>
                <MenuItem value="Super_Admin">Super Admin</MenuItem>
                <MenuItem value="RVSK_Admin">RVSK Admin</MenuItem>
                <MenuItem value="RVSK_SPOC">RVSK SPOC</MenuItem>
                <MenuItem value="Ministry_Admin">Ministry Admin</MenuItem>
                <MenuItem value="State_Admin">State Admin</MenuItem>
                <MenuItem value="District_Admin">District Admin</MenuItem>
                <MenuItem value="Block_Admin">Block Admin</MenuItem>
                <MenuItem value="Viewer">Viewer</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>State</InputLabel>
              <Select value={stateCode} label="State" onChange={e => setStateCode(e.target.value)}>
                <MenuItem value="">National</MenuItem>
                {states.map((s: any) => <MenuItem key={s.STATE_ID} value={s.STATE_ID}>{s.STATE_NAME}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="District Code" value={districtCode} onChange={e => setDistrictCode(e.target.value)} />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={handleSave} sx={{ bgcolor: '#5B21B6', '&:hover': { bgcolor: '#4C1D95' } }}>Save Changes</Button>
          <Button variant="outlined" onClick={() => navigate('/rvsk/admin/users')}>Back</Button>
        </Box>
      </Paper>
    </Box>
  );
}
