import { useState } from 'react';
import {
  Box, Typography, TextField, Grid, Card, CardContent,
  IconButton, Tooltip,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import BuildIcon from '@mui/icons-material/Build';

interface UploadedFile {
  name: string;
  size: string;
}

export default function Step2Infra() {
  const [roomLength, setRoomLength] = useState<number | ''>(40);
  const [roomWidth, setRoomWidth] = useState<number | ''>(25);
  const [roomHeight, setRoomHeight] = useState<number | ''>(12);

  const [screenLength, setScreenLength] = useState<number | ''>(15);
  const [screenHeight, setScreenHeight] = useState<number | ''>(8);

  const [numWorkstations, setNumWorkstations] = useState<number | ''>(24);

  const [roomPhoto, setRoomPhoto] = useState<UploadedFile | null>({ name: 'room_photo_vsk.jpg', size: '2.4 MB' });
  const [screenPhoto, setScreenPhoto] = useState<UploadedFile | null>(null);
  const [workstationPhoto, setWorkstationPhoto] = useState<UploadedFile | null>(null);

  const UploadZone = ({
    label,
    file,
    onUpload,
    onRemove,
  }: {
    label: string;
    file: UploadedFile | null;
    onUpload: () => void;
    onRemove: () => void;
  }) => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {label}
      </Typography>
      {file ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            border: '1px solid #E2E8F0',
            borderRadius: 2,
            bgcolor: '#F0FDF4',
          }}
        >
          <ImageIcon sx={{ color: '#10B981' }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight={500}>{file.name}</Typography>
            <Typography variant="caption" color="text.secondary">{file.size}</Typography>
          </Box>
          <Tooltip title="Remove file">
            <IconButton size="small" color="error" onClick={onRemove}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ) : (
        <Box
          onClick={onUpload}
          sx={{
            border: '2px dashed #CBD5E1',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: '#7C3AED',
              bgcolor: '#F5F3FF',
            },
          }}
        >
          <CloudUploadIcon sx={{ fontSize: 40, color: '#94A3B8', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Drag & drop or click to upload
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Accepted: JPG, PNG, PDF (up to 15MB)
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 3, color: '#1E293B' }}>
        <BuildIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#7C3AED' }} />
        Infrastructure & Hardware
      </Typography>

      {/* Room Measurements */}
      <Card sx={{ mb: 3, borderRadius: 2, border: '1px solid #E2E8F0' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Room Measurements
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Length (ft)"
                type="number"
                value={roomLength}
                onChange={e => setRoomLength(e.target.value ? Number(e.target.value) : '')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Width (ft)"
                type="number"
                value={roomWidth}
                onChange={e => setRoomWidth(e.target.value ? Number(e.target.value) : '')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Height (ft)"
                type="number"
                value={roomHeight}
                onChange={e => setRoomHeight(e.target.value ? Number(e.target.value) : '')}
              />
            </Grid>
          </Grid>
          <UploadZone
            label="Upload Room Photo"
            file={roomPhoto}
            onUpload={() => setRoomPhoto({ name: 'room_photo_new.jpg', size: '1.8 MB' })}
            onRemove={() => setRoomPhoto(null)}
          />
        </CardContent>
      </Card>

      {/* Screen Measurements */}
      <Card sx={{ mb: 3, borderRadius: 2, border: '1px solid #E2E8F0' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Screen Measurements
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Length (ft)"
                type="number"
                value={screenLength}
                onChange={e => setScreenLength(e.target.value ? Number(e.target.value) : '')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Height (ft)"
                type="number"
                value={screenHeight}
                onChange={e => setScreenHeight(e.target.value ? Number(e.target.value) : '')}
              />
            </Grid>
          </Grid>
          <UploadZone
            label="Upload Screen Photo"
            file={screenPhoto}
            onUpload={() => setScreenPhoto({ name: 'screen_photo.png', size: '3.1 MB' })}
            onRemove={() => setScreenPhoto(null)}
          />
        </CardContent>
      </Card>

      {/* Workstations */}
      <Card sx={{ mb: 3, borderRadius: 2, border: '1px solid #E2E8F0' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Workstations
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Number of Workstations"
                type="number"
                value={numWorkstations}
                onChange={e => setNumWorkstations(e.target.value ? Number(e.target.value) : '')}
              />
            </Grid>
          </Grid>
          <UploadZone
            label="Upload Workstation Photo"
            file={workstationPhoto}
            onUpload={() => setWorkstationPhoto({ name: 'workstations.jpg', size: '4.2 MB' })}
            onRemove={() => setWorkstationPhoto(null)}
          />
        </CardContent>
      </Card>
    </Box>
  );
}
