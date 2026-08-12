import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  LinearProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import apiClient from '../../services/apiClient';
import {
  MAX_SUBJECT_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
} from './constants';

interface RootState {
  auth: {
    user: {
      id: string;
      username: string;
      displayName: string;
      role: string;
      stateCode: string | null;
      districtCode: string | null;
    } | null;
  };
}

interface CategoryNode {
  code: string;
  label: string;
  subCategories: { code: string; label: string }[];
}

const RaiseGrievance: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();

  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successDialog, setSuccessDialog] = useState(false);
  const [createdId, setCreatedId] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get('/grievances/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const selectedCategory = categories.find((c) => c.code === category);
  const subCategories = selectedCategory?.subCategories || [];

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);

    for (const file of newFiles) {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setError('Only PDF, JPG, PNG, DOC, DOCX files are allowed.');
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError(`File "${file.name}" exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
        return;
      }
    }

    setFiles((prev) => [...prev, ...newFiles]);
    setError('');
    // Reset input
    e.target.value = '';
  };

  const handleFileRemove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!category || !subject.trim()) {
      setError('Category and Subject are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create grievance
      const res = await apiClient.post('/grievances', {
        category,
        subCategory: subCategory || null,
        subject: subject.trim(),
        description: description.trim() || null,
      });

      const grievanceUuid = res.data.id;
      setCreatedId(res.data.grievanceId);

      // Upload files if any (non-blocking — grievance is already created)
      if (files.length > 0) {
        try {
          for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);
            await apiClient.post(`/grievances/${grievanceUuid}/attachments`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
          }
        } catch (uploadErr) {
          console.error('File upload failed, but grievance was created successfully', uploadErr);
        }
      }

      setSuccessDialog(true);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to submit grievance. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Raise a Grievance
      </Typography>

      {/* User Info Card */}
      <Card elevation={0} sx={{ border: '1px solid #E5E7EB', mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Submitting As
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">Name</Typography>
              <Typography variant="body1" fontWeight={500}>{user?.displayName || user?.username}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">Role</Typography>
              <Typography variant="body1" fontWeight={500}>{user?.role?.replace(/_/g, ' ')}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">State</Typography>
              <Typography variant="body1" fontWeight={500}>{user?.stateCode || 'N/A'}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Form */}
      <Paper sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Category */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                label="Category"
                onChange={(e) => {
                  setCategory(e.target.value);
                  setSubCategory('');
                }}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.code} value={cat.code}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Sub-Category */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth disabled={subCategories.length === 0}>
              <InputLabel>Sub-Category</InputLabel>
              <Select
                value={subCategory}
                label="Sub-Category"
                onChange={(e) => setSubCategory(e.target.value)}
              >
                <MenuItem value="">None</MenuItem>
                {subCategories.map((sub) => (
                  <MenuItem key={sub.code} value={sub.code}>
                    {sub.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Subject */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Subject"
              placeholder="Brief description of your grievance"
              value={subject}
              onChange={(e) => setSubject(e.target.value.slice(0, MAX_SUBJECT_LENGTH))}
              helperText={`${subject.length}/${MAX_SUBJECT_LENGTH}`}
              inputProps={{ maxLength: MAX_SUBJECT_LENGTH }}
            />
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={5}
              label="Description"
              placeholder="Provide detailed information about your grievance..."
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESCRIPTION_LENGTH))}
              helperText={`${description.length}/${MAX_DESCRIPTION_LENGTH}`}
              inputProps={{ maxLength: MAX_DESCRIPTION_LENGTH }}
            />
          </Grid>

          {/* File Upload */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Attachments (Optional)
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Allowed: PDF, JPG, PNG, DOC, DOCX (Max {MAX_FILE_SIZE_MB}MB each)
            </Typography>

            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              sx={{ mb: 1 }}
            >
              Upload File
              <input
                type="file"
                hidden
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileAdd}
              />
            </Button>

            {files.length > 0 && (
              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {files.map((file, idx) => (
                  <Chip
                    key={idx}
                    label={`${file.name} (${(file.size / 1024).toFixed(0)} KB)`}
                    onDelete={() => handleFileRemove(idx)}
                    deleteIcon={<DeleteIcon />}
                    variant="outlined"
                  />
                ))}
              </Box>
            )}
          </Grid>
        </Grid>

        {/* Submit */}
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={loading || !category || !subject.trim()}
          >
            {loading ? 'Submitting...' : 'Submit Grievance'}
          </Button>
          <Button variant="outlined" size="large" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </Box>

        {loading && <LinearProgress sx={{ mt: 2 }} />}
      </Paper>

      {/* Success Dialog */}
      <Dialog open={successDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
          <CheckCircleIcon sx={{ fontSize: 64, color: '#10B981' }} />
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
            Grievance Submitted Successfully
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            Your grievance has been registered with ID:
          </Typography>
          <Typography variant="h6" fontWeight={700} color="primary">
            {createdId}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            You will be notified once a response is provided.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button variant="contained" onClick={() => navigate('/rvsk/grievances/list')}>
            View My Grievances
          </Button>
          <Button variant="outlined" onClick={() => navigate('/rvsk/grievances')}>
            Dashboard
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RaiseGrievance;
