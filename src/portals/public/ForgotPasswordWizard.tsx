import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Link,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { authApi } from '../../services/authApi';

/**
 * RVSK-AUTH-PWDRESET-004 — Forgot Password 4-step recovery wizard.
 *
 * Step 1 Username → Step 2 OTP (cosmetic countdown + Resend after cooldown) →
 * Step 3 New/Confirm Password → Step 4 Success + Return to Login.
 *
 * The user identifies by username; the backend validates it exists and emails
 * the OTP to the account's registered address.
 *
 * The countdown and resend timer are COSMETIC only; the backend is
 * authoritative for OTP expiry and resend cooldown. The reset token is held in
 * memory only (never persisted).
 */

// Display-only values that mirror the backend defaults. The backend re-checks.
const OTP_EXPIRY_SECONDS = 15 * 60; // 15 minutes
const RESEND_COOLDOWN_SECONDS = 120; // 2 minutes

const brandColor = '#1E3A8A';

const fieldSx = {
  '& .MuiOutlinedInput-root': { borderRadius: 2 },
  '& .MuiInputLabel-root': { color: brandColor, fontWeight: 500 },
  '& .MuiInputLabel-root.Mui-focused': { color: brandColor },
  '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: brandColor },
} as const;

const primaryButtonSx = {
  py: 1.5,
  borderRadius: '28px',
  fontWeight: 700,
  fontSize: '0.95rem',
  letterSpacing: '1px',
  textTransform: 'uppercase',
  bgcolor: '#1A1F7E',
  boxShadow: '0 4px 16px rgba(26,31,126,0.3)',
  '&:hover': { bgcolor: '#15195F', boxShadow: '0 6px 20px rgba(26,31,126,0.4)' },
} as const;

type WizardStep = 0 | 1 | 2 | 3;

const STEP_LABELS = ['Email', 'Verify', 'Password', 'Done'];

