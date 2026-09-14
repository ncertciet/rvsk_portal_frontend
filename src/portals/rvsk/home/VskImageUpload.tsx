import { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Button, TextField, Card, CardContent, Grid,
  IconButton, Snackbar, Alert, LinearProgress, Avatar, Tooltip,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import { GalleryImage } from './types';
import { fetchGalleryImages, uploadGalleryImage, deleteGalleryImage } from './homeApi';
import { getApiErrorMessage } from '../../../services/apiError';

export default function VskImageUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadImages();
  }, []);

  async function loadImages() {
    try {
      const data = await fetchGalleryImages();
      setImages(data);
    } catch (err) {
      setImages([]);
      setSnackbar({ open: true, message: getApiErrorMessage(err, 'Failed to load gallery images'), severity: 'error' });
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(selected.type)) {
      setSnackbar({ open: true, message: 'Only JPEG, PNG, and WebP images are allowed', severity: 'error' });
      return;
    }

    setFile(selected);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(selected);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      await uploadGalleryImage(file, caption);
      setSnackbar({ open: true, message: 'Image uploaded successfully', severity: 'success' });
      setFile(null);
      setPreview(null);
      setCaption('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      await loadImages();
    } catch {
      setSnackbar({ open: true, message: 'Failed to upload image. Please try again.', severity: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteGalleryImage(id);
      setSnackbar({ open: true, message: 'Image deleted successfully', severity: 'success' });
      setImages((prev) => prev.filter((img) => img.id !== id));
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete image', severity: 'error' });
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h6" fontWeight={600} color="#1E293B" sx={{ mb: 3 }}>
        Upload VSK Gallery Image
      </Typography>

      {/* Upload Form */}
      <Card sx={{ borderRadius: 2, border: '1px solid #F1F5F9', mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* File Input */}
            <Box>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="gallery-image-input"
              />
              <label htmlFor="gallery-image-input">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  sx={{ textTransform: 'none' }}
                >
                  Choose Image
                </Button>
              </label>
              {file && (
                <Typography variant="caption" sx={{ ml: 2, color: '#475569' }}>
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </Typography>
              )}
            </Box>

            {/* Image Preview */}
            {preview && (
              <Box
                sx={{
                  width: '100%',
                  maxWidth: 300,
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '1px solid #E2E8F0',
                }}
              >
                <img
                  src={preview}
                  alt="Preview"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </Box>
            )}

            {/* Caption */}
            <TextField
              label="Caption (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              size="small"
              fullWidth
              sx={{ maxWidth: 400 }}
              placeholder="e.g., VSK Rajasthan Inauguration Ceremony"
            />

            {/* Upload Button */}
            <Box>
              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={!file || uploading}
                startIcon={<CloudUploadIcon />}
                sx={{
                  bgcolor: '#7C3AED',
                  '&:hover': { bgcolor: '#6D28D9' },
                  textTransform: 'none',
                }}
              >
                {uploading ? 'Uploading...' : 'Upload Image'}
              </Button>
            </Box>

            {/* Progress */}
            {uploading && <LinearProgress sx={{ mt: 1, borderRadius: 1 }} />}
          </Box>
        </CardContent>
      </Card>

      {/* Uploaded Images Grid */}
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
        Your Uploaded Images
      </Typography>

      {images.length > 0 ? (
        <Grid container spacing={2}>
          {images.map((img) => (
            <Grid item xs={6} sm={4} md={3} key={img.id}>
              <Card sx={{ borderRadius: 2, border: '1px solid #F1F5F9', position: 'relative' }}>
                <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <Avatar
                    src={img.thumbnailUrl || img.imageUrl}
                    alt={img.caption}
                    variant="rounded"
                    sx={{ width: 80, height: 80 }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }} noWrap>
                    {img.caption || img.stateName}
                  </Typography>
                  <Tooltip title="Delete image">
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(img.id)}
                      sx={{ color: '#EF4444', '&:hover': { bgcolor: '#FEF2F2' } }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <ImageIcon sx={{ fontSize: 48, color: '#CBD5E1', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            No images uploaded yet
          </Typography>
        </Box>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
