import { Box, Typography, Grid, Card, CardContent, Button, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const dashboards = [
  { name: 'Attendance', path: '/dashboard/attendance' },
  { name: 'Assessment', path: '/dashboard/assessment' },
  { name: 'Accreditation', path: '/dashboard/accreditation' },
  { name: 'Administration', path: '/dashboard/administration' },
  { name: 'Adaptive Learning', path: '/dashboard/adaptive-learning' },
  { name: 'APAAR', path: '/dashboard/apaar' },
];

export default function VskDashboard() {
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1 }}>VSK Dashboard</Typography>
      <Chip label="State: Your Assigned State" color="primary" sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        {dashboards.map(d => (
          <Grid item xs={12} sm={6} md={4} key={d.name}>
            <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }} onClick={() => navigate(d.path)}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6">{d.name}</Typography>
                <Button size="small" sx={{ mt: 1 }}>View Dashboard →</Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
