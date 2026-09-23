import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, Switch,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Snackbar, Alert, CircularProgress, Tooltip, Divider, Stack,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import PaletteIcon from '@mui/icons-material/Palette';
import HistoryIcon from '@mui/icons-material/History';
import { useNavigate } from 'react-router-dom';
import {
  notificationApi,
  NotificationConfig as Cfg,
} from './notificationApi';

const PURPLE = '#5B21B6';

export default function NotificationConfig() {
  const navigate = useNavigate();
  const [configs, setConfigs] = useState<Cfg[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  // Editor dialog state
  const [editing, setEditing] = useState<Cfg | null>(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewMobile, setPreviewMobile] = useState(false);

  // Test-send dialog
  const [testFor, setTestFor] = useState<Cfg | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [testing, setTesting] = useState(false);

  const notify = (message: string, severity: 'success' | 'error' = 'success') =>
    setSnackbar({ open: true, message, severity });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setConfigs(await notificationApi.listConfig());
      setError(null);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load configuration');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (cfg: Cfg) => {
    try {
      const updated = await notificationApi.updateConfig(cfg.eventCode, {
        emailEnabled: !cfg.emailEnabled,
      });
      setConfigs((prev) => prev.map((c) => (c.eventCode === cfg.eventCode ? updated : c)));
      notify(`${cfg.eventName} ${updated.emailEnabled ? 'enabled' : 'disabled'}`);
    } catch (e: any) {
      notify(e?.response?.data?.message || 'Failed to update', 'error');
    }
  };

  const openEditor = async (cfg: Cfg) => {
    setEditing(cfg);
    setSubject(cfg.subjectTemplate ?? cfg.defaultSubject);
    setBody(cfg.bodyTemplate ?? cfg.defaultBody);
    setPreviewHtml('');
    try {
      const p = await notificationApi.preview(cfg.eventCode);
      setPreviewHtml(p.html);
    } catch {
      /* preview is best-effort */
    }
  };

  const tokensFor = (cfg: Cfg | null): string[] => {
    if (!cfg) return [];
    const base = (cfg.allowedTokens || '').split(',').map((t) => t.trim()).filter(Boolean);
    return [...new Set([...base, 'brand_name', 'support_email', 'portal_url'])];
  };

  const insertToken = (token: string) => {
    setBody((b) => `${b}{{${token}}}`);
  };

  const refreshPreview = async () => {
    if (!editing) return;
    try {
      // Save first so preview reflects edits, then fetch server-rendered preview.
      const updated = await notificationApi.updateConfig(editing.eventCode, {
        subjectTemplate: subject,
        bodyTemplate: body,
      });
      setEditing(updated);
      setConfigs((prev) => prev.map((c) => (c.eventCode === updated.eventCode ? updated : c)));
      const p = await notificationApi.preview(editing.eventCode);
      setPreviewHtml(p.html);
      notify('Template saved & preview refreshed');
    } catch (e: any) {
      notify(e?.response?.data?.message || 'Invalid template', 'error');
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const updated = await notificationApi.updateConfig(editing.eventCode, {
        subjectTemplate: subject,
        bodyTemplate: body,
      });
      setConfigs((prev) => prev.map((c) => (c.eventCode === updated.eventCode ? updated : c)));
      notify('Template saved');
      setEditing(null);
    } catch (e: any) {
      notify(e?.response?.data?.message || 'Invalid template', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async (cfg: Cfg) => {
    try {
      const updated = await notificationApi.reset(cfg.eventCode);
      setConfigs((prev) => prev.map((c) => (c.eventCode === updated.eventCode ? updated : c)));
      if (editing?.eventCode === cfg.eventCode) {
        setSubject(updated.subjectTemplate ?? updated.defaultSubject);
        setBody(updated.bodyTemplate ?? updated.defaultBody);
      }
      notify(`${cfg.eventName} reset to default`);
    } catch (e: any) {
      notify(e?.response?.data?.message || 'Reset failed', 'error');
    }
  };

  const doTestSend = async () => {
    if (!testFor || !testEmail) return;
    setTesting(true);
    try {
      const res = await notificationApi.testSend(testFor.eventCode, testEmail);
      notify(res.message, res.success ? 'success' : 'error');
      setTestFor(null);
      setTestEmail('');
    } catch (e: any) {
      notify(e?.response?.data?.message || 'Test send failed', 'error');
    } finally {
      setTesting(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5" fontWeight={700}>Email Notification Configuration</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<PaletteIcon />}
            onClick={() => navigate('/rvsk/admin/notifications/branding')}>
            Branding / Layout
          </Button>
          <Button variant="outlined" startIcon={<HistoryIcon />}
            onClick={() => navigate('/rvsk/admin/notifications/logs')}>
            Logs
          </Button>
        </Stack>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Enable or disable email for each workflow event, and customise the subject and body templates. Changes take effect immediately without redeploying.
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#1E293B' }}>
                {['Event', 'Recipient', 'Email Enabled', 'Template', 'Actions'].map((h) => (
                  <TableCell key={h} sx={{ color: '#fff', fontWeight: 600 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {configs.map((cfg) => (
                <TableRow key={cfg.eventCode} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{cfg.eventName}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>{cfg.eventCode}</Typography>
                  </TableCell>
                  <TableCell><Chip size="small" label={cfg.recipientType} /></TableCell>
                  <TableCell>
                    <Switch checked={cfg.emailEnabled} onChange={() => handleToggle(cfg)} />
                  </TableCell>
                  <TableCell>
                    <Chip size="small" variant="outlined"
                      color={cfg.isCustomized ? 'secondary' : 'default'}
                      label={cfg.isCustomized ? 'Customised' : 'Default'} />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit template & preview">
                      <IconButton size="small" onClick={() => openEditor(cfg)}><EditIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Send a test email">
                      <IconButton size="small" onClick={() => { setTestFor(cfg); setTestEmail(''); }}><SendIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Reset to default">
                      <span><IconButton size="small" disabled={!cfg.isCustomized} onClick={() => handleReset(cfg)}><RestartAltIcon fontSize="small" /></IconButton></span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Template editor */}
      <Dialog open={!!editing} onClose={() => setEditing(null)} maxWidth="lg" fullWidth>
        <DialogTitle>Edit Template — {editing?.eventName}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 3, pt: 1, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 340 }}>
              <TextField label="Subject" fullWidth size="small" sx={{ mb: 2 }}
                value={subject} onChange={(e) => setSubject(e.target.value)} />
              <TextField label="Body (HTML — inner content only)" fullWidth multiline minRows={10}
                value={body} onChange={(e) => setBody(e.target.value)} />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Available placeholders (click to insert):
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {tokensFor(editing).map((t) => (
                  <Chip key={t} size="small" label={`{{${t}}}`} onClick={() => insertToken(t)} sx={{ fontFamily: 'monospace' }} />
                ))}
              </Stack>
            </Box>
            <Box sx={{ flex: 1, minWidth: 340 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2">Branded preview</Typography>
                <Button size="small" onClick={() => setPreviewMobile((m) => !m)}>
                  {previewMobile ? 'Desktop' : 'Mobile'} view
                </Button>
              </Box>
              <Paper variant="outlined" sx={{ p: 1, height: 420, overflow: 'auto', bgcolor: '#f4f5f7' }}>
                <iframe title="preview" srcDoc={previewHtml}
                  style={{ width: previewMobile ? 375 : '100%', height: 640, border: 0, background: '#fff' }} />
              </Paper>
              <Button size="small" onClick={refreshPreview} sx={{ mt: 1 }}>Save & refresh preview</Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button color="inherit" startIcon={<RestartAltIcon />}
            disabled={!editing?.isCustomized}
            onClick={() => editing && handleReset(editing)}>Reset to default</Button>
          <Box sx={{ flex: 1 }} />
          <Button onClick={() => setEditing(null)}>Close</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}
            sx={{ bgcolor: PURPLE, '&:hover': { bgcolor: '#4C1D95' } }}>
            {saving ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Test send */}
      <Dialog open={!!testFor} onClose={() => setTestFor(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Send Test Email — {testFor?.eventName}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Sends the rendered template with sample data. This works regardless of whether the event is enabled.
          </Typography>
          <TextField label="Recipient email" type="email" fullWidth size="small"
            value={testEmail} onChange={(e) => setTestEmail(e.target.value)} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setTestFor(null)}>Cancel</Button>
          <Button variant="contained" startIcon={<SendIcon />} disabled={testing || !testEmail}
            onClick={doTestSend} sx={{ bgcolor: PURPLE, '&:hover': { bgcolor: '#4C1D95' } }}>
            {testing ? <CircularProgress size={20} /> : 'Send Test'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
      <Divider sx={{ mt: 4 }} />
    </Box>
  );
}
