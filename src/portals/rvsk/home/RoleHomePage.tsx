import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { RootState } from '../../../store';
import SuperAdminHome from './SuperAdminHome';
import RvskAdminHome from './RvskAdminHome';
import StateAdminHome from './StateAdminHome';
import SpocHome from './SpocHome';

function DefaultHome() {
  return (
    <Box
      sx={{
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 2,
      }}
    >
      <Typography variant="h5" fontWeight={600} color="#1E293B">
        Welcome to RVSK Portal
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Navigate to your dashboard to get started.
      </Typography>
      <Button
        component={Link}
        to="/rvsk/dashboard"
        variant="contained"
        startIcon={<DashboardIcon />}
        sx={{
          bgcolor: '#7C3AED',
          '&:hover': { bgcolor: '#6D28D9' },
          textTransform: 'none',
          px: 3,
        }}
      >
        Go to Dashboard
      </Button>
    </Box>
  );
}

export default function RoleHomePage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const role = user?.role;

  switch (role) {
    case 'Super_Admin':
      return <SuperAdminHome />;
    case 'RVSK_Admin':
      return <RvskAdminHome />;
    case 'State_Admin':
      return <StateAdminHome />;
    case 'RVSK_SPOC':
      return <SpocHome />;
    default:
      return <DefaultHome />;
  }
}
