import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem,
  Snackbar, Alert, CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import apiClient from '../../../services/apiClient';

interface ModuleOption {
  id: string;
  moduleCode: string;
  moduleName: string;
}

interface Page {
  id: string;
  moduleId: string;
  moduleCode: string;
  pageCode: string;
  pageName: string;
  routePath: string;
  icon: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Fallback data when backend is unavailable
const FALLBACK_MODULES: ModuleOption[] = [
  { id: 'mod-1', moduleCode: 'HOME', moduleName: 'Home' },
  { id: 'mod-2', moduleCode: 'ATTENDANCE', moduleName: 'Attendance' },
  { id: 'mod-3', moduleCode: 'ASSESSMENT', moduleName: 'Assessment' },
  { id: 'mod-4', moduleCode: 'SCHEMES', moduleName: 'Schemes' },
  { id: 'mod-5', moduleCode: 'ADMINISTRATION', moduleName: 'Administration' },
  { id: 'mod-6', moduleCode: 'ACCREDITATION', moduleName: 'Accreditation' },
];

const FALLBACK_PAGES: Record<string, Page[]> = {
  'mod-1': [
    { id: 'p1', moduleId: 'mod-1', moduleCode: 'HOME', pageCode: 'DASHBOARD', pageName: 'Dashboard', routePath: '/dashboard', icon: 'Dashboard', displayOrder: 1, isActive: true, createdAt: '', updatedAt: '' },
  ],
  'mod-2': [
    { id: 'p2', moduleId: 'mod-2', moduleCode: 'ATTENDANCE', pageCode: 'SUMMARY', pageName: 'Summary', routePath: '/attendance/summary', icon: 'Summarize', displayOrder: 1, isActive: true, createdAt: '', updatedAt: '' },
    { id: 'p3', moduleId: 'mod-2', moduleCode: 'ATTENDANCE', pageCode: 'DETAILED_DATA', pageName: 'Detailed Data', routePath: '/attendance/detailed-data', icon: 'TableChart', displayOrder: 2, isActive: true, createdAt: '', updatedAt: '' },
    { id: 'p4', moduleId: 'mod-2', moduleCode: 'ATTENDANCE', pageCode: 'TRENDS', pageName: 'Trends', routePath: '/attendance/trends', icon: 'TrendingUp', displayOrder: 3, isActive: true, createdAt: '', updatedAt: '' },
  ],
  'mod-3': [
    { id: 'p5', moduleId: 'mod-3', moduleCode: 'ASSESSMENT', pageCode: 'SUMMARY', pageName: 'Summary', routePath: '/assessment/summary', icon: 'Summarize', displayOrder: 1, isActive: true, createdAt: '', updatedAt: '' },
  ],
  'mod-4': [
    { id: 'p6', moduleId: 'mod-4', moduleCode: 'SCHEMES', pageCode: 'PMSHRI', pageName: 'PM SHRI', routePath: '/schemes/pmshri', icon: 'Star', displayOrder: 1, isActive: true, createdAt: '', updatedAt: '' },
    { id: 'p7', moduleId: 'mod-4', moduleCode: 'SCHEMES', pageCode: 'MICRO_IMPROVEMENT', pageName: 'Micro Improvement', routePath: '/schemes/micro-improvement', icon: 'TipsAndUpdates', displayOrder: 2, isActive: true, createdAt: '', updatedAt: '' },
  ],
  'mod-5': [
    { id: 'p8', moduleId: 'mod-5', moduleCode: 'ADMINISTRATION', pageCode: 'USER_MGMT', pageName: 'User Management', routePath: '/admin/users', icon: 'People', displayOrder: 1, isActive: true, createdAt: '', updatedAt: '' },
    { id: 'p9', moduleId: 'mod-5', moduleCode: 'ADMINISTRATION', pageCode: 'PERMISSIONS', pageName: 'Permissions', routePath: '/admin/permissions', icon: 'Security', displayOrder: 2, isActive: true, createdAt: '', updatedAt: '' },
    { id: 'p10', moduleId: 'mod-5', moduleCode: 'ADMINISTRATION', pageCode: 'FORM_BUILDER', pageName: 'Form Builder', routePath: '/admin/form-builder', icon: 'DynamicForm', displayOrder: 3, isActive: true, createdAt: '', updatedAt: '' },
  ],
  'mod-6': [
    { id: 'p11', moduleId: 'mod-6', moduleCode: 'ACCREDITATION', pageCode: 'DASHBOARD', pageName: 'Dashboard', routePath: '/accreditation/dashboard', icon: 'Dashboard', displayOrder: 1, isActive: true, createdAt: '', updatedAt: '' },
  ],
};

export default function PageManagement() {
  const [modules, setModules] = useState<ModuleOption[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [loading, setLoading] = useState(true);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editPage, setEditPage] = useState<Page | null>(null);
  const [form, setForm] = useState({ moduleId: '', pageCode: '', pageName: '', routePath: '', icon: '', displayOrder: '' });
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  // Fetch modules for dropdown
  const fetchModules = async () => {
    try {
      const res = await apiClient.get('/modules?includeInactive=true');
      const mods: ModuleOption[] = (res.data || []).map((m: any) => ({ id: m.id, moduleCode: m.moduleCode, moduleName: m.moduleName }));
      setModules(mods);
      if (mods.length > 0 && !selectedModuleId) {
        setSelectedModuleId(mods[0].id);
      }
      setApiError(null);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to load modules';
      setApiError(msg);
      // Use fallback data
      setModules(FALLBACK_MODULES);
      setSelectedModuleId(FALLBACK_MODULES[0].id);
      setSnackbar({ open: true, message: `API unavailable — showing demo data. (${msg})`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch pages for selected module
  const fetchPages = async (moduleId: string) => {
    if (!moduleId) return;
    setPagesLoading(true);
    try {
      const res = await apiClient.get(`/pages?moduleId=${moduleId}&includeInactive=true`);
      setPages(res.data || []);
    } catch (err: any) {
      // Use fallback data if API unavailable
      const fallback = FALLBACK_PAGES[moduleId] || [];
      setPages(fallback);
    } finally {
      setPagesLoading(false);
    }
  };

  useEffect(() => { fetchModules(); }, []);

  useEffect(() => {
    if (selectedModuleId) {
      fetchPages(selectedModuleId);
    }
  }, [selectedModuleId]);

  const filteredPages = pages.sort((a, b) => a.displayOrder - b.displayOrder);

  const handleOpenCreate = () => {
    setEditPage(null);
    setForm({ moduleId: selectedModuleId, pageCode: '', pageName: '', routePath: '', icon: '', displayOrder: '' });
    setDialogOpen(true);
  };

  const handleOpenEdit = (page: Page) => {
    setEditPage(page);
    setForm({
      moduleId: page.moduleId,
      pageCode: page.pageCode,
      pageName: page.pageName,
      routePath: page.routePath,
      icon: page.icon,
      displayOrder: String(page.displayOrder),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.pageCode || !form.pageName || !form.routePath) return;
    setSaving(true);
    try {
      if (editPage) {
        await apiClient.put('/pages/' + editPage.id, {
          moduleId: form.moduleId,
          pageCode: form.pageCode,
          pageName: form.pageName,
          routePath: form.routePath,
          icon: form.icon,
          displayOrder: Number(form.displayOrder) || editPage.displayOrder,
        });
        setSnackbar({ open: true, message: 'Page updated successfully', severity: 'success' });
      } else {
        await apiClient.post('/pages', {
          moduleId: form.moduleId || selectedModuleId,
          pageCode: form.pageCode.toUpperCase(),
          pageName: form.pageName,
          routePath: form.routePath,
          icon: form.icon || 'PageIcon',
          displayOrder: Number(form.displayOrder) || filteredPages.length + 1,
        });
        setSnackbar({ open: true, message: 'Page created successfully', severity: 'success' });
      }
      setDialogOpen(false);
      await fetchPages(selectedModuleId);
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Operation failed', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (page: Page) => {
    try {
      await apiClient.patch('/pages/' + page.id + (page.isActive ? '/deactivate' : '/activate'));
      setSnackbar({ open: true, message: `Page ${page.isActive ? 'deactivated' : 'activated'}`, severity: 'success' });
      await fetchPages(selectedModuleId);
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Operation failed', severity: 'error' });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5" fontWeight={700}>Page Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}
          disabled={!selectedModuleId}
          sx={{ bgcolor: '#5B21B6', '&:hover': { bgcolor: '#4C1D95' } }}>
          Create Page
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage pages within modules. Pages appear as navigation items in the sidebar.
      </Typography>

      {/* Module Filter */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {apiError && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Backend API unavailable — showing demo data. Error: {apiError}
            </Alert>
          )}

          <Paper sx={{ p: 2, mb: 3 }}>
            <FormControl size="small" sx={{ minWidth: 250 }}>
              <InputLabel>Filter by Module</InputLabel>
              <Select value={selectedModuleId} label="Filter by Module" onChange={e => setSelectedModuleId(e.target.value)}>
                {modules.map(m => (
                  <MenuItem key={m.id} value={m.id}>{m.moduleCode} — {m.moduleName}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>

          {pagesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ borderRadius: 4 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#1E293B' }}>
                    {['#', 'Page Code', 'Page Name', 'Route Path', 'Icon', 'Display Order', 'Status', 'Actions'].map(h => (
                      <TableCell key={h} sx={{ color: '#fff', fontWeight: 600 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPages.map((page, idx) => (
                    <TableRow key={page.id} hover>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{page.pageCode}</TableCell>
                      <TableCell>{page.pageName}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{page.routePath}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{page.icon}</TableCell>
                      <TableCell align="center">{page.displayOrder}</TableCell>
                      <TableCell>
                        <Chip label={page.isActive ? 'Active' : 'Inactive'} size="small"
                          color={page.isActive ? 'success' : 'error'} />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" title="Edit" onClick={() => handleOpenEdit(page)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" title={page.isActive ? 'Deactivate' : 'Activate'} onClick={() => handleToggleActive(page)}>
                          {page.isActive ? <BlockIcon fontSize="small" color="error" /> : <CheckCircleIcon fontSize="small" color="success" />}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredPages.length === 0 && (
                    <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4 }}>No pages found for this module</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editPage ? 'Edit Page' : 'Create Page'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <FormControl size="small" fullWidth>
            <InputLabel>Module</InputLabel>
            <Select value={form.moduleId} label="Module"
              onChange={e => setForm(prev => ({ ...prev, moduleId: e.target.value }))}>
              {modules.map(m => (
                <MenuItem key={m.id} value={m.id}>{m.moduleCode} — {m.moduleName}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Page Code" size="small" value={form.pageCode}
            onChange={e => setForm(prev => ({ ...prev, pageCode: e.target.value }))}
            disabled={!!editPage} helperText={editPage ? 'Code cannot be changed' : 'e.g. SUMMARY'} />
          <TextField label="Page Name" size="small" value={form.pageName}
            onChange={e => setForm(prev => ({ ...prev, pageName: e.target.value }))} />
          <TextField label="Route Path" size="small" value={form.routePath}
            onChange={e => setForm(prev => ({ ...prev, routePath: e.target.value }))}
            helperText="e.g. /rvsk/dashboard/attendance/summary" />
          <TextField label="Icon" size="small" value={form.icon}
            onChange={e => setForm(prev => ({ ...prev, icon: e.target.value }))}
            helperText="MUI icon component name (e.g. SummarizeIcon)" />
          <TextField label="Display Order" size="small" type="number" value={form.displayOrder}
            onChange={e => setForm(prev => ({ ...prev, displayOrder: e.target.value }))} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}
            sx={{ bgcolor: '#5B21B6', '&:hover': { bgcolor: '#4C1D95' } }}>
            {saving ? <CircularProgress size={20} /> : editPage ? 'Update' : 'Create'}
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
