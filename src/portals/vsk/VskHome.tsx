import { Box, Typography, Paper, LinearProgress } from '@mui/material';

export default function VskHome() {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>VSK Portal</Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Completion Progress</Typography>
        <LinearProgress variant="determinate" value={72} sx={{ height: 10, borderRadius: 5 }} />
        <Typography sx={{ mt: 1 }}>18/25 forms submitted (72%)</Typography>
      </Paper>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">Received Submissions</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>Your form submissions will appear here.</Typography>
      </Paper>
    </Box>
  );
}
