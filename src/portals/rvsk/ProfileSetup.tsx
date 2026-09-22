import { useState } from 'react';
import { Box, Typography, Paper, TextField, Button, Alert, LinearProgress, List, ListItem, ListItemIcon, ListItemText, Grid } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess } from '../../store/authSlice';
import { RootState } from '../../store';
import apiClient from '../../services/apiClient';
import {
  validatePhone, validatePassword, validateEmail,
  validateOptionalEmail, validateOptionalMobile,
} from '../../utils/validators';

export default function ProfileSetup() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.accessToken);

  const [phone, setPhone] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const pwValidation = validatePassword(newPassword);
  const phoneError = touched.phone ? validatePhone(phone) : null;
  const mobileError = touched.mobile ? validateOptionalMobile(mobileNumber) : null;
  const contactEmailError = touched.contactEmail ? validateEmail(contactEmail) : null;
  const userEmailError = touched.userEmail ? validateOptionalEmail(userEmail) : null;
  const confirmError = touched.confirm && newPassword !== confirmPassword ? 'Passwords do not match' : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setTouched({ phone: true, mobile: true, contactEmail: true, userEmail: true, password: true, confirm: true });

    const fieldErr = [
      validatePhone(phone),          // mandatory
      validateEmail(contactEmail),   // mandatory (spec .6)
      validateOptionalMobile(mobileNumber),
      validateOptionalEmail(userEmail),
    ].filter(Boolean);

    if (fieldErr.length > 0) {
      setError(fieldErr[0] as string);
      return;
    }
    if (!pwValidation.isValid) {
      setError('Password does not meet the requirements');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await apiClient.put('/auth/complete-profile', {
        phone: phone.trim(),
        mobileNumber: mobileNumber.trim() || undefined,
        designation: designation.trim() || undefined,
        department: department.trim() || undefined,
        userEmail: userEmail.trim() || undefined,
        contactEmail: contactEmail.trim(),
        newPassword,
      });
      if (user && token) {
        dispatch(loginSuccess({ accessToken: token, user: { ...user, access: user.access } }));
      }
      navigate('/rvsk/home');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to complete profile');
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8FAFC', p: 3 }}>
      <Paper sx={{ p: 4, maxWidth: 560, width: '100%' }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>Complete Your Profile</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Welcome! Please complete your profile and set a new password before accessing the portal.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2} sx={{ mb: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Phone Number" value={phone}
                onChange={e => setPhone(e.target.value)} onBlur={() => setTouched(t => ({ ...t, phone: true }))}
                error={!!phoneError} helperText={phoneError || 'Required'}
                required placeholder="9876543210" inputProps={{ maxLength: 10 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Mobile Number" value={mobileNumber}
                onChange={e => setMobileNumber(e.target.value)} onBlur={() => setTouched(t => ({ ...t, mobile: true }))}
                error={!!mobileError} helperText={mobileError || 'Optional'}
                placeholder="9876543210" inputProps={{ maxLength: 10 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Designation" value={designation}
                onChange={e => setDesignation(e.target.value)} placeholder="State Coordinator" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Department" value={department}
                onChange={e => setDepartment(e.target.value)} placeholder="Education Department" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="User Email" value={userEmail}
                onChange={e => setUserEmail(e.target.value)} onBlur={() => setTouched(t => ({ ...t, userEmail: true }))}
                error={!!userEmailError} helperText={userEmailError || 'Optional'} type="email" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Contact Email" value={contactEmail}
                onChange={e => setContactEmail(e.target.value)} onBlur={() => setTouched(t => ({ ...t, contactEmail: true }))}
                error={!!contactEmailError} helperText={contactEmailError || 'Required'} type="email" required />
            </Grid>
          </Grid>

          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Set New Password</Typography>
          <TextField fullWidth label="New Password" type="password" value={newPassword}
            onChange={e => setNewPassword(e.target.value)} onBlur={() => setTouched(t => ({ ...t, password: true }))}
            error={touched.password && !pwValidation.isValid} required sx={{ mb: 1 }} />

          <LinearProgress variant="determinate" value={pwValidation.strength}
            sx={{ height: 6, borderRadius: 3, mb: 1, bgcolor: '#E5E7EB',
              '& .MuiLinearProgress-bar': { bgcolor: pwValidation.strength >= 80 ? '#10B981' : pwValidation.strength >= 60 ? '#F59E0B' : '#EF4444' }
            }} />

          {/* Password requirements checklist */}
          <List dense sx={{ mb: 1 }}>
            {[
              { label: 'Min 8 characters', met: newPassword.length >= 8 },
              { label: 'Uppercase letter (A-Z)', met: /[A-Z]/.test(newPassword) },
              { label: 'Lowercase letter (a-z)', met: /[a-z]/.test(newPassword) },
              { label: 'Digit (0-9)', met: /\d/.test(newPassword) },
              { label: 'Special char (!@#$%^&*)', met: /[!@#$%^&*()_+\-=]/.test(newPassword) },
            ].map(rule => (
              <ListItem key={rule.label} sx={{ py: 0, px: 0 }}>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  {rule.met ? <CheckCircleIcon sx={{ fontSize: 16, color: '#10B981' }} /> : <CancelIcon sx={{ fontSize: 16, color: '#D1D5DB' }} />}
                </ListItemIcon>
                <ListItemText primary={rule.label} primaryTypographyProps={{ fontSize: '0.75rem', color: rule.met ? '#374151' : '#9CA3AF' }} />
              </ListItem>
            ))}
          </List>

          <TextField fullWidth label="Confirm Password" type="password" value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)} onBlur={() => setTouched(t => ({ ...t, confirm: true }))}
            error={!!confirmError} helperText={confirmError}
            required sx={{ mb: 3 }} />

          <Button type="submit" variant="contained" fullWidth disabled={loading}
            sx={{ bgcolor: '#5B21B6', py: 1.5, fontWeight: 600, '&:hover': { bgcolor: '#4C1D95' } }}>
            {loading ? 'Setting up...' : 'Complete Setup & Continue'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
