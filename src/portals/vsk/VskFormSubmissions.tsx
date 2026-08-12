import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Chip, LinearProgress } from '@mui/material';

const submissions = [
  { name: 'VSK Profile', status: 'Complete', date: '2024-12-01' },
  { name: 'Infrastructure H/W', status: 'Draft', date: '2024-12-05' },
  { name: 'Software Details', status: 'Pending', date: '2024-12-08' },
  { name: 'PMU Details', status: 'Draft', date: '2024-12-10' },
  { name: 'Q1 Report 2025', status: 'Pending', date: '2024-12-15' },
];

const statusColor = (s: string) => s === 'Complete' ? 'success' : s === 'Draft' ? 'warning' : 'error';

export default function VskFormSubmissions() {
  const completed = submissions.filter(s => s.status === 'Complete').length;
  const progress = (completed / submissions.length) * 100;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Form Submissions</Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Completion Progress</Typography>
        <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5 }} />
        <Typography sx={{ mt: 1 }}>{completed}/{submissions.length} forms completed ({progress.toFixed(0)}%)</Typography>
      </Paper>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Form Name</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {submissions.map(s => (
              <TableRow key={s.name} hover sx={{ cursor: 'pointer' }}>
                <TableCell>{s.name}</TableCell>
                <TableCell><Chip label={s.status} color={statusColor(s.status) as any} size="small" /></TableCell>
                <TableCell>{s.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
