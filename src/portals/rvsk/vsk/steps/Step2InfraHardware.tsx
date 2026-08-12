import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Typography, TextField, Grid, Card, CardContent,
  IconButton, Tooltip, CircularProgress, Alert, Button,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import BuildIcon from '@mui/icons-material/Build';
import SaveIcon from '@mui/icons-material/Save';
import {
  fetchInfra,
  saveInfra,
  uploadInfraImage,
  VskInfraDto,
  ImageUploadResponse,
  saveAndNext,
} from '../vskApi';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Step2InfraHardwareProps {
  stateCode: string;
  isReadOnly?: boolean;
  onStepComplete?: () => void;
}

interface UploadState {
  file: File | null;
  previewUrl: string | null;
  uploading: boolean;
  error: string | null;
}

interface InfraFieldErrors {
  roomLength?: string;
  roomWidth?: string;
  roomHeight?: string;
  screenLength?: string;
  screenHeight?: string;
  workstationCount?: string;
}

type ImageType = 'room' | 'screen' | 'workstation';

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const ACCEPTED_EXTENSIONS = '.jpg,.jpeg,.png,.pdf';

// ─── Component ────────────────────────────────────────────────────────────────

export default function Step2InfraHardware({
  stateCode,
  isReadOnly = false,
  onStepComplete,
}: Step2InfraHardwareProps) {
  // Form state
  const [roomLength, setRoomLength] = useState<number | ''>('');
  const [roomWidth, setRoomWidth] = useState<number | ''>('');
  const [roomHeight, setRoomHeight] = useState<number | ''>('');
  const [screenLength, setScreenLength] = useState<number | ''>('');
  const [screenHeight, setScreenHeight] = useState<number | ''>('');
  const [workstationCount, setWorkstationCount] = useState<number | ''>('');

  // Image URLs from server
  const [roomImageUrl, setRoomImageUrl] = useState<string | null>(null);
  const [screenImageUrl, setScreenImageUrl] = useState<string | null>(null);
  const [workstationImageUrl, setWorkstationImageUrl] = useState<string | null>(null);

  // Upload states
  const [roomUpload, setRoomUpload] = useState<UploadState>({ file: null, previewUrl: null, uploading: false, error: null });
  const [screenUpload, setScreenUpload] = useState<UploadState>({ file: null, previewUrl: null, uploading: false, error: null });
  const [workstationUpload, setWorkstationUpload] = useState<UploadState>({ file: null, previewUrl: null, uploading: false, error: null });

  // Loading / error
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(true);
  const [infraId, setInfraId] = useState<string | undefined>(undefined);

  // Field-level validation errors
  const [fieldErrors, setFieldErrors] = useState<InfraFieldErrors>({});

  // Saving state for button feedback
  const [saving, setSaving] = useState(false);

  // ─── Load existing data ───────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchInfra();
        if (cancelled) return;
        if (data) {
          setIsNew(false);
          setInfraId(data.id);
          setRoomLength(data.roomLength ?? '');
          setRoomWidth(data.roomWidth ?? '');
          setRoomHeight(data.roomHeight ?? '');
          setScreenLength(data.screenLength ?? '');
          setScreenHeight(data.screenHeight ?? '');
          setWorkstationCount(data.workstationCount ?? '');
          setRoomImageUrl(data.roomImageUrl ?? null);
          setScreenImageUrl(data.screenImageUrl ?? null);
          setWorkstationImageUrl(data.workstationImageUrl ?? null);
        }
      } catch (err) {
        console.error('Failed to load infra data:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [stateCode]);

  // ─── File validation ──────────────────────────────────────────────────────

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Invalid file type. Accepted: JPG, PNG, PDF';
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds 15MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB)`;
    }
    return null;
  };

  // ─── Upload handler ───────────────────────────────────────────────────────

  const handleFileUpload = useCallback(async (
    file: File,
    imageType: ImageType,
    setUploadState: React.Dispatch<React.SetStateAction<UploadState>>,
    setImageUrl: React.Dispatch<React.SetStateAction<string | null>>,
  ) => {
    const error = validateFile(file);
    if (error) {
      setUploadState({ file: null, previewUrl: null, uploading: false, error });
      return;
    }

    // Create preview for images
    const previewUrl = file.type.startsWith('image/')
      ? URL.createObjectURL(file)
      : null;

    setUploadState({ file, previewUrl, uploading: true, error: null });

    try {
      const response: ImageUploadResponse = await uploadInfraImage(imageType, file);
      setImageUrl(response.imageUrl);
      setUploadState(prev => ({ ...prev, uploading: false }));
    } catch (err) {
      setUploadState(prev => ({
        ...prev,
        uploading: false,
        error: 'Upload failed. Please try again.',
      }));
    }
  }, []);

  // ─── Remove image ─────────────────────────────────────────────────────────

  const handleRemoveImage = (
    setUploadState: React.Dispatch<React.SetStateAction<UploadState>>,
    setImageUrl: React.Dispatch<React.SetStateAction<string | null>>,
  ) => {
    setUploadState({ file: null, previewUrl: null, uploading: false, error: null });
    setImageUrl(null);
  };

  // ─── Get current DTO ──────────────────────────────────────────────────────

  const getCurrentDto = useCallback((): VskInfraDto => ({
    id: infraId,
    stateCode,
    roomLength: roomLength === '' ? null : roomLength,
    roomWidth: roomWidth === '' ? null : roomWidth,
    roomHeight: roomHeight === '' ? null : roomHeight,
    roomImageUrl: roomImageUrl ?? undefined,
    screenLength: screenLength === '' ? null : screenLength,
    screenHeight: screenHeight === '' ? null : screenHeight,
    screenImageUrl: screenImageUrl ?? undefined,
    workstationCount: workstationCount === '' ? null : workstationCount,
    workstationImageUrl: workstationImageUrl ?? undefined,
  }), [
    infraId, stateCode,
    roomLength, roomWidth, roomHeight, roomImageUrl,
    screenLength, screenHeight, screenImageUrl,
    workstationCount, workstationImageUrl,
  ]);

  // ─── Save (called externally via ref or as part of wizard) ────────────────

  const save = useCallback(async (validateForNext: boolean = false): Promise<boolean> => {
    setSaveError(null);
    setSaving(true);
    const errors: InfraFieldErrors = {};

    // Validate dimension values (must be positive if filled)
    if (roomLength !== '' && roomLength <= 0) {
      errors.roomLength = 'Must be a positive number';
    }
    if (roomWidth !== '' && roomWidth <= 0) {
      errors.roomWidth = 'Must be a positive number';
    }
    if (roomHeight !== '' && roomHeight <= 0) {
      errors.roomHeight = 'Must be a positive number';
    }
    if (screenLength !== '' && screenLength <= 0) {
      errors.screenLength = 'Must be a positive number';
    }
    if (screenHeight !== '' && screenHeight <= 0) {
      errors.screenHeight = 'Must be a positive number';
    }
    if (workstationCount !== '' && (workstationCount <= 0 || !Number.isInteger(workstationCount))) {
      errors.workstationCount = 'Must be a positive integer (≥ 1)';
    }

    if (validateForNext) {
      // Validate dimensions are mandatory for Save & Next
      if (roomLength === '') {
        errors.roomLength = 'Room length is required';
      }
      if (roomWidth === '') {
        errors.roomWidth = 'Room width is required';
      }
      if (roomHeight === '') {
        errors.roomHeight = 'Room height is required';
      }
      if (screenLength === '') {
        errors.screenLength = 'Screen length is required';
      }
      if (screenHeight === '') {
        errors.screenHeight = 'Screen height is required';
      }
      if (workstationCount === '') {
        errors.workstationCount = 'Workstation count is required';
      } else if (workstationCount < 1) {
        errors.workstationCount = 'Must be at least 1';
      }
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setSaveError('Please fix the validation errors below.');
      setSaving(false);
      return false;
    }

    if (validateForNext) {
      // Photos are mandatory for Save & Next
      if (!roomImageUrl) {
        setSaveError('Room photo is required.');
        setSaving(false);
        return false;
      }
      if (!screenImageUrl) {
        setSaveError('Screen photo is required.');
        setSaving(false);
        return false;
      }
      if (!workstationImageUrl) {
        setSaveError('Workstation photo is required.');
        setSaving(false);
        return false;
      }
    }

    try {
      const dto = getCurrentDto();
      const saved = await saveInfra(dto, isNew);
      setInfraId(saved.id);
      setIsNew(false);
      if (validateForNext) {
        // Mark step 2 as COMPLETE via the wizard API
        await saveAndNext({ step: 2, data: {} });
        onStepComplete?.();
      }
      return true;
    } catch (err) {
      setSaveError('Failed to save infrastructure data. Please try again.');
      return false;
    } finally {
      setSaving(false);
    }
  }, [getCurrentDto, isNew, roomLength, roomWidth, roomHeight, screenLength, screenHeight, workstationCount, roomImageUrl, screenImageUrl, workstationImageUrl, onStepComplete]);

  // Expose save method via a stable ref for parent wizard to call
  const saveRef = useRef(save);
  saveRef.current = save;

  // ─── Drag-and-Drop Upload Zone ────────────────────────────────────────────

  const UploadZone = ({
    label,
    imageType,
    imageUrl,
    uploadState,
    setUploadState,
    setImageUrl,
  }: {
    label: string;
    imageType: ImageType;
    imageUrl: string | null;
    uploadState: UploadState;
    setUploadState: React.Dispatch<React.SetStateAction<UploadState>>;
    setImageUrl: React.Dispatch<React.SetStateAction<string | null>>;
  }) => {
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (isReadOnly) return;
      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleFileUpload(file, imageType, setUploadState, setImageUrl);
      }
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      if (!isReadOnly) setDragOver(true);
    };

    const handleDragLeave = () => setDragOver(false);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileUpload(file, imageType, setUploadState, setImageUrl);
      }
      // Reset input so same file can be re-selected
      e.target.value = '';
    };

    const handleClick = () => {
      if (!isReadOnly) fileInputRef.current?.click();
    };

    const hasImage = imageUrl || uploadState.previewUrl;
    const displayUrl = uploadState.previewUrl || imageUrl;

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {label}
        </Typography>

        {uploadState.error && (
          <Alert severity="error" sx={{ mb: 1 }} onClose={() => setUploadState(prev => ({ ...prev, error: null }))}>
            {uploadState.error}
          </Alert>
        )}

        {hasImage ? (
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
            {displayUrl && displayUrl.endsWith('.pdf') ? (
              <ImageIcon sx={{ color: '#10B981', fontSize: 40 }} />
            ) : (
              <Box
                component="img"
                src={displayUrl ?? undefined}
                alt={label}
                sx={{
                  width: 60,
                  height: 60,
                  objectFit: 'cover',
                  borderRadius: 1,
                  border: '1px solid #E2E8F0',
                }}
              />
            )}
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight={500}>
                {uploadState.file?.name ?? 'Uploaded image'}
              </Typography>
              {uploadState.file && (
                <Typography variant="caption" color="text.secondary">
                  {(uploadState.file.size / (1024 * 1024)).toFixed(1)} MB
                </Typography>
              )}
              {uploadState.uploading && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <CircularProgress size={14} />
                  <Typography variant="caption" color="text.secondary">Uploading...</Typography>
                </Box>
              )}
            </Box>
            {!isReadOnly && !uploadState.uploading && (
              <Tooltip title="Remove file">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleRemoveImage(setUploadState, setImageUrl)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ) : (
          <Box
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleClick}
            sx={{
              border: `2px dashed ${dragOver ? '#7C3AED' : '#CBD5E1'}`,
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: isReadOnly ? 'default' : 'pointer',
              transition: 'all 0.2s',
              bgcolor: dragOver ? '#F5F3FF' : 'transparent',
              opacity: isReadOnly ? 0.6 : 1,
              '&:hover': isReadOnly ? {} : {
                borderColor: '#7C3AED',
                bgcolor: '#F5F3FF',
              },
            }}
          >
            {uploadState.uploading ? (
              <CircularProgress size={40} sx={{ color: '#7C3AED', mb: 1 }} />
            ) : (
              <CloudUploadIcon sx={{ fontSize: 40, color: '#94A3B8', mb: 1 }} />
            )}
            <Typography variant="body2" color="text.secondary">
              {uploadState.uploading ? 'Uploading...' : 'Drag & drop or click to upload'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Accepted: JPG, PNG, PDF (up to 15MB)
            </Typography>
          </Box>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </Box>
    );
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 3, color: '#1E293B' }}>
        <BuildIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#7C3AED' }} />
        Infrastructure &amp; Hardware
      </Typography>

      {saveError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSaveError(null)}>
          {saveError}
        </Alert>
      )}

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
                disabled={isReadOnly}
                inputProps={{ min: 0 }}
                error={!!fieldErrors.roomLength}
                helperText={fieldErrors.roomLength}
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
                disabled={isReadOnly}
                inputProps={{ min: 0 }}
                error={!!fieldErrors.roomWidth}
                helperText={fieldErrors.roomWidth}
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
                disabled={isReadOnly}
                inputProps={{ min: 0 }}
                error={!!fieldErrors.roomHeight}
                helperText={fieldErrors.roomHeight}
              />
            </Grid>
          </Grid>
          <UploadZone
            label="Upload Room Photo *"
            imageType="room"
            imageUrl={roomImageUrl}
            uploadState={roomUpload}
            setUploadState={setRoomUpload}
            setImageUrl={setRoomImageUrl}
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
                disabled={isReadOnly}
                inputProps={{ min: 0 }}
                error={!!fieldErrors.screenLength}
                helperText={fieldErrors.screenLength}
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
                disabled={isReadOnly}
                inputProps={{ min: 0 }}
                error={!!fieldErrors.screenHeight}
                helperText={fieldErrors.screenHeight}
              />
            </Grid>
          </Grid>
          <UploadZone
            label="Upload Screen Photo *"
            imageType="screen"
            imageUrl={screenImageUrl}
            uploadState={screenUpload}
            setUploadState={setScreenUpload}
            setImageUrl={setScreenImageUrl}
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
                value={workstationCount}
                onChange={e => setWorkstationCount(e.target.value ? Number(e.target.value) : '')}
                disabled={isReadOnly}
                inputProps={{ min: 1 }}
                error={!!fieldErrors.workstationCount}
                helperText={fieldErrors.workstationCount}
              />
            </Grid>
          </Grid>
          <UploadZone
            label="Upload Workstation Photo *"
            imageType="workstation"
            imageUrl={workstationImageUrl}
            uploadState={workstationUpload}
            setUploadState={setWorkstationUpload}
            setImageUrl={setWorkstationImageUrl}
          />
        </CardContent>
      </Card>

      {/* Save Buttons */}
      {!isReadOnly && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={() => save(false)}
            sx={{ textTransform: 'none' }}
          >
            Save Draft
          </Button>
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
            onClick={() => save(true)}
            disabled={saving}
            sx={{
              textTransform: 'none',
              bgcolor: '#7C3AED',
              '&:hover': { bgcolor: '#6D28D9' },
              px: 4,
              py: 1,
            }}
          >
            {saving ? 'Saving...' : 'Save & Next'}
          </Button>
        </Box>
      )}
    </Box>
  );
}
