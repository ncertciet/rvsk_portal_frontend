import { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, Alert, Grid, Chip } from '@mui/material';
import apiClient from '../../services/apiClient';
import {
  validatePhone, validateDisplayName, validateEmail,
  validateOptionalEmail, validateOptionalMobile,
} from '../../utils/validators';

export default function MyProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [contactEmail, setContactEmail] = useState('');
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
        setMobileNumber(p.mobileNumber || '');
        setDesignation(p.designation || '');
        setDepartment(p.department || '');
        setUserEmail(p.userEmail || '');
        setContactEmail(p.contactEmail || '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const nameError = touched.name ? validateDisplayName(displayName) : null;
  const phoneError = touched.phone ? validatePhone(phone) : null; // mandatory
  const mobileError = touched.mobile ? validateOptionalMobile(mobileNumber) : null;
  const contactEmailError = touched.contactEmail ? validateEmail(contactEmail) : null; // mandatory
  const userEmailError = touched.userEmail ? validateOptionalEmail(userEmail) : null;

  const handleSave = async () => {
    setTouched({ name: true, phone: true, mobile: true, contactEmail: true, userEmail: true });
    setMessage(null);

    const errors = [
      validateDisplayName(displayName),
      validatePhone(phone),          // Phone mandatory on save (spec .5)
      validateEmail(contactEmail),   // Contact Email mandatory (spec .5)
      validateOptionalMobile(mobileNumber),
      validateOptionalEmail(userEmail),
    ].filter(Boolean);

    if (errors.length > 0) {
      setMessage({ type: 'error', text: errors[0] as string });
      return;
    }

    setSaving(true);
    try {
      const res = await apiClient.put('/auth/profile', {
        displayName: displayName.trim(),
        phone: phone.trim(),
        mobileNumber: mobileNumber.trim() || undefined,
        designation: designation.trim() || undefined,
        department: department.trim() || undefined,
        userEmail: userEmail.trim() || undefined,
        contactEmail: contactEmail.trim(),
      });
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
          <Grid item xs={6}><TextField fullWidth label="Username" value={profile?.username || ''} disabled size="small" /></Grid>
          <Grid item xs={6}><TextField fullWidth label="Role" value={profile?.role || ''} disabled size="small"
            InputProps={{ endAdornment: <Chip label={profile?.role} size="small" color="primary" /> }} /></Grid>
          <Grid item xs={4}><TextField fullWidth label="State" value={profile?.stateName || 'National'} disabled size="small" /></Grid>
          <Grid item xs={4}><TextField fullWidth label="District" value={profile?.districtName || '—'} disabled size="small" /></Grid>
          <Grid item xs={4}><TextField fullWidth label="Block" value={profile?.blockName || '—'} disabled size="small" /></Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Editable Information</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField fullWidth label="Display Name" value={displayName}
              onChange={e => setDisplayName(e.target.value)} onBlur={() => setTouched(t => ({ ...t, name: true }))}
              error={!!nameError} helperText={nameError || 'Letters, spaces, dots, hyphens only'} required />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Phone" value={phone}
              onChange={e => setPhone(e.target.value)} onBlur={() => setTouched(t => ({ ...t, phone: true }))}
              error={!!phoneError} helperText={phoneError || '10-digit Indian mobile (required)'}
              inputProps={{ maxLength: 10 }} placeholder="9876543210" required />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Mobile Number" value={mobileNumber}
              onChange={e => setMobileNumber(e.target.value)} onBlur={() => setTouched(t => ({ ...t, mobile: true }))}
              error={!!mobileError} helperText={mobileError || 'Optional'}
              inputProps={{ maxLength: 10 }} placeholder="9876543210" />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Designation" value={designation}
              onChange={e => setDesignation(e.target.value)} placeholder="Optional" />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Department" value={department}
              onChange={e => setDepartment(e.target.value)} placeholder="Optional" />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="User Email" value={userEmail}
              onChange={e => setUserEmail(e.target.value)} onBlur={() => setTouched(t => ({ ...t, userEmail: true }))}
              error={!!userEmailError} helperText={userEmailError || 'Optional'} type="email" />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Contact Email" value={contactEmail}
              onChange={e => setContactEmail(e.target.value)} onBlur={() => setTouched(t => ({ ...t, contactEmail: true }))}
              error={!!contactEmailError} helperText={contactEmailError || 'Required'} type="email" required />
          </Grid>
        </Grid>
        <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ mt: 3, bgcolor: '#5B21B6', '&:hover': { bgcolor: '#4C1D95' } }}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Paper>
    </Box>
  );
}
