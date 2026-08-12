import { Box, Typography, Paper, Grid, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface Props {
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
}

export default function PlaceholderDashboard({ title, badge, badgeColor, description }: Props) {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/rvsk/dashboard')}
          sx={{ color: '#5B21B6', textTransform: 'none' }}
        >
          Back to Home
        </Button>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: badgeColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{badge}</Typography>
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={700}>{title}</Typography>
          <Typography variant="body2" color="text.secondary">{description}</Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center', borderTop: `4px solid ${badgeColor}` }}>
            <Typography variant="h4" fontWeight={700} color={badgeColor}>—</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Total Records</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center', borderTop: '4px solid #10B981' }}>
            <Typography variant="h4" fontWeight={700} color="#10B981">—</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Active Today</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center', borderTop: '4px solid #F59E0B' }}>
            <Typography variant="h4" fontWeight={700} color="#F59E0B">—</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Pending</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 4, mt: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {title} Dashboard
        </Typography>
        <Typography color="text.secondary">
          This module is under development. Full analytics and reporting will be available soon.
        </Typography>
      </Paper>
    </Box>
  );
}
