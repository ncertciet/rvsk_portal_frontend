import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Snackbar, Alert, CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import apiClient from '../../../services/apiClient';

interface Module {
  id: string;
  moduleCode: string;
  moduleName: string;
  icon: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Fallback data when backend is unavailable
const FALLBACK_MODULES: Module[] = [
  { id: '1', moduleCode: 'HOME', moduleName: 'Home', icon: 'Home', displayOrder: 1, isActive: true, createdAt: '', updatedAt: '' },
  { id: '2', moduleCode: 'ATTENDANCE', moduleName: 'Attendance', icon: 'EventAvailable', displayOrder: 2, isActive: true, createdAt: '', updatedAt: '' },
  { id: '3', moduleCode: 'ASSESSMENT', moduleName: 'Assessment', icon: 'Assessment', displayOrder: 3, isActive: true, createdAt: '', updatedAt: '' },
  { id: '4', moduleCode: 'SCHEMES', moduleName: 'Schemes', icon: 'AccountBalance', displayOrder: 4, isActive: true, createdAt: '', updatedAt: '' },
  { id: '5', moduleCode: 'ADMINISTRATION', moduleName: 'Administration', icon: 'AdminPanelSettings', displayOrder: 5, isActive: true, createdAt: '', updatedAt: '' },
  { id: '6', moduleCode: 'ACCREDITATION', moduleName: 'Accreditation', icon: 'VerifiedUser', displayOrder: 6, isActive: false, createdAt: '', updatedAt: '' },
];

export default function ModuleManagement() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editModule, setEditModule] = useState<Module | null>(null);
  const [form, setForm] = useState({ moduleCode: '', moduleName: '', icon: '', displayOrder: '' });
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const fetchModules = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const res = await apiClient.get('/modules?includeInactive=true');
      const data = res.data;
      console.log('[ModuleAdmin] API response status:', res.status, 'data:', data);
      if (Array.isArray(data) && data.length > 0) {
        setModules(data);
      } else {
        console.warn('[ModuleAdmin] API returned empty, using fallback');
        setApiError('API returned empty');
        setModules(FALLBACK_MODULES);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.status || err?.message || 'Failed to load modules';
      console.error('[ModuleAdmin] API failed:', msg, err?.response?.status);
      setApiError(String(msg));
      setModules(FALLBACK_MODULES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchModules(); }, []);

  const handleOpenCreate = () => {
    setEditModule(null);
    setForm({ moduleCode: '', moduleName: '', icon: '', displayOrder: '' });
    setDialogOpen(true);
  };

  const handleOpenEdit = (mod: Module) => {
    setEditModule(mod);
    setForm({ moduleCode: mod.moduleCode, moduleName: mod.moduleName, icon: mod.icon, displayOrder: String(mod.displayOrder) });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.moduleCode || !form.moduleName) return;
    setSaving(true);
    try {
      if (editModule) {
        await apiClient.put('/modules/' + editModule.id, {
          moduleCode: form.moduleCode,
          moduleName: form.moduleName,
          icon: form.icon,
          displayOrder: Number(form.displayOrder) || editModule.displayOrder,
        });
        setSnackbar({ open: true, message: 'Module updated successfully', severity: 'success' });
      } else {
        await apiClient.post('/modules', {
          moduleCode: form.moduleCode.toUpperCase(),
          moduleName: form.moduleName,
          icon: form.icon || 'FolderIcon',
          displayOrder: Number(form.displayOrder) || modules.length + 1,
        });
        setSnackbar({ open: true, message: 'Module created successfully', severity: 'success' });
      }
      setDialogOpen(false);
      await fetchModules();
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Operation failed', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (mod: Module) => {
    try {
      await apiClient.patch('/modules/' + mod.id + (mod.isActive ? '/deactivate' : '/activate'));
      setSnackbar({ open: true, message: `Module ${mod.isActive ? 'deactivated' : 'activated'}`, severity: 'success' });
      await fetchModules();
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Operation failed', severity: 'error' });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5" fontWeight={700}>Module Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}
          sx={{ bgcolor: '#5B21B6', '&:hover': { bgcolor: '#4C1D95' } }}>
          Create Module
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage portal navigation modules. Modules appear as top-level groups in the sidebar.
      </Typography>

      {apiError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Backend API unavailable — showing demo data. Error: {apiError}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 4 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#1E293B' }}>
                {['#', 'Module Code', 'Module Name', 'Icon', 'Display Order', 'Status', 'Actions'].map(h => (
                  <TableCell key={h} sx={{ color: '#fff', fontWeight: 600 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {modules.sort((a, b) => a.displayOrder - b.displayOrder).map((mod, idx) => (
                <TableRow key={mod.id} hover>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{mod.moduleCode}</TableCell>
                  <TableCell>{mod.moduleName}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{mod.icon}</TableCell>
                  <TableCell align="center">{mod.displayOrder}</TableCell>
                  <TableCell>
                    <Chip label={mod.isActive ? 'Active' : 'Inactive'} size="small"
                      color={mod.isActive ? 'success' : 'error'} />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" title="Edit" onClick={() => handleOpenEdit(mod)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" title={mod.isActive ? 'Deactivate' : 'Activate'} onClick={() => handleToggleActive(mod)}>
                      {mod.isActive ? <BlockIcon fontSize="small" color="error" /> : <CheckCircleIcon fontSize="small" color="success" />}
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {modules.length === 0 && (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}>No modules found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editModule ? 'Edit Module' : 'Create Module'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField label="Module Code" size="small" value={form.moduleCode}
            onChange={e => setForm(prev => ({ ...prev, moduleCode: e.target.value }))}
            disabled={!!editModule} helperText={editModule ? 'Code cannot be changed' : 'e.g. ATTENDANCE'} />
          <TextField label="Module Name" size="small" value={form.moduleName}
            onChange={e => setForm(prev => ({ ...prev, moduleName: e.target.value }))} />
          <TextField label="Icon" size="small" value={form.icon}
            onChange={e => setForm(prev => ({ ...prev, icon: e.target.value }))}
            helperText="MUI icon component name (e.g. SchoolIcon)" />
          <TextField label="Display Order" size="small" type="number" value={form.displayOrder}
            onChange={e => setForm(prev => ({ ...prev, displayOrder: e.target.value }))} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}
            sx={{ bgcolor: '#5B21B6', '&:hover': { bgcolor: '#4C1D95' } }}>
            {saving ? <CircularProgress size={20} /> : editModule ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
