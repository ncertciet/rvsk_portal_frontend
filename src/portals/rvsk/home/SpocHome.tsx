import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Grid, Typography, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, List, ListItem, ListItemIcon, ListItemText, Skeleton,
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { SpocHomeData } from './types';
import { fetchSpocHome } from './homeApi';

const KPI_CONFIG = [
  { key: 'openGrievances', label: 'Open', icon: <ErrorOutlineIcon />, color: '#EF4444', bg: '#FEF2F2' },
  { key: 'inProgressGrievances', label: 'In Progress', icon: <HourglassTopIcon />, color: '#F59E0B', bg: '#FFFBEB' },
  { key: 'resolvedGrievances', label: 'Resolved', icon: <CheckCircleOutlineIcon />, color: '#10B981', bg: '#ECFDF5' },
] as const;

const STATUS_COLORS: Record<string, 'error' | 'warning' | 'success' | 'default'> = {
  OPEN: 'error',
  IN_PROGRESS: 'warning',
  RESOLVED: 'success',
};

export default function SpocHome() {
  const navigate = useNavigate();
  const [data, setData] = useState<SpocHomeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const homeData = await fetchSpocHome();
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
        <Skeleton variant="rounded" height={250} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {KPI_CONFIG.map((kpi) => (
          <Grid item xs={12} sm={4} key={kpi.key}>
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
                    bgcolor: kpi.bg,
                    color: kpi.color,
                  }}
                >
                  {kpi.icon}
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={700} color="#1E293B">
                    {data ? data[kpi.key] : 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {kpi.label}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pending Actions Table */}
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
        Pending Actions
      </Typography>

      {data?.pendingActions && data.pendingActions.length > 0 ? (
        <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid #F1F5F9', boxShadow: 'none', mb: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Subject</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }} align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.pendingActions.map((action) => (
                <TableRow key={action.grievanceId} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {action.subject}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={action.status.replace('_', ' ')}
                      color={STATUS_COLORS[action.status] || 'default'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(action.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      onClick={() => navigate(`/rvsk/grievances/${action.grievanceId}`)}
                      sx={{ textTransform: 'none', fontSize: '0.8rem' }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Card sx={{ borderRadius: 2, border: '1px solid #F1F5F9', p: 4, textAlign: 'center', mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            No pending actions at this time
          </Typography>
        </Card>
      )}

      {/* Recent Grievance Activity */}
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Recent Grievance Activity
      </Typography>
      <Card sx={{ borderRadius: 2, border: '1px solid #F1F5F9' }}>
        <List dense>
          {data?.pendingActions.map((action) => (
            <ListItem key={action.grievanceId} sx={{ borderBottom: '1px solid #F8FAFC' }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <ReportProblemIcon fontSize="small" sx={{ color: '#F59E0B' }} />
              </ListItemIcon>
              <ListItemText
                primary={`${action.grievanceId}: ${action.subject}`}
                secondary={`Status: ${action.status.replace('_', ' ')} · ${new Date(action.createdAt).toLocaleString()}`}
                primaryTypographyProps={{ fontSize: '0.85rem', color: '#1E293B' }}
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </ListItem>
          ))}
        </List>
      </Card>
    </Box>
  );
}