function formatMMSS(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function extractError(err: any, fallback: string): string {
  return err?.response?.data?.message || fallback;
}

interface ForgotPasswordWizardProps {
  /** Called when the user chooses to return to the sign-in view. */
  onBackToLogin: () => void;
}

export default function ForgotPasswordWizard({
  onBackToLogin,
}: ForgotPasswordWizardProps) {
  const [step, setStep] = useState<WizardStep>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  // Step 1
  const [username, setUsername] = useState('');

  // Step 2
  const [otp, setOtp] = useState('');
  const [expirySeconds, setExpirySeconds] = useState(OTP_EXPIRY_SECONDS);
  const [resendSeconds, setResendSeconds] = useState(RESEND_COOLDOWN_SECONDS);

  // Step 2 → 3 handoff (kept in memory only)
  const resetTokenRef = useRef<string>('');

  // Step 3
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ── Cosmetic countdown timers (Step 2 only) ──────────────────────────────
  useEffect(() => {
    if (step !== 1) return;
    const id = setInterval(() => {
      setExpirySeconds((s) => (s > 0 ? s - 1 : 0));
      setResendSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [step]);

  const resetTimers = useCallback(() => {
    setExpirySeconds(OTP_EXPIRY_SECONDS);
    setResendSeconds(RESEND_COOLDOWN_SECONDS);
  }, []);

  // ── Step 1: request OTP ───────────────────────────────────────────────────
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      await authApi.forgotPasswordRequestOtp(username.trim());
      resetTimers();
      setOtp('');
      setStep(1);
      setInfo('A one-time code has been sent to your registered email.');
    } catch (err: any) {
      setError(extractError(err, "User doesn't exist"));
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: verify OTP ────────────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const res = await authApi.forgotPasswordVerifyOtp(username.trim(), otp.trim());
      const token = res.data?.resetToken;
      if (!token) {
        setError('Invalid or expired code. Please try again.');
        return;
      }
      resetTokenRef.current = token;
      setStep(2);
    } catch (err: any) {
      setError(extractError(err, 'Invalid or expired code. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: resend OTP (enabled only when cosmetic cooldown elapses) ──────
  const handleResendOtp = async () => {
    if (resendSeconds > 0) return;
    setError('');
    setInfo('');
    setLoading(true);
    try {
      await authApi.forgotPasswordResendOtp(username.trim());
      resetTimers();
      setInfo('A new code has been sent to your registered email.');
    } catch (err: any) {
      setError(extractError(err, 'Could not resend the code. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: reset password ────────────────────────────────────────────────
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    setLoading(true);
    try {
      await authApi.forgotPasswordReset(
        resetTokenRef.current,
        newPassword,
        confirmPassword,
      );
      // Clear the in-memory token immediately after use.
      resetTokenRef.current = '';
      setStep(3);
    } catch (err: any) {
      setError(extractError(err, 'Could not reset the password. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', mb: 0.5 }}>
          Reset Password
        </Typography>
        <Typography sx={{ fontSize: '0.85rem', color: '#6B7280' }}>
          {step === 0 && 'Enter your username to receive a one-time code'}
          {step === 1 && 'Enter the one-time code sent to your email'}
          {step === 2 && 'Create a new password for your account'}
          {step === 3 && 'Your password has been updated'}
        </Typography>
      </Box>

      <Stepper activeStep={step} alternativeLabel sx={{ mb: 3 }}>
        {STEP_LABELS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
      {info && !error && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>{info}</Alert>
      )}

      {/* ── Step 1 — Email ── */}
      {step === 0 && (
        <form onSubmit={handleRequestOtp}>
          <TextField
            fullWidth
            label="Username"
            placeholder="enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
            sx={{ mb: 3, ...fieldSx }}
          />
          <Button fullWidth variant="contained" type="submit" disabled={loading} sx={primaryButtonSx}>
            {loading ? <CircularProgress size={22} color="inherit" /> : 'SEND CODE'}
          </Button>
        </form>
      )}

      {/* ── Step 2 — OTP ── */}
      {step === 1 && (
        <form onSubmit={handleVerifyOtp}>
          <TextField
            fullWidth
            label="One-Time Code"
            placeholder="enter the code from your email"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            required
            autoFocus
            inputProps={{ inputMode: 'numeric', maxLength: 10 }}
            sx={{ mb: 1.5, ...fieldSx }}
          />

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Typography sx={{ fontSize: '0.8rem', color: expirySeconds > 0 ? '#6B7280' : '#B91C1C' }}>
              {expirySeconds > 0
                ? `Code expires in ${formatMMSS(expirySeconds)}`
                : 'Code may have expired — resend to get a new one'}
            </Typography>
            <Link
              component="button"
              type="button"
              onClick={handleResendOtp}
              disabled={resendSeconds > 0 || loading}
              sx={{
                fontSize: '0.8rem',
                color: resendSeconds > 0 ? '#9CA3AF' : brandColor,
                textDecoration: resendSeconds > 0 ? 'none' : 'underline',
                cursor: resendSeconds > 0 ? 'default' : 'pointer',
              }}
            >
              {resendSeconds > 0 ? `Resend in ${formatMMSS(resendSeconds)}` : 'Resend code'}
            </Link>
          </Box>

          <Button fullWidth variant="contained" type="submit" disabled={loading} sx={primaryButtonSx}>
            {loading ? <CircularProgress size={22} color="inherit" /> : 'VERIFY CODE'}
          </Button>
        </form>
      )}

      {/* ── Step 3 — New Password ── */}
      {step === 2 && (
        <form onSubmit={handleReset}>
          <TextField
            fullWidth
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoFocus
            helperText="At least 6 characters"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                    {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2.5, ...fieldSx }}
          />
          <TextField
            fullWidth
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            sx={{ mb: 3, ...fieldSx }}
          />
          <Button fullWidth variant="contained" type="submit" disabled={loading} sx={primaryButtonSx}>
            {loading ? <CircularProgress size={22} color="inherit" /> : 'UPDATE PASSWORD'}
          </Button>
        </form>
      )}

      {/* ── Step 4 — Success ── */}
      {step === 3 && (
        <Box sx={{ textAlign: 'center' }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 64, color: '#16A34A', mb: 1.5 }} />
          <Typography sx={{ fontSize: '1rem', color: '#111827', fontWeight: 600, mb: 0.5 }}>
            Password updated successfully
          </Typography>
          <Typography sx={{ fontSize: '0.85rem', color: '#6B7280', mb: 3 }}>
            You can now sign in with your new password.
          </Typography>
          <Button fullWidth variant="contained" onClick={onBackToLogin} sx={primaryButtonSx}>
            RETURN TO LOGIN
          </Button>
        </Box>
      )}

      {step !== 3 && (
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Link
            component="button"
            type="button"
            onClick={onBackToLogin}
            sx={{ fontSize: '0.85rem', color: brandColor, textDecoration: 'underline', cursor: 'pointer' }}
          >
            ← Back to Sign In
          </Link>
        </Box>
      )}
    </>
  );
}
