import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import apiClient from '../../../services/apiClient';

const STATUS_CHIP_COLORS: Record<string, 'warning' | 'info' | 'success'> = {
  PENDING: 'warning',
  DRAFT: 'info',
  SUBMITTED: 'success',
};

interface FormMeta {
  title: string;
  status: string;
  dueDate: string | null;
}

interface ResponseRow {
  id: string;
  stateKey: string | null;
  status: string;
  submittedAt: string | null;
}

export default function FormResponses() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormMeta | null>(null);
  const [responses, setResponses] = useState<ResponseRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    Promise.all([
      apiClient.get(`/forms/${id}`),
      apiClient.get(`/forms/${id}/responses`),
    ])
      .then(([formRes, respRes]) => {
        setForm({ title: formRes.data.title, status: formRes.data.status, dueDate: formRes.data.dueDate });
        // The responses endpoint returns a paged response { content, ... }.
        const content = respRes.data?.content ?? respRes.data ?? [];
        setResponses(content);
      })
      .catch(() => setForm(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleExport = () => {
    window.open(`/api/v1/forms/${id}/export/excel`, '_blank');
  };

  const fmtDate = (d: string | null) => (d ? new Date(d).toLocaleString() : '—');

  if (loading) {
    return <Box sx={{ p: 3, textAlign: 'center' }}><CircularProgress size={28} /></Box>;
  }

  if (!form) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Form not found.</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/rvsk/form-builder')} sx={{ mt: 2 }}>
          Back to Forms
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/rvsk/form-builder')} sx={{ mb: 2 }}>
        Back to Forms
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={600}>{form.title}</Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
            <Chip label={form.status} size="small" color={form.status === 'PUBLISHED' ? 'success' : 'default'} />
            <Typography variant="body2" color="text.secondary">Due: {fmtDate(form.dueDate)}</Typography>
          </Box>
        </Box>
        <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExport}>
          Export Excel
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#F8FAFC' }}>
              <TableCell sx={{ fontWeight: 600 }}>State Key</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Submitted Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {responses.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>{r.stateKey || '—'}</TableCell>
                <TableCell>
                  <Chip label={r.status} size="small" color={STATUS_CHIP_COLORS[r.status] || 'info'} />
                </TableCell>
                <TableCell>{fmtDate(r.submittedAt)}</TableCell>
              </TableRow>
            ))}
            {responses.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No responses submitted yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
