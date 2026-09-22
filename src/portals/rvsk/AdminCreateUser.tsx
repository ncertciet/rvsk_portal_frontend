import { useState, useMemo } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Alert, FormControl, InputLabel,
  Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import apiClient from '../../services/apiClient';
import {
  validateUsername, validateDisplayName, validateEmail,
  validateOptionalEmail, validateOptionalMobile,
} from '../../utils/validators';
import GeoScopeSelect, { GeoValue, geoLevelForRole } from './GeoScopeSelect';

const ALL_ROLES: { value: string; label: string }[] = [
  { value: 'Super_Admin', label: 'Super Admin' },
  { value: 'RVSK_Admin', label: 'RVSK Admin' },
  { value: 'RVSK_SPOC', label: 'RVSK SPOC' },
  { value: 'Ministry_Admin', label: 'Ministry Admin' },
  { value: 'State_Admin', label: 'State Admin' },
  { value: 'District_Admin', label: 'District Admin' },
  { value: 'Block_Admin', label: 'Block Admin' },
  { value: 'Viewer', label: 'Viewer' },
];

const EMPTY_GEO: GeoValue = { stateKey: '', districtKey: '', blockKey: '' };

export default function AdminCreateUser() {
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('');
  const [geo, setGeo] = useState<GeoValue>(EMPTY_GEO);
  const [phone, setPhone] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [designation, setDesignation] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [credDialog, setCredDialog] = useState<{ open: boolean; username: string; password: string }>({ open: false, username: '', password: '' });

  // Role-based creation authority (spec .1): RVSK_Admin cannot offer Super_Admin.
  const roleOptions = useMemo(() => {
    if (currentUser?.role === 'RVSK_Admin') {
      return ALL_ROLES.filter((r) => r.value !== 'Super_Admin');
    }
    return ALL_ROLES;
  }, [currentUser?.role]);

  const geoLevel = geoLevelForRole(role);

  const resetForm = () => {
    setUsername(''); setDisplayName(''); setRole(''); setGeo(EMPTY_GEO);
    setPhone(''); setMobileNumber(''); setDesignation(''); setUserEmail(''); setContactEmail('');
  };

  const handleRoleChange = (nextRole: string) => {
    setRole(nextRole);
    // Reset geo whenever the role changes so stale scope is never submitted.
    setGeo(EMPTY_GEO);
  };

  const validateGeo = (): string | null => {
    if (geoLevel === 'none') return null;
    if (!geo.stateKey) return 'State is required for this role';
    if ((geoLevel === 'district' || geoLevel === 'block') && !geo.districtKey)
      return 'District is required for this role';
    if (geoLevel === 'block' && !geo.blockKey) return 'Block is required for this role';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const errs = [
      validateUsername(username),
      validateDisplayName(displayName),
      !role ? 'Role is required' : null,
      validateEmail(contactEmail), // contactEmail mandatory
      validateOptionalEmail(userEmail),
      validateOptionalMobile(mobileNumber),
      validateOptionalMobile(phone),
      validateGeo(),
    ].filter(Boolean);

    if (errs.length > 0) { setError(errs[0] as string); return; }

    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        username: username.trim(),
        displayName: displayName.trim(),
        role,
        contactEmail: contactEmail.trim(),
        userEmail: userEmail.trim() || undefined,
        phone: phone.trim() || undefined,
        mobileNumber: mobileNumber.trim() || undefined,
        designation: designation.trim() || undefined,
      };
      // Only send geo keys relevant to the role's level.
      if (geoLevel !== 'none') payload.stateKey = geo.stateKey || undefined;
      if (geoLevel === 'district' || geoLevel === 'block') payload.districtKey = geo.districtKey || undefined;
      if (geoLevel === 'block') payload.blockKey = geo.blockKey || undefined;

      const res = await apiClient.post('/users/create', payload);
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
    <Box sx={{ p: 3, maxWidth: 640, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>Create New User</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Username" value={username} onChange={e => setUsername(e.target.value)}
                required placeholder="username or email" helperText="Login identifier — may be an email or a plain username" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Display Name" value={displayName} onChange={e => setDisplayName(e.target.value)}
                required placeholder="Full Name" />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Role</InputLabel>
                <Select value={role} label="Role" onChange={e => handleRoleChange(e.target.value)}>
                  {roleOptions.map(r => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>

            {/* Role-conditional cascading geo dropdowns */}
            <GeoScopeSelect level={geoLevel} value={geo} onChange={setGeo} />

            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Phone Number" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="9876543210" inputProps={{ maxLength: 10 }} helperText="Optional" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Mobile Number" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)}
                placeholder="9876543210" inputProps={{ maxLength: 10 }} helperText="Optional" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Designation" value={designation} onChange={e => setDesignation(e.target.value)}
                placeholder="Optional" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="User Email" value={userEmail} onChange={e => setUserEmail(e.target.value)}
                placeholder="Optional" type="email" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Contact Email" value={contactEmail} onChange={e => setContactEmail(e.target.value)}
                required placeholder="contact@example.gov.in" type="email" helperText="Required" />
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
          <Button onClick={() => { setCredDialog({ open: false, username: '', password: '' }); resetForm(); }}>
            Create Another
          </Button>
          <Button variant="contained" onClick={() => navigate('/rvsk/admin/users')}>Done</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
