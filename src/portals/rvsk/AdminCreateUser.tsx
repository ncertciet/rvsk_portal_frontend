import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Alert, FormControl, InputLabel,
  Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import { validateEmail, validateDisplayName } from '../../utils/validators';

export default function AdminCreateUser() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [districtCode, setDistrictCode] = useState('');
  const [states, setStates] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [credDialog, setCredDialog] = useState<{ open: boolean; username: string; password: string }>({ open: false, username: '', password: '' });

  useEffect(() => {
    apiClient.get('/attendance/filters/states').then(r => setStates(r.data.data || [])).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const emailErr = validateEmail(username);
    const nameErr = validateDisplayName(displayName);
    if (emailErr) { setError(emailErr); return; }
    if (nameErr) { setError(nameErr); return; }
    if (!role) { setError('Role is required'); return; }

    setLoading(true);
    try {
      const res = await apiClient.post('/users/create', { username, displayName, role, stateCode: stateCode || null, districtCode: districtCode || null });
      const data = res.data;
      setCredDialog({ open: true, username: data.user.username, password: data.tempPassword });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create user');
    } finally { setLoading(false); }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`Username: ${credDialog.username}\nPassword: ${credDialog.password}`);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>Create New User</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Email (Username)" value={username} onChange={e => setUsername(e.target.value)}
                required placeholder="user@rvsk.gov.in" type="email" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Display Name" value={displayName} onChange={e => setDisplayName(e.target.value)}
                required placeholder="Full Name" />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
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
                  <MenuItem value="">National (All)</MenuItem>
                  {states.map((s: any) => <MenuItem key={s.STATE_ID} value={s.STATE_ID}>{s.STATE_NAME}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="District Code" value={districtCode} onChange={e => setDistrictCode(e.target.value)}
                placeholder="Optional" />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button type="submit" variant="contained" disabled={loading}
              sx={{ bgcolor: '#5B21B6', '&:hover': { bgcolor: '#4C1D95' } }}>
              {loading ? 'Creating...' : 'Create User'}
            </Button>
            <Button variant="outlined" onClick={() => navigate('/rvsk/admin/users')}>Cancel</Button>
          </Box>
        </form>
      </Paper>

      {/* Credentials Dialog */}
      <Dialog open={credDialog.open} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#F5F3FF' }}>✅ User Created Successfully</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography gutterBottom>Share these credentials securely with the user:</Typography>
          <Paper sx={{ p: 2, bgcolor: '#F8FAFC', border: '1px solid #E5E7EB', mt: 1 }}>
            <Typography variant="body1"><b>Username:</b> <code>{credDialog.username}</code></Typography>
            <Typography variant="body1" sx={{ mt: 1 }}><b>Temp Password:</b> <code style={{ fontSize: 18, color: '#5B21B6' }}>{credDialog.password}</code></Typography>
          </Paper>
          <Alert severity="info" sx={{ mt: 2 }}>
            User must change this password on first login.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCopy}>Copy to Clipboard</Button>
          <Button onClick={() => { setCredDialog({ open: false, username: '', password: '' }); setUsername(''); setDisplayName(''); setRole(''); setStateCode(''); setDistrictCode(''); }}>
            Create Another
          </Button>
          <Button variant="contained" onClick={() => navigate('/rvsk/admin/users')}>Done</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
