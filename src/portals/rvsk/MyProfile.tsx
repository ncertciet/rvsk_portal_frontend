import { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, Alert, Grid, Chip } from '@mui/material';
import apiClient from '../../services/apiClient';
import { validatePhone, validateDisplayName, validateDesignation, validateDepartment } from '../../utils/validators';

export default function MyProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    apiClient.get('/auth/profile')
      .then(res => {
        const p = res.data;
        setProfile(p);
        setDisplayName(p.displayName || '');
        setPhone(p.phone || '');
        setDesignation(p.designation || '');
        setDepartment(p.department || '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const nameError = touched.name ? validateDisplayName(displayName) : null;
  const phoneError = touched.phone ? validatePhone(phone) : null;
  const designationError = touched.designation ? validateDesignation(designation) : null;
  const departmentError = touched.department ? validateDepartment(department) : null;

  const handleSave = async () => {
    setTouched({ name: true, phone: true, designation: true, department: true });
    setMessage(null);

    const errors = [
      validateDisplayName(displayName),
      phone ? validatePhone(phone) : null, // phone optional on edit
      designation ? validateDesignation(designation) : null,
      department ? validateDepartment(department) : null,
    ].filter(Boolean);

    if (errors.length > 0) {
      setMessage({ type: 'error', text: 'Please fix validation errors' });
      return;
    }

    setSaving(true);
    try {
      const res = await apiClient.put('/auth/profile', { displayName: displayName.trim(), phone: phone.trim(), designation: designation.trim(), department: department.trim() });
      setProfile(res.data);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to update' });
    } finally { setSaving(false); }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><Typography>Loading...</Typography></Box>;

  return (
    <Box sx={{ p: 3, maxWidth: 700, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>My Profile</Typography>
      {message && <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Account Information (Read-only)</Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}><TextField fullWidth label="Username (Email)" value={profile?.username || ''} disabled size="small" /></Grid>
          <Grid item xs={6}><TextField fullWidth label="Role" value={profile?.role || ''} disabled size="small"
            InputProps={{ endAdornment: <Chip label={profile?.role} size="small" color="primary" /> }} /></Grid>
          <Grid item xs={6}><TextField fullWidth label="State Code" value={profile?.stateCode || 'National'} disabled size="small" /></Grid>
          <Grid item xs={6}><TextField fullWidth label="District Code" value={profile?.districtCode || 'All'} disabled size="small" /></Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Editable Information</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField fullWidth label="Display Name" value={displayName}
              onChange={e => setDisplayName(e.target.value)} onBlur={() => setTouched(t => ({ ...t, name: true }))}
              error={!!nameError} helperText={nameError || 'Letters, spaces, dots, hyphens only'} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Phone" value={phone}
              onChange={e => setPhone(e.target.value)} onBlur={() => setTouched(t => ({ ...t, phone: true }))}
              error={!!phoneError} helperText={phoneError || '10-digit Indian mobile'}
              inputProps={{ maxLength: 10 }} placeholder="9876543210" />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Designation" value={designation}
              onChange={e => setDesignation(e.target.value)} onBlur={() => setTouched(t => ({ ...t, designation: true }))}
              error={!!designationError} helperText={designationError} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Department" value={department}
              onChange={e => setDepartment(e.target.value)} onBlur={() => setTouched(t => ({ ...t, department: true }))}
              error={!!departmentError} helperText={departmentError} />
          </Grid>
        </Grid>
        <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ mt: 3, bgcolor: '#5B21B6', '&:hover': { bgcolor: '#4C1D95' } }}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Paper>
    </Box>
  );
}
