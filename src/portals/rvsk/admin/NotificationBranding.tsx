import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Button, TextField, Snackbar, Alert,
  CircularProgress, Grid,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { notificationApi, EmailLayout } from './notificationApi';

const PURPLE = '#5B21B6';

export default function NotificationBranding() {
  const navigate = useNavigate();
  const [layout, setLayout] = useState<EmailLayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const [form, setForm] = useState({
    logoUrl: '', brandName: '', primaryColor: '#0b5394', footerHtml: '', supportEmail: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const l = await notificationApi.getLayout();
      setLayout(l);
      setForm({
        logoUrl: l?.logoUrl ?? '',
        brandName: l?.brandName ?? '',
        primaryColor: l?.primaryColor ?? '#0b5394',
        footerHtml: l?.footerHtml ?? '',
        supportEmail: l?.supportEmail ?? '',
      });
    } catch (e: any) {
      setSnackbar({ open: true, message: e?.response?.data?.message || 'Failed to load layout', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await notificationApi.updateLayout(form);
      setLayout(updated);
      setSnackbar({ open: true, message: 'Branding saved — applies to all events', severity: 'success' });
    } catch (e: any) {
      setSnackbar({ open: true, message: e?.response?.data?.message || 'Save failed', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/rvsk/admin/notifications')} sx={{ mb: 1 }}>
        Back to Notifications
      </Button>
      <Typography variant="h5" fontWeight={700}>Email Branding / Layout</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        This shared layout wraps every notification email. One change re-brands all events.
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <TextField label="Brand name" fullWidth size="small" sx={{ mb: 2 }}
                value={form.brandName} onChange={(e) => setForm((f) => ({ ...f, brandName: e.target.value }))} />
              <TextField label="Logo URL (hosted absolute URL)" fullWidth size="small" sx={{ mb: 2 }}
                value={form.logoUrl} onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))}
                helperText="e.g. http://<host>/api/v1/branding/logo" />
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                <TextField label="Primary color" size="small" sx={{ flex: 1 }}
                  value={form.primaryColor} onChange={(e) => setForm((f) => ({ ...f, primaryColor: e.target.value }))} />
                <input type="color" value={form.primaryColor}
                  onChange={(e) => setForm((f) => ({ ...f, primaryColor: e.target.value }))}
                  style={{ width: 44, height: 40, border: 'none', background: 'none' }} />
              </Box>
              <TextField label="Support email" fullWidth size="small" sx={{ mb: 2 }}
                value={form.supportEmail} onChange={(e) => setForm((f) => ({ ...f, supportEmail: e.target.value }))} />
              <TextField label="Footer text / HTML" fullWidth size="small" multiline minRows={3}
                value={form.footerHtml} onChange={(e) => setForm((f) => ({ ...f, footerHtml: e.target.value }))} />
              <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ mt: 3, bgcolor: PURPLE, '&:hover': { bgcolor: '#4C1D95' } }}>
                {saving ? <CircularProgress size={20} /> : 'Save Branding'}
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Header preview</Typography>
            <Paper variant="outlined" sx={{ overflow: 'hidden', borderRadius: 2 }}>
              <Box sx={{ bgcolor: form.primaryColor || '#0b5394', p: 2.5 }}>
                {form.logoUrl ? (
                  <img src={form.logoUrl} alt={form.brandName || 'Logo'} style={{ height: 40 }} />
                ) : (
                  <Typography sx={{ color: '#fff', fontWeight: 700 }}>{form.brandName || 'RVSK Portal'}</Typography>
                )}
              </Box>
              <Box sx={{ p: 3, fontSize: 14, color: '#444' }}>
                <em>Event content appears here…</em>
              </Box>
              <Box sx={{ p: 2, bgcolor: '#fafafa', borderTop: '1px solid #eee', fontSize: 12, color: '#888' }}
                dangerouslySetInnerHTML={{ __html: form.footerHtml || 'Automated message.' }} />
            </Paper>
            {layout && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Last updated: {new Date(layout.updatedAt).toLocaleString()}
              </Typography>
            )}
          </Grid>
        </Grid>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
