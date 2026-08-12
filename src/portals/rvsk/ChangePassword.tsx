import { useState } from 'react';
import { Box, Typography, Paper, TextField, Button, Alert, LinearProgress, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import apiClient from '../../services/apiClient';
import { validatePassword } from '../../utils/validators';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const pwValidation = validatePassword(newPassword);
  const confirmError = touched.confirm && newPassword !== confirmPassword ? 'Passwords do not match' : null;
  const currentError = touched.current && !currentPassword ? 'Current password is required' : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setTouched({ current: true, password: true, confirm: true });

    if (!currentPassword) { setError('Current password is required'); return; }
    if (!pwValidation.isValid) { setError('New password does not meet the requirements'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    if (newPassword === currentPassword) { setError('New password must be different from current password'); return; }

    setLoading(true);
    try {
      await apiClient.post('/auth/change-password', { currentPassword, newPassword });
      setSuccess('Password changed successfully!');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setTouched({});
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to change password');
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>Change Password</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Current Password" type="password" value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)} onBlur={() => setTouched(t => ({ ...t, current: true }))}
            error={!!currentError} helperText={currentError}
            required sx={{ mb: 2 }} />

          <TextField fullWidth label="New Password" type="password" value={newPassword}
            onChange={e => setNewPassword(e.target.value)} onBlur={() => setTouched(t => ({ ...t, password: true }))}
            error={touched.password && !pwValidation.isValid}
            required sx={{ mb: 1 }} />

          <LinearProgress variant="determinate" value={pwValidation.strength}
            sx={{ height: 6, borderRadius: 3, mb: 1, bgcolor: '#E5E7EB',
              '& .MuiLinearProgress-bar': { bgcolor: pwValidation.strength >= 80 ? '#10B981' : pwValidation.strength >= 60 ? '#F59E0B' : '#EF4444' }
            }} />

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

          <TextField fullWidth label="Confirm New Password" type="password" value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)} onBlur={() => setTouched(t => ({ ...t, confirm: true }))}
            error={!!confirmError} helperText={confirmError}
            required sx={{ mb: 3 }} />

          <Button type="submit" variant="contained" fullWidth disabled={loading}
            sx={{ bgcolor: '#5B21B6', py: 1.5, '&:hover': { bgcolor: '#4C1D95' } }}>
            {loading ? 'Changing...' : 'Change Password'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
