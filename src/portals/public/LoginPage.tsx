import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Divider,
  Link,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { authApi } from '../../services/authApi';
import { loginSuccess } from '../../store/authSlice';

/**
 * Generate a simple math captcha (two numbers 1-9, addition).
 */
function generateCaptcha() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  return { a, b, answer: a + b };
}

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captcha, setCaptcha] = useState(generateCaptcha);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

  

    setLoading(true);
    try {
      const res = await authApi.login(username, password);
      const data = res.data;

      if (data.success && data.accessToken) {
        dispatch(loginSuccess({
          accessToken: data.accessToken,
          user: {
            id: data.user?.id || username,
            username: data.user?.username || username,
            displayName: data.user?.displayName || username,
            role: data.user?.role || 'Super_Admin',
            stateCode: data.user?.stateCode || null,
            districtCode: data.user?.districtCode || null,
            access: data.access || undefined,
          },
        }));
        // Redirect based on first-login status
        if (data.firstLogin) {
          navigate('/rvsk/profile-setup');
        } else {
          navigate('/rvsk/home');
        }
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
        setCaptcha(generateCaptcha());
        setCaptchaInput('');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Invalid credentials. Please try again.';
      setError(msg);
      setCaptcha(generateCaptcha());
      setCaptchaInput('');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder — in production this would call a reset password API
    setForgotSuccess(`Password reset link sent to ${forgotEmail}. Please check your email.`);
    setTimeout(() => {
      setShowForgotPassword(false);
      setForgotSuccess('');
      setForgotEmail('');
    }, 3000);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 50%, #C7D2FE 100%)',
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 440,
          width: '100%',
          borderRadius: '24px',
          p: { xs: 3, sm: 5 },
          boxShadow: '0 20px 60px rgba(30,58,138,0.08), 0 8px 24px rgba(0,0,0,0.04)',
          border: '1px solid #E2E8F0',
        }}
      >
        {!showForgotPassword ? (
          <>
            {/* Logo / Government Emblem */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  border: '2px solid #1E3A8A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 1.5,
                  bgcolor: '#F8FAFF',
                }}
              >
                <Typography sx={{ fontSize: 24, color: '#1E3A8A', fontWeight: 700 }}>✕</Typography>
              </Box>
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#1E3A8A',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  mb: 0.5,
                }}
              >
                GOVERNMENT OF INDIA
              </Typography>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', fontStyle: 'italic' }}>
                Ministry of Education
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', color: '#6B7280' }}>
                National Digital Education Architecture (NDEAR)
              </Typography>
            </Box>

            <Divider sx={{ mb: 3, borderColor: '#E2E8F0' }} />

            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

            <form onSubmit={handleLogin}>
              {/* Email Field */}
              <TextField
                fullWidth
                label="Email ID"
                placeholder="enter your official email ID"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                sx={{
                  mb: 2.5,
                  '& .MuiOutlinedInput-root': { borderRadius: 2 },
                  '& .MuiInputLabel-root': { color: '#1E3A8A', fontWeight: 500 },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#1E3A8A' },
                  '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: '#1E3A8A' },
                }}
              />

              {/* Password Field */}
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                        {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': { borderRadius: 2 },
                  '& .MuiInputLabel-root': { color: '#1E3A8A', fontWeight: 500 },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#1E3A8A' },
                  '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: '#1E3A8A' },
                }}
              />

            

              {/* Sign In Button */}
              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={loading}
                sx={{
                  py: 1.5,
                  borderRadius: '28px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  bgcolor: '#1A1F7E',
                  boxShadow: '0 4px 16px rgba(26,31,126,0.3)',
                  '&:hover': { bgcolor: '#15195F', boxShadow: '0 6px 20px rgba(26,31,126,0.4)' },
                }}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : 'SIGN IN'}
              </Button>
            </form>

            {/* Footer Links */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3, alignItems: 'center' }}>
              <Link
                component="button"
                onClick={() => setShowForgotPassword(true)}
                sx={{ fontSize: '0.85rem', color: '#1E3A8A', textDecoration: 'underline', cursor: 'pointer' }}
              >
                Forgot Password?
              </Link>
              <Typography sx={{ color: '#D1D5DB' }}>•</Typography>
              <Link
                href="mailto:support@rvsk.gov.in"
                sx={{ fontSize: '0.85rem', color: '#1E3A8A', textDecoration: 'underline' }}
              >
                Help Desk
              </Link>
            </Box>
          </>
        ) : (
          /* Forgot Password Form */
          <>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', mb: 0.5 }}>
                Reset Password
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', color: '#6B7280' }}>
                Enter your registered email to receive a password reset link
              </Typography>
            </Box>

            {forgotSuccess && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{forgotSuccess}</Alert>}

            <form onSubmit={handleForgotPassword}>
              <TextField
                fullWidth
                label="Email ID"
                placeholder="enter your registered email ID"
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                autoFocus
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': { borderRadius: 2 },
                  '& .MuiInputLabel-root': { color: '#1E3A8A', fontWeight: 500 },
                }}
              />

              <Button
                fullWidth
                variant="contained"
                type="submit"
                sx={{
                  py: 1.5,
                  borderRadius: '28px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  bgcolor: '#1A1F7E',
                  '&:hover': { bgcolor: '#15195F' },
                }}
              >
                SEND RESET LINK
              </Button>
            </form>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Link
                component="button"
                onClick={() => { setShowForgotPassword(false); setForgotSuccess(''); }}
                sx={{ fontSize: '0.85rem', color: '#1E3A8A', textDecoration: 'underline', cursor: 'pointer' }}
              >
                ← Back to Sign In
              </Link>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}
