import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, FormControl, InputLabel, Select,
  MenuItem, Snackbar, Alert, CircularProgress, TablePagination, Tooltip, Button,
} from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { notificationApi, NotificationLog } from './notificationApi';

const STATUS_COLOR: Record<string, 'success' | 'error' | 'warning'> = {
  SENT: 'success', FAILED: 'error', PENDING: 'warning',
};

export default function NotificationLogs() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationApi.listLogs({
        status: status || undefined,
        page: page + 1,
        pageSize,
      });
      setLogs(res.items);
      setTotal(res.total);
    } catch (e: any) {
      setSnackbar({ open: true, message: e?.response?.data?.message || 'Failed to load logs', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [status, page, pageSize]);

  useEffect(() => { load(); }, [load]);

  const handleResend = async (log: NotificationLog) => {
    try {
      const res = await notificationApi.resend(log.id);
      setSnackbar({ open: true, message: res.message, severity: res.success ? 'success' : 'error' });
      load();
    } catch (e: any) {
      setSnackbar({ open: true, message: e?.response?.data?.message || 'Resend failed', severity: 'error' });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/rvsk/admin/notifications')} sx={{ mb: 1 }}>
        Back to Notifications
      </Button>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>Notification Logs</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select value={status} label="Status" onChange={(e) => { setPage(0); setStatus(e.target.value); }}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="SENT">Sent</MenuItem>
              <MenuItem value="FAILED">Failed</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
            </Select>
          </FormControl>
          <IconButton onClick={load} title="Refresh"><RefreshIcon /></IconButton>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#1E293B' }}>
                {['Event', 'Recipient', 'Subject', 'Status', 'Attempts', 'Test', 'When', 'Actions'].map((h) => (
                  <TableCell key={h} sx={{ color: '#fff', fontWeight: 600 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{log.eventCode}</TableCell>
                  <TableCell>{log.recipientEmail}</TableCell>
                  <TableCell sx={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <Tooltip title={log.errorMessage || log.subject || ''}>
                      <span>{log.subject}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell><Chip size="small" label={log.status} color={STATUS_COLOR[log.status] || 'default'} /></TableCell>
                  <TableCell align="center">{log.attempts}{log.retryCount ? ` (+${log.retryCount})` : ''}</TableCell>
                  <TableCell>{log.isTest ? <Chip size="small" label="TEST" variant="outlined" /> : ''}</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{new Date(log.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <Tooltip title="Resend">
                      <span>
                        <IconButton size="small" disabled={log.status !== 'FAILED'} onClick={() => handleResend(log)}>
                          <ReplayIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4 }}>No log entries</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination component="div" count={total} page={page}
            onPageChange={(_, p) => setPage(p)} rowsPerPage={pageSize}
            onRowsPerPageChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[10, 25, 50, 100]} />
        </TableContainer>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
