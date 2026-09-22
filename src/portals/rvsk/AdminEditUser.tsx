import { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Paper, TextField, Button, Alert, FormControl, InputLabel, Select, MenuItem, Grid } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import apiClient from '../../services/apiClient';
import {
  validateDisplayName, validateEmail, validateOptionalEmail, validateOptionalMobile,
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

export default function AdminEditUser() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('');
  const [geo, setGeo] = useState<GeoValue>(EMPTY_GEO);
  const [phone, setPhone] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  const roleOptions = useMemo(() => {
    if (currentUser?.role === 'RVSK_Admin') {
      return ALL_ROLES.filter((r) => r.value !== 'Super_Admin');
    }
    return ALL_ROLES;
  }, [currentUser?.role]);

  const geoLevel = geoLevelForRole(role);

  useEffect(() => {
    if (!id) return;
    apiClient.get(`/users/${id}`)
      .then(res => {
        const u = res.data;
        setUsername(u.username || '');
        setDisplayName(u.displayName || '');
        setRole(u.role || '');
        // Pre-select the cascade from the stored keys.
        setGeo({
          stateKey: u.stateKey || '',
          districtKey: u.districtKey || '',
          blockKey: u.blockKey || '',
        });
        setPhone(u.phone || '');
        setMobileNumber(u.mobileNumber || '');
        setDesignation(u.designation || '');
        setDepartment(u.department || '');
        setUserEmail(u.userEmail || '');
        setContactEmail(u.contactEmail || '');
      })
      .catch(() => setError('Failed to load user'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleRoleChange = (nextRole: string) => {
    setRole(nextRole);
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

  const handleSave = async () => {
    setError(''); setSuccess('');

    const errs = [
      validateDisplayName(displayName),
      !role ? 'Role is required' : null,
      contactEmail ? validateEmail(contactEmail) : null,
      validateOptionalEmail(userEmail),
      validateOptionalMobile(mobileNumber),
      validateOptionalMobile(phone),
      validateGeo(),
    ].filter(Boolean);

    if (errs.length > 0) { setError(errs[0] as string); return; }

    try {
      const payload: Record<string, unknown> = {
        displayName: displayName.trim(),
        role,
        phone: phone.trim() || undefined,
        mobileNumber: mobileNumber.trim() || undefined,
        designation: designation.trim() || undefined,
        department: department.trim() || undefined,
        userEmail: userEmail.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
      };
      // Send geo keys per role level; null clears them for non-geo roles.
      payload.stateKey = geoLevel !== 'none' ? (geo.stateKey || null) : null;
      payload.districtKey = (geoLevel === 'district' || geoLevel === 'block') ? (geo.districtKey || null) : null;
      payload.blockKey = geoLevel === 'block' ? (geo.blockKey || null) : null;

      await apiClient.put(`/users/${id}`, payload);
      setSuccess('User updated successfully');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update user');
    }
  };

  if (loading) return <Box sx={{ p: 4 }}><Typography>Loading...</Typography></Box>;

  return (
    <Box sx={{ p: 3, maxWidth: 640, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>Edit User</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField fullWidth label="Username" value={username} disabled size="small" />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Display Name" value={displayName} onChange={e => setDisplayName(e.target.value)} required />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Role</InputLabel>
              <Select value={role} label="Role" onChange={e => handleRoleChange(e.target.value)}>
                {roleOptions.map(r => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>

          {/* Role-conditional cascading geo dropdowns (pre-selected from stored keys) */}
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
            <TextField fullWidth label="Designation" value={designation} onChange={e => setDesignation(e.target.value)} placeholder="Optional" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Department" value={department} onChange={e => setDepartment(e.target.value)} placeholder="Optional" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="User Email" value={userEmail} onChange={e => setUserEmail(e.target.value)} placeholder="Optional" type="email" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Contact Email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} type="email" helperText="Required" />
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
