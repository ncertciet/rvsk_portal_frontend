import { Box, Typography, Grid, Paper } from '@mui/material';

export default function RvskHome() {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>RVSK Portal</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" color="primary">24</Typography>
            <Typography color="text.secondary">Forms Sent</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" color="warning.main">12</Typography>
            <Typography color="text.secondary">In Progress</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" color="success.main">48</Typography>
            <Typography color="text.secondary">Completed</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
