import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
  Paper, Typography, CircularProgress, Box, Chip,
} from '@mui/material';
import { OfficerHistoryDto, fetchOfficerHistory } from '../vskApi';

interface Props {
  open: boolean;
  onClose: () => void;
  role: string; // SECRETARY | SPD | NODAL_OFFICER
}

const ROLE_LABELS: Record<string, string> = {
  SECRETARY: 'Secretary',
  SPD: 'State Project Director',
  NODAL_OFFICER: 'Nodal Officer',
};

export default function OfficerHistoryDialog({ open, onClose, role }: Props) {
  const [history, setHistory] = useState<OfficerHistoryDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadHistory();
    }
  }, [open, role]);

  async function loadHistory() {
    setLoading(true);
    try {
      const data = await fetchOfficerHistory(role);
      // Reverse chronological order (latest first) — API returns sorted by startDate desc,
      // but ensure ordering client-side as well
      data.sort((a, b) => {
        const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
        const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
        return dateB - dateA;
      });
      setHistory(data);
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }

  const roleLabel = ROLE_LABELS[role] ?? role;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>{roleLabel} — Version History</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : history.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
            No history found.
          </Typography>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Designation</strong></TableCell>
                  <TableCell><strong>Phone</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Start Date</strong></TableCell>
                  <TableCell><strong>End Date</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((row, idx) => {
                  const isActive = row.isActive === 1;
                  return (
                    <TableRow
                      key={row.id ?? idx}
                      sx={{ bgcolor: isActive ? '#F0FDF4' : 'inherit' }}
                    >
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.designation ?? '-'}</TableCell>
                      <TableCell>{row.phone ?? '-'}</TableCell>
                      <TableCell>{row.email ?? '-'}</TableCell>
                      <TableCell>{row.startDate ?? '-'}</TableCell>
                      <TableCell>{row.endDate ?? '-'}</TableCell>
                      <TableCell>
                        {isActive ? (
                          <Chip label="Active" size="small" color="success" />
                        ) : (
                          <Chip label="Inactive" size="small" variant="outlined" />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
