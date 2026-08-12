import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { DUMMY_FORMS, DUMMY_RESPONSES } from './dummyData';

const STATUS_CHIP_COLORS: Record<string, 'warning' | 'info' | 'success'> = {
  PENDING: 'warning',
  DRAFT: 'info',
  SUBMITTED: 'success',
};

export default function FormResponses() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // TODO: Fetch form details and responses from API
  // const form = await apiClient.get(`/forms/${id}`);
  // const responses = await apiClient.get(`/forms/${id}/responses`);
  const form = DUMMY_FORMS.find((f) => f.id === id);

  const handleExport = () => {
    // TODO: Call API to export responses as Excel
    // window.open(`/api/v1/forms/${id}/responses/export`);
    alert('Export feature will be available after backend integration.');
  };

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
            <Typography variant="body2" color="text.secondary">Due: {form.dueDate}</Typography>
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
              <TableCell sx={{ fontWeight: 600 }}>State Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Submission Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Submitted By</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Submitted Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {DUMMY_RESPONSES.map((response) => (
              <TableRow key={response.stateCode} hover>
                <TableCell>{response.stateName}</TableCell>
                <TableCell>
                  <Chip
                    label={response.submissionStatus.replace('_', ' ')}
                    size="small"
                    color={STATUS_CHIP_COLORS[response.submissionStatus]}
                  />
                </TableCell>
                <TableCell>{response.submittedBy || '—'}</TableCell>
                <TableCell>{response.submittedDate || '—'}</TableCell>
                <TableCell align="center">
                  {response.submissionStatus === 'SUBMITTED' && (
                    <Button
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => navigate(`/rvsk/form-builder/${id}/responses/${response.stateCode}`)}
                    >
                      View
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
