import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
  Paper, Typography, CircularProgress, Box, Chip,
} from '@mui/material';
import { SecretaryDetailsDto, fetchSecretaryHistory } from './vskApi';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SecretaryHistoryDialog({ open, onClose }: Props) {
  const [history, setHistory] = useState<SecretaryDetailsDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadHistory();
    }
  }, [open]);

  async function loadHistory() {
    setLoading(true);
    try {
      const data = await fetchSecretaryHistory();
      // Sort by version descending (latest first)
      data.sort((a, b) => (b.versionNo ?? 0) - (a.versionNo ?? 0));
      setHistory(data);
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Secretary Version History</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : history.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
            No history records found.
          </Typography>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell><strong>Version</strong></TableCell>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Designation</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Mobile</strong></TableCell>
                  <TableCell><strong>Effective From</strong></TableCell>
                  <TableCell><strong>Effective To</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Remarks</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((row, idx) => {
                  const isCurrent = row.isCurrent === 1 || idx === 0;
                  return (
                    <TableRow
                      key={row.id ?? idx}
                      sx={{ bgcolor: isCurrent ? '#F0FDF4' : 'inherit' }}
                    >
                      <TableCell>{row.versionNo ?? '-'}</TableCell>
                      <TableCell>{row.secretaryName}</TableCell>
                      <TableCell>{row.secretaryDesignation}</TableCell>
                      <TableCell>{row.secretaryEmail}</TableCell>
                      <TableCell>{row.secretaryMobile}</TableCell>
                      <TableCell>{row.effectiveFrom ?? '-'}</TableCell>
                      <TableCell>{row.effectiveTo ?? '-'}</TableCell>
                      <TableCell>
                        {isCurrent ? (
                          <Chip label="CURRENT" size="small" color="success" />
                        ) : (
                          <Chip label="Past" size="small" variant="outlined" />
                        )}
                      </TableCell>
                      <TableCell>{row.remarks || '-'}</TableCell>
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
