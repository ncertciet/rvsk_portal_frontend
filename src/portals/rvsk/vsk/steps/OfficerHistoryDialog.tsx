import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, IconButton, Typography, Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface OfficerHistoryEntry {
  id: number;
  name: string;
  designation: string;
  email: string;
  phone: string;
  startDate: string;
  endDate: string | null;
  status: 'Active' | 'Inactive';
}

interface OfficerHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  officerType: string;
}

const DUMMY_HISTORY: Record<string, OfficerHistoryEntry[]> = {
  Secretary: [
    { id: 1, name: 'Rajesh Kumar', designation: 'Secretary', email: 'secretary@state.gov.in', phone: '9876543210', startDate: '2024-01-15', endDate: null, status: 'Active' },
    { id: 2, name: 'Suresh Patel', designation: 'Secretary', email: 'suresh.patel@state.gov.in', phone: '9876500001', startDate: '2022-06-01', endDate: '2024-01-14', status: 'Inactive' },
    { id: 3, name: 'Mohan Verma', designation: 'Secretary', email: 'mohan.verma@state.gov.in', phone: '9876500002', startDate: '2020-03-10', endDate: '2022-05-31', status: 'Inactive' },
  ],
  SPD: [
    { id: 1, name: 'Priya Sharma', designation: 'SPD', email: 'spd@state.gov.in', phone: '9123456789', startDate: '2023-08-01', endDate: null, status: 'Active' },
    { id: 2, name: 'Anil Gupta', designation: 'SPD', email: 'anil.gupta@state.gov.in', phone: '9123400001', startDate: '2021-04-15', endDate: '2023-07-31', status: 'Inactive' },
  ],
  'Nodal Officer': [
    { id: 1, name: 'Amit Singh', designation: 'Nodal Officer', email: 'nodal@state.gov.in', phone: '8765432100', startDate: '2024-03-01', endDate: null, status: 'Active' },
    { id: 2, name: 'Kavita Rao', designation: 'Nodal Officer', email: 'kavita.rao@state.gov.in', phone: '8765400001', startDate: '2022-09-15', endDate: '2024-02-28', status: 'Inactive' },
    { id: 3, name: 'Deepak Joshi', designation: 'Nodal Officer', email: 'deepak.j@state.gov.in', phone: '8765400002', startDate: '2021-01-10', endDate: '2022-09-14', status: 'Inactive' },
  ],
};

export default function OfficerHistoryDialog({ open, onClose, officerType }: OfficerHistoryDialogProps) {
  const entries = DUMMY_HISTORY[officerType] || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={600}>
          {officerType} — Version History
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Designation</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Start Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>End Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map((entry) => (
                <TableRow
                  key={entry.id}
                  sx={{
                    bgcolor: entry.status === 'Active' ? '#F0FDF4' : 'inherit',
                    '&:hover': { bgcolor: entry.status === 'Active' ? '#DCFCE7' : '#F8FAFC' },
                  }}
                >
                  <TableCell>{entry.name}</TableCell>
                  <TableCell>{entry.designation}</TableCell>
                  <TableCell>{entry.email}</TableCell>
                  <TableCell>{entry.phone}</TableCell>
                  <TableCell>{entry.startDate}</TableCell>
                  <TableCell>{entry.endDate || '—'}</TableCell>
                  <TableCell>
                    <Chip
                      label={entry.status}
                      size="small"
                      color={entry.status === 'Active' ? 'success' : 'default'}
                      variant={entry.status === 'Active' ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {entries.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No history records found for this officer.
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
