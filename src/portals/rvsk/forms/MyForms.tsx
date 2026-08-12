import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Button,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { DUMMY_MY_FORMS } from './dummyData';

const STATUS_CONFIG: Record<string, { label: string; color: 'warning' | 'info' | 'success' }> = {
  PENDING: { label: 'Pending', color: 'warning' },
  DRAFT_SAVED: { label: 'Draft Saved', color: 'info' },
  SUBMITTED: { label: 'Submitted', color: 'success' },
};

export default function MyForms() {
  const navigate = useNavigate();

  // TODO: Fetch assigned forms from API
  // const forms = await apiClient.get('/forms/my-forms');

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
            {DUMMY_MY_FORMS.map((form) => {
              const statusCfg = STATUS_CONFIG[form.status];
              return (
                <TableRow key={form.id} hover>
                  <TableCell>{form.title}</TableCell>
                  <TableCell>{form.dueDate}</TableCell>
                  <TableCell>
                    <Chip label={statusCfg.label} size="small" color={statusCfg.color} />
                  </TableCell>
                  <TableCell align="center">
                    {form.status === 'SUBMITTED' ? (
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
                        onClick={() => navigate(`/rvsk/my-forms/${form.id}/fill`)}
                      >
                        Fill Form
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {DUMMY_MY_FORMS.length === 0 && (
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
