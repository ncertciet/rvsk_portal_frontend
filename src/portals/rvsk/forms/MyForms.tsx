import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Button, CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import apiClient from '../../../services/apiClient';

const STATUS_CONFIG: Record<string, { label: string; color: 'warning' | 'info' | 'success' | 'default' }> = {
  PENDING: { label: 'Pending', color: 'warning' },
  DRAFT_SAVED: { label: 'Draft Saved', color: 'info' },
  SUBMITTED: { label: 'Submitted', color: 'success' },
};

interface MyForm {
  id: string;
  title: string;
  dueDate: string | null;
  status: string;
  submissionStatus: string;
  questionCount: number;
}

export default function MyForms() {
  const navigate = useNavigate();
  const [forms, setForms] = useState<MyForm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get('/forms/my-forms')
      .then((res) => setForms(res.data || []))
      .catch(() => setForms([]))
      .finally(() => setLoading(false));
  }, []);

  const fmtDate = (d: string | null) => (d ? new Date(d).toLocaleDateString() : '—');

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>My Forms</Typography>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#F8FAFC' }}>
              <TableCell sx={{ fontWeight: 600 }}>Form Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            )}

            {!loading && forms.map((form) => {
              const statusCfg = STATUS_CONFIG[form.submissionStatus] || STATUS_CONFIG.PENDING;
              const isSubmitted = form.submissionStatus === 'SUBMITTED';
              return (
                <TableRow key={form.id} hover>
                  <TableCell>{form.title}</TableCell>
                  <TableCell>{fmtDate(form.dueDate)}</TableCell>
                  <TableCell>
                    <Chip label={statusCfg.label} size="small" color={statusCfg.color} />
                  </TableCell>
                  <TableCell align="center">
                    {isSubmitted ? (
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate(`/rvsk/my-forms/${form.id}/view`)}
                      >
                        View Submission
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<EditIcon />}
                        disabled={form.status === 'CLOSED'}
                        onClick={() => navigate(`/rvsk/my-forms/${form.id}/fill`)}
                      >
                        Fill Form
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}

            {!loading && forms.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No forms assigned to you.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
