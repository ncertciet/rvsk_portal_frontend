import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import apiClient from '../../services/apiClient';
import { ADMIN_ROLES } from './constants';

interface RootState {
  auth: {
    user: {
      id: string;
      username: string;
      displayName: string;
      role: string;
    } | null;
  };
}

interface SubCategory {
  code: string;
  label: string;
  sortOrder?: number;
}

interface CategoryNode {
  code: string;
  label: string;
  sortOrder?: number;
  subCategories: SubCategory[];
}

interface FormData {
  code: string;
  label: string;
  sortOrder: number;
  parentCode: string; // empty means it's a parent category
}

const GrievanceCategoryAdmin: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();

  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [formData, setFormData] = useState<FormData>({
    code: '',
    label: '',
    sortOrder: 0,
    parentCode: '',
  });

  // Guard: only Super_Admin and RVSK_Admin
  const isAdmin = user && ADMIN_ROLES.includes(user.role);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/rvsk/grievances');
      return;
    }
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/grievances/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories', err);
      setError('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData({ code: '', label: '', sortOrder: 0, parentCode: '' });
    setEditing(false);
    setError('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (code: string, label: string, sortOrder: number, parentCode: string) => {
    setFormData({ code, label, sortOrder, parentCode });
    setEditing(true);
    setError('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.code.trim() || !formData.label.trim()) {
      setError('Code and Label are required.');
      return;
    }

    try {
      if (editing) {
        await apiClient.put(`/grievances/categories/${formData.code}`, {
          label: formData.label.trim(),
          sortOrder: formData.sortOrder,
          parentCode: formData.parentCode || null,
        });
      } else {
        await apiClient.post('/grievances/categories', {
          code: formData.code.trim(),
          label: formData.label.trim(),
          sortOrder: formData.sortOrder,
          parentCode: formData.parentCode || null,
        });
      }
      setDialogOpen(false);
      setSuccessMsg(editing ? 'Category updated successfully.' : 'Category added successfully.');
      fetchCategories();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to save category.';
      setError(message);
    }
  };

  if (!isAdmin) return null;

  // Flatten categories for table display
  const flatRows: { code: string; label: string; sortOrder: number; parentCode: string; type: string }[] = [];
  categories.forEach((cat) => {
    flatRows.push({ code: cat.code, label: cat.label, sortOrder: cat.sortOrder || 0, parentCode: '', type: 'Parent' });
    (cat.subCategories || []).forEach((sub) => {
      flatRows.push({ code: sub.code, label: sub.label, sortOrder: sub.sortOrder || 0, parentCode: cat.code, type: 'Sub' });
    });
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Grievance Categories
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}>
          Add Category
        </Button>
      </Box>

      {successMsg && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMsg('')}>
          {successMsg}
        </Alert>
      )}

      {/* Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Label</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Parent</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Sort Order</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : flatRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No categories found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                flatRows.map((row) => (
                  <TableRow key={`${row.parentCode}-${row.code}`} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>{row.code}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ pl: row.type === 'Sub' ? 2 : 0 }}>
                        {row.type === 'Sub' ? '↳ ' : ''}{row.label}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.type}
                        size="small"
                        color={row.type === 'Parent' ? 'primary' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {row.parentCode || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>{row.sortOrder}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEdit(row.code, row.label, row.sortOrder, row.parentCode)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Category' : 'Add Category'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2, mt: 1 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              disabled={editing}
              required
              fullWidth
              helperText={editing ? 'Code cannot be changed' : 'Unique identifier (e.g., INFRA, ACADEMIC)'}
            />
            <TextField
              label="Label"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Sort Order"
              type="number"
              value={formData.sortOrder}
              onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Parent Category (leave empty for top-level)</InputLabel>
              <Select
                value={formData.parentCode}
                label="Parent Category (leave empty for top-level)"
                onChange={(e) => setFormData({ ...formData, parentCode: e.target.value })}
                disabled={editing}
              >
                <MenuItem value="">None (Top-Level)</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.code} value={cat.code}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editing ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GrievanceCategoryAdmin;
