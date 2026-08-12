import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Box, Typography, IconButton, Alert, CircularProgress,
  Paper, Grid, Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { appointNewOfficer, OfficerHistoryDto } from '../vskApi';

// ─── Validation Constants ─────────────────────────────────────────────────────

const PHONE_REGEX = /^[6-9]\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[a-zA-Z\s.]+$/;

const DEFAULT_DESIGNATIONS: Record<string, string> = {
  SECRETARY: 'Secretary',
  SPD: 'SPD (State Project Director)',
  NODAL_OFFICER: 'Nodal Officer',
};

interface AppointNewOfficerDialogProps {
  open: boolean;
  onClose: () => void;
  officerRole: string;
  currentOfficer: OfficerHistoryDto | null;
  onSuccess: (newOfficer: OfficerHistoryDto) => void;
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export default function AppointNewOfficerDialog({
  open,
  onClose,
  officerRole,
  currentOfficer,
  onSuccess,
}: AppointNewOfficerDialogProps) {
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [startDate, setStartDate] = useState(getTodayDate());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation state
  const [nameError, setNameError] = useState('');
  const [designationError, setDesignationError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [whatsappError, setWhatsappError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [startDateError, setStartDateError] = useState('');

  // Pre-fill designation based on officerRole when dialog opens
  useEffect(() => {
    if (open) {
      const defaultDesig = DEFAULT_DESIGNATIONS[officerRole] || '';
      setDesignation(defaultDesig);
    }
  }, [open, officerRole]);

  function resetForm() {
    setName('');
    setDesignation('');
    setPhone('');
    setWhatsapp('');
    setEmail('');
    setStartDate(getTodayDate());
    setError(null);
    setNameError('');
    setDesignationError('');
    setPhoneError('');
    setWhatsappError('');
    setEmailError('');
    setStartDateError('');
  }

  function handleClose() {
    if (!loading) {
      resetForm();
      onClose();
    }
  }

  function validate(): boolean {
    let valid = true;

    // Name: required, min 2, max 200, only letters/spaces/dots
    if (!name.trim()) {
      setNameError('Name is required');
      valid = false;
    } else if (name.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
      valid = false;
    } else if (name.trim().length > 200) {
      setNameError('Name must not exceed 200 characters');
      valid = false;
    } else if (!NAME_REGEX.test(name.trim())) {
      setNameError('Name can only contain letters, spaces, and dots');
      valid = false;
    } else {
      setNameError('');
    }

    // Designation: required (pre-filled)
    if (!designation.trim()) {
      setDesignationError('Designation is required');
      valid = false;
    } else {
      setDesignationError('');
    }

    // Phone: required, 10 digits starting with 6-9
    if (!phone.trim()) {
      setPhoneError('Phone is required');
      valid = false;
    } else if (!PHONE_REGEX.test(phone.trim())) {
      setPhoneError('Phone must be 10 digits starting with 6-9');
      valid = false;
    } else {
      setPhoneError('');
    }

    // WhatsApp: optional, but if filled must be valid
    if (whatsapp.trim() && !PHONE_REGEX.test(whatsapp.trim())) {
      setWhatsappError('WhatsApp must be 10 digits starting with 6-9');
      valid = false;
    } else {
      setWhatsappError('');
    }

    // Email: required, valid format
    if (!email.trim()) {
      setEmailError('Email is required');
      valid = false;
    } else if (!EMAIL_REGEX.test(email.trim())) {
      setEmailError('Invalid email format');
      valid = false;
    } else {
      setEmailError('');
    }

    // Start Date: required
    if (!startDate) {
      setStartDateError('Start date is required');
      valid = false;
    } else {
      setStartDateError('');
    }

    return valid;
  }

  async function handleSubmit() {
    if (!validate()) return;

    setLoading(true);
    setError(null);

    try {
      const dto: OfficerHistoryDto = {
        officerRole,
        name: name.trim(),
        designation: designation.trim() || undefined,
        phone: phone.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
        email: email.trim() || undefined,
        startDate: startDate || undefined,
      };

      const newOfficer = await appointNewOfficer(dto);
      resetForm();
      onSuccess(newOfficer);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? ((err as { response?: { data?: { message?: string } } }).response?.data?.message ??
            'Failed to appoint new officer. Please try again.')
          : 'Failed to appoint new officer. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={600}>
          Appoint New {officerRole.replace(/_/g, ' ')}
        </Typography>
        <IconButton onClick={handleClose} size="small" disabled={loading}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Current Officer Summary (read-only) */}
        {currentOfficer && (
          <>
            <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: '#FFF8E1' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Replacing Current Officer
              </Typography>
              <Typography variant="body2">
                <strong>{currentOfficer.name}</strong>
                {currentOfficer.designation && ` — ${currentOfficer.designation}`}
              </Typography>
              {currentOfficer.email && (
                <Typography variant="body2" color="text.secondary">
                  {currentOfficer.email}
                </Typography>
              )}
              {currentOfficer.phone && (
                <Typography variant="body2" color="text.secondary">
                  {currentOfficer.phone}
                </Typography>
              )}
              {currentOfficer.startDate && (
                <Typography variant="caption" color="text.secondary">
                  Since: {currentOfficer.startDate}
                </Typography>
              )}
            </Paper>
            <Divider sx={{ mb: 2 }} />
          </>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* New Officer Form */}
        <Box component="form" noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                required
                error={!!nameError}
                helperText={nameError}
                disabled={loading}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Designation"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                fullWidth
                required
                error={!!designationError}
                helperText={designationError}
                disabled={loading}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                fullWidth
                required
                error={!!phoneError}
                helperText={phoneError || '10 digits starting with 6-9'}
                disabled={loading}
                size="small"
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="WhatsApp"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                fullWidth
                error={!!whatsappError}
                helperText={whatsappError || 'Optional'}
                disabled={loading}
                size="small"
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
                error={!!emailError}
                helperText={emailError}
                disabled={loading}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                fullWidth
                required
                error={!!startDateError}
                helperText={startDateError}
                disabled={loading}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} variant="outlined" disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} /> : undefined}
        >
          {loading ? 'Appointing...' : 'Appoint'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
