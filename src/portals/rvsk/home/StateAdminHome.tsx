import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Grid, Typography, Chip, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Skeleton,
} from '@mui/material';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import DraftsIcon from '@mui/icons-material/Drafts';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { StateAdminHomeData, AssignedForm } from './types';
import { fetchStateAdminHome } from './homeApi';

const STATUS_CONFIG: Record<AssignedForm['status'], { label: string; color: 'warning' | 'info' | 'success' }> = {
  PENDING: { label: 'Pending', color: 'warning' },
  DRAFT_SAVED: { label: 'Draft Saved', color: 'info' },
  SUBMITTED: { label: 'Submitted', color: 'success' },
};

const COUNTER_CONFIG = [
  { key: 'pendingCount', label: 'Pending', icon: <HourglassEmptyIcon />, color: '#F59E0B', bg: '#FFFBEB' },
  { key: 'draftCount', label: 'Draft Saved', icon: <DraftsIcon />, color: '#3B82F6', bg: '#EFF6FF' },
  { key: 'submittedCount', label: 'Submitted', icon: <CheckCircleIcon />, color: '#10B981', bg: '#ECFDF5' },
] as const;

export default function StateAdminHome() {
  const navigate = useNavigate();
  const [data, setData] = useState<StateAdminHomeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const homeData = await fetchStateAdminHome();
      if (!cancelled) {
        setData(homeData);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} sm={4} key={i}>
              <Skeleton variant="rounded" height={100} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rounded" height={300} />
      </Box>
    );
  }

  const handleAction = (form: AssignedForm) => {
    if (form.status === 'SUBMITTED') {
      navigate(`/rvsk/my-forms/${form.id}/view`);
    } else {
      navigate(`/rvsk/my-forms/${form.id}/fill`);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Summary Counter Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {COUNTER_CONFIG.map((counter) => (
          <Grid item xs={12} sm={4} key={counter.key}>
            <Card sx={{ borderRadius: 2, border: '1px solid #F1F5F9' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2.5 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: counter.bg,
                    color: counter.color,
                  }}
                >
                  {counter.icon}
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={700} color="#1E293B">
                    {data ? data[counter.key] : 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {counter.label}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Assigned Forms Table */}
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
        Assigned Forms
      </Typography>

      {data?.assignedForms && data.assignedForms.length > 0 ? (
        <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid #F1F5F9', boxShadow: 'none' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Form Name</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Due Date</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }} align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.assignedForms.map((form) => {
                const statusConf = STATUS_CONFIG[form.status];
                return (
                  <TableRow key={form.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AssignmentIcon fontSize="small" sx={{ color: '#94A3B8' }} />
                        <Typography variant="body2" fontWeight={500}>
                          {form.title}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(form.dueDate).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={statusConf.label}
                        color={statusConf.color}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={form.status === 'SUBMITTED' ? <VisibilityIcon /> : <EditIcon />}
                        onClick={() => handleAction(form)}
                        sx={{ textTransform: 'none', fontSize: '0.8rem' }}
                      >
                        {form.status === 'SUBMITTED' ? 'View' : 'Fill'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Card sx={{ borderRadius: 2, border: '1px solid #F1F5F9', p: 4, textAlign: 'center' }}>
          <AssignmentIcon sx={{ fontSize: 48, color: '#CBD5E1', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            No forms assigned to your state currently
          </Typography>
        </Card>
      )}
    </Box>
  );
}
