import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, TextField, Button,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
  Paper, TablePagination, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, Tabs, Tab, Chip, InputAdornment,
  Snackbar, Alert, LinearProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  DashboardKpiDto, StateVskSummaryDto, StateFullDetailsDto,
  OfficerHistoryDto,
  fetchAdminDashboard, fetchAdminStates, fetchStateFullDetails, exportVskData,
} from './vskApi';

interface KpiCardProps { title: string; value: number | string; color: string; }

function KpiCard({ title, value, color }: KpiCardProps) {
  return (
    <Card sx={{ borderTop: `4px solid ${color}`, height: '100%' }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary">{title}</Typography>
        <Typography variant="h4" fontWeight={700} sx={{ mt: 1, color }}>{value}</Typography>
      </CardContent>
    </Card>
  );
}

function StatusIcon({ status }: { status: boolean | undefined }) {
  if (status === undefined) {
    return <CancelIcon sx={{ color: '#9CA3AF', fontSize: 20 }} />;
  }
  return status
    ? <CheckCircleIcon sx={{ color: '#16A34A', fontSize: 20 }} />
    : <CancelIcon sx={{ color: '#DC2626', fontSize: 20 }} />;
}

function StateDetailDialog({ open, onClose, stateCode }: { open: boolean; onClose: () => void; stateCode: string | null }) {
  const [data, setData] = useState<StateFullDetailsDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (open && stateCode) {
      setLoading(true);
      setTab(0);
      fetchStateFullDetails(stateCode)
        .then(setData)
        .catch(() => setData(null))
        .finally(() => setLoading(false));
    }
  }, [open, stateCode]);

  const renderField = (label: string, value: string | number | null | undefined) => (
    <Grid item xs={12} sm={6}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={500}>{value ?? '-'}</Typography>
    </Grid>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {data?.stateName ?? stateCode} — Full VSK Details
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
        ) : !data ? (
          <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>No data found.</Typography>
        ) : (
          <>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 2 }}>
              <Tab label="Profile" />
              <Tab label="Officers" />
              <Tab label="Infra" />
              <Tab label="Software" />
              <Tab label="PMU" />
            </Tabs>

            {tab === 0 && (
              <Grid container spacing={1}>
                {renderField('Address Line 1', data.profile?.addressLine1)}
                {renderField('Address Line 2', data.profile?.addressLine2)}
                {renderField('City', data.profile?.city)}
                {renderField('Pincode', data.profile?.pincode)}
                {renderField('Facilitated By', data.profile?.facilitatedBy)}
                {renderField('Other Scheme Name', data.profile?.otherSchemeName)}
                {renderField('Step 1 Status', data.profile?.step1Status)}
                {renderField('Step 2 Status', data.profile?.step2Status)}
                {renderField('Step 3 Status', data.profile?.step3Status)}
                {renderField('Step 4 Status', data.profile?.step4Status)}
                {renderField('Submission Status', data.profile?.submissionStatus)}
              </Grid>
            )}

            {tab === 1 && (
              <Box>
                {data.officers && data.officers.length > 0 ? (
                  (['SECRETARY', 'SPD', 'NODAL_OFFICER'] as const).map((role) => {
                    const activeOfficer = data.officers?.find(
                      (o: OfficerHistoryDto) => o.officerRole === role && o.isActive === 1
                    );
                    return (
                      <Box key={role} sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5, color: '#7C3AED' }}>
                          {role === 'NODAL_OFFICER' ? 'Nodal Officer' : role === 'SPD' ? 'SPD' : 'Secretary'}
                        </Typography>
                        {activeOfficer ? (
                          <Grid container spacing={1}>
                            {renderField('Name', activeOfficer.name)}
                            {renderField('Designation', activeOfficer.designation)}
                            {renderField('Phone', activeOfficer.phone)}
                            {renderField('Email', activeOfficer.email)}
                          </Grid>
                        ) : (
                          <Typography variant="body2" color="text.secondary">Not assigned</Typography>
                        )}
                      </Box>
                    );
                  })
                ) : (
                  <Typography variant="body2" color="text.secondary">No officer data available.</Typography>
                )}
              </Box>
            )}

            {tab === 2 && (
              <Grid container spacing={1}>
                {renderField('Room Dimensions', data.infra ? `${data.infra.roomLength ?? '-'} × ${data.infra.roomWidth ?? '-'} × ${data.infra.roomHeight ?? '-'} ft` : '-')}
                {renderField('Screen Dimensions', data.infra ? `${data.infra.screenLength ?? '-'} × ${data.infra.screenHeight ?? '-'} ft` : '-')}
                {renderField('Workstation Count', data.infra?.workstationCount)}
              </Grid>
            )}

            {tab === 3 && (
              <Box>
                <Grid container spacing={1} sx={{ mb: 2 }}>
                  {renderField('Starter Pack', data.software?.starterPack === 1 ? 'Yes' : data.software?.starterPack === 0 ? 'No' : '-')}
                  {renderField('Server Type', data.software?.serverType)}
                </Grid>
                {data.software?.items && data.software.items.length > 0 && (
                  <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                          <TableCell><strong>Software Name</strong></TableCell>
                          <TableCell><strong>Type</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.software.items.map((item, idx) => (
                          <TableRow key={item.id || idx}>
                            <TableCell>{item.customSoftwareName || item.softwareName || '-'}</TableCell>
                            <TableCell>{item.softwareType || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}

            {tab === 4 && (
              <Box>
                <Grid container spacing={1} sx={{ mb: 2 }}>
                  {renderField('PMU Team Type', data.pmu?.pmuTeamType)}
                  {renderField('Total Team Members', data.pmu?.totalTeamMembers)}
                </Grid>
                {data.pmu?.roles && data.pmu.roles.length > 0 && (
                  <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                          <TableCell><strong>Role</strong></TableCell>
                          <TableCell><strong>Members</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.pmu.roles.map((role, idx) => (
                          <TableRow key={role.id || idx}>
                            <TableCell>{role.customRoleName || role.roleName || '-'}</TableCell>
                            <TableCell>{role.noOfMembers ?? '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function VskAdminDashboard() {
  const [kpi, setKpi] = useState<DashboardKpiDto | null>(null);
  const [states, setStates] = useState<StateVskSummaryDto[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  useEffect(() => {
    fetchAdminDashboard().then(setKpi).catch(() => setKpi(null));
  }, []);

  useEffect(() => {
    loadStates();
  }, [page, rowsPerPage, search]);

  async function loadStates() {
    setLoading(true);
    try {
      const result = await fetchAdminStates(page, rowsPerPage, search || undefined);
      setStates(result.content);
      setTotalElements(result.totalElements);
    } catch {
      setStates([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportVskData();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'vsk_data_export.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setSnackbar({ open: true, message: 'Export downloaded successfully', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to export data', severity: 'error' });
    } finally {
      setExporting(false);
    }
  };

  const handleViewState = (stateCode: string) => {
    setSelectedState(stateCode);
    setDialogOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>VSK Admin Dashboard</Typography>
        <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleExport}
          disabled={exporting}
          sx={{ bgcolor: '#7C3AED', '&:hover': { bgcolor: '#6D28D9' }, textTransform: 'none' }}>
          {exporting ? 'Exporting...' : 'Export Excel'}
        </Button>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Total States/UTs" value={kpi?.totalStates ?? '—'} color="#3B82F6" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="With Profile" value={kpi?.statesWithProfile ?? '—'} color="#16A34A" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Pending" value={kpi?.statesPending ?? '—'} color="#F59E0B" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Completion %" value={kpi ? `${kpi.completionPercentage}%` : '—'} color="#7C3AED" />
        </Grid>
      </Grid>

      {/* Search */}
      <Box sx={{ mb: 2 }}>
        <TextField
          size="small" placeholder="Search by state name or code..."
          value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
          }}
          sx={{ width: 320 }}
        />
      </Box>

      {/* States Table */}
      <TableContainer component={Paper} variant="outlined">
        {loading && <LinearProgress />}
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#F8FAFC' }}>
              <TableCell><strong>State</strong></TableCell>
              <TableCell align="center"><strong>Profile</strong></TableCell>
              <TableCell align="center"><strong>Infra</strong></TableCell>
              <TableCell align="center"><strong>Software</strong></TableCell>
              <TableCell align="center"><strong>PMU</strong></TableCell>
              <TableCell align="center"><strong>Secretary</strong></TableCell>
              <TableCell align="center"><strong>Progress</strong></TableCell>
              <TableCell align="center"><strong>Action</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {states.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">No states found.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              states.map(row => (
                <TableRow key={row.stateCode} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>{row.stateName}</Typography>
                    <Typography variant="caption" color="text.secondary">{row.stateCode}</Typography>
                  </TableCell>
                  <TableCell align="center"><StatusIcon status={row.hasProfile} /></TableCell>
                  <TableCell align="center"><StatusIcon status={row.hasInfra} /></TableCell>
                  <TableCell align="center"><StatusIcon status={row.hasSoftware} /></TableCell>
                  <TableCell align="center"><StatusIcon status={row.hasPmu} /></TableCell>
                  <TableCell align="center"><StatusIcon status={row.hasSecretary} /></TableCell>
                  <TableCell align="center">
                    <Chip size="small" label={`${row.completedSections}/${row.totalSections}`}
                      color={row.completedSections === row.totalSections ? 'success' : 'default'}
                      variant="outlined" />
                  </TableCell>
                  <TableCell align="center">
                    <Button size="small" variant="text" startIcon={<VisibilityIcon />}
                      onClick={() => handleViewState(row.stateCode)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div" count={totalElements}
          page={page} onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </TableContainer>

      {/* State Detail Dialog */}
      <StateDetailDialog open={dialogOpen} onClose={() => setDialogOpen(false)} stateCode={selectedState} />

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
