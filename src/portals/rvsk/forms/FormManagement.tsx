import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, TextField, MenuItem, Select, FormControl, InputLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Chip, IconButton, Tooltip, SelectChangeEvent, Snackbar, Alert, CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PublishIcon from '@mui/icons-material/Publish';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { FormStatus } from './types';
import PublishDialog from './PublishDialog';
import apiClient from '../../../services/apiClient';

const STATUS_COLORS: Record<FormStatus, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
  DRAFT: 'default',
  PUBLISHED: 'success',
  CLOSED: 'error',
  EXPIRED: 'warning',
};

interface FormRow {
  id: string;
  title: string;
  status: FormStatus;
  dueDate: string;
  createdDate: string;
  assignedStatesCount: number;
  submittedCount: number;
  totalAssigned: number;
}

export default function FormManagement() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [forms, setForms] = useState<FormRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const loadForms = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: '0', size: '50' };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();
      const res = await apiClient.get('/forms', { params });
      const data = res.data.content || res.data || [];
      setForms(data.map((f: any) => ({
        id: f.id,
        title: f.title,
        status: f.status,
        dueDate: f.dueDate ? f.dueDate.substring(0, 10) : '-',
        createdDate: f.createdDate ? f.createdDate.substring(0, 10) : '-',
        assignedStatesCount: f.assignedStatesCount || 0,
        submittedCount: f.submittedCount || 0,
        totalAssigned: f.totalAssigned || 0,
      })));
    } catch {
      setForms([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => { loadForms(); }, [loadForms]);

  const handlePublish = (formId: string) => {
    setSelectedFormId(formId);
    setPublishDialogOpen(true);
  };

  const handlePublishConfirm = async (states: string[], dueDate: string) => {
    if (!selectedFormId) return;
    try {
      await apiClient.post(`/forms/${selectedFormId}/publish`, {
        stateCodes: states,
        dueDate: dueDate ? `${dueDate}T23:59:59` : null,
      });
      setSnackbar({ open: true, message: 'Form published successfully!', severity: 'success' });
      setPublishDialogOpen(false);
      setSelectedFormId(null);
      loadForms();
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Publish failed', severity: 'error' });
    }
  };

  const handleDelete = async (formId: string) => {
    if (!window.confirm('Are you sure you want to delete this draft form?')) return;
    try {
      await apiClient.delete(`/forms/${formId}`);
      setSnackbar({ open: true, message: 'Form deleted', severity: 'success' });
      loadForms();
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Delete failed', severity: 'error' });
    }
  };

  const handleClose = async (formId: string) => {
    if (!window.confirm('Are you sure you want to close this form? States will no longer be able to submit.')) return;
    try {
      await apiClient.post(`/forms/${formId}/close`);
      setSnackbar({ open: true, message: 'Form closed', severity: 'success' });
      loadForms();
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Close failed', severity: 'error' });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>Form Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/rvsk/form-builder/new')}>
          Create New Form
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          size="small"
          placeholder="Search forms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
          sx={{ width: 300 }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={(e: SelectChangeEvent) => setStatusFilter(e.target.value)}>
            <MenuItem value="ALL">All</MenuItem>
            <MenuItem value="DRAFT">Draft</MenuItem>
            <MenuItem value="PUBLISHED">Published</MenuItem>
            <MenuItem value="CLOSED">Closed</MenuItem>
            <MenuItem value="EXPIRED">Expired</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Forms Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">States</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Responses</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {forms.map((form) => (
                <TableRow key={form.id} hover>
                  <TableCell>{form.title}</TableCell>
                  <TableCell>
                    <Chip label={form.status} size="small" color={STATUS_COLORS[form.status]} />
                  </TableCell>
                  <TableCell>{form.dueDate}</TableCell>
                  <TableCell>{form.createdDate}</TableCell>
                  <TableCell align="center">{form.assignedStatesCount}</TableCell>
                  <TableCell align="center">{form.submittedCount}/{form.totalAssigned}</TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                      {form.status === 'DRAFT' && (
                        <>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => navigate(`/rvsk/form-builder/${form.id}/edit`)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Publish">
                            <IconButton size="small" color="success" onClick={() => handlePublish(form.id)}>
                              <PublishIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => handleDelete(form.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      <Tooltip title="Preview">
                        <IconButton size="small" onClick={() => navigate(`/rvsk/form-builder/${form.id}/preview`)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {form.status === 'PUBLISHED' && (
                        <>
                          <Tooltip title="View Responses">
                            <IconButton size="small" color="primary" onClick={() => navigate(`/rvsk/form-builder/${form.id}/responses`)}>
                              <AssessmentIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Close Form">
                            <IconButton size="small" color="warning" onClick={() => handleClose(form.id)}>
                              <BlockIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      {(form.status === 'CLOSED' || form.status === 'EXPIRED') && (
                        <Tooltip title="View Responses">
                          <IconButton size="small" color="primary" onClick={() => navigate(`/rvsk/form-builder/${form.id}/responses`)}>
                            <AssessmentIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {forms.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No forms found. Click "Create New Form" to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <PublishDialog
        open={publishDialogOpen}
        onClose={() => setPublishDialogOpen(false)}
        onConfirm={handlePublishConfirm}
        formId={selectedFormId}
      />

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
