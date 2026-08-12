import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Divider, Button,
  Checkbox, FormControlLabel, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Alert,
  Accordion, AccordionSummary, AccordionDetails, Chip,
  CircularProgress, Snackbar,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import BuildIcon from '@mui/icons-material/Build';
import ComputerIcon from '@mui/icons-material/Computer';
import GroupsIcon from '@mui/icons-material/Groups';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
  fetchReviewSummary,
  downloadReviewPdf,
  submitProfile,
  ReviewSummaryDto,
  OfficerHistoryDto,
} from '../vskApi';

interface Step5ReviewSubmitProps {
  stateCode: string;
  isReadOnly?: boolean;
  onSubmitSuccess?: () => void;
}

export default function Step5ReviewSubmit({
  stateCode,
  isReadOnly = false,
  onSubmitSuccess,
}: Step5ReviewSubmitProps) {
  const [summary, setSummary] = useState<ReviewSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [certChecked, setCertChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(isReadOnly);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const loadSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchReviewSummary();
      setSummary(data);
      // If already submitted, mark as read-only
      if (data.profile?.submissionStatus === 'SUBMITTED') {
        setSubmitted(true);
      }
    } catch (err) {
      setError('Failed to load review summary. Please try again.');
      console.error('Error fetching review summary:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      const blob = await downloadReviewPdf();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `VSK_Review_${stateCode}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(url);
      setSnackbar({ open: true, message: 'PDF download started.', severity: 'info' });
    } catch (err) {
      console.error('Error downloading PDF:', err);
      setSnackbar({ open: true, message: 'Failed to download PDF. Please try again.', severity: 'error' });
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleSubmit = async () => {
    if (!summary?.allStepsComplete) return;
    try {
      setSubmitting(true);
      await submitProfile();
      setSubmitted(true);
      setSnackbar({ open: true, message: 'Submitted successfully', severity: 'success' });
      onSubmitSuccess?.();
    } catch (err) {
      console.error('Error submitting profile:', err);
      setSnackbar({ open: true, message: 'Submission failed. Please try again.', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const getStepStatus = (status?: string) => {
    return status === 'COMPLETE';
  };

  const incompleteSteps: string[] = [];
  if (summary?.profile) {
    if (!getStepStatus(summary.profile.step1Status)) incompleteSteps.push('Step 1: Officers & Committee');
    if (!getStepStatus(summary.profile.step2Status)) incompleteSteps.push('Step 2: Infrastructure');
    if (!getStepStatus(summary.profile.step3Status)) incompleteSteps.push('Step 3: Software');
    if (!getStepStatus(summary.profile.step4Status)) incompleteSteps.push('Step 4: PMU');
  }

  const canSubmit = certChecked && summary?.allStepsComplete && !submitted && !isReadOnly;

  const getOfficerByRole = (role: string): OfficerHistoryDto | undefined => {
    return summary?.officers?.find(o => o.officerRole === role && o.isActive === 1);
  };

  const ReadOnlyField = ({ label, value }: { label: string; value: string | number | undefined | null }) => (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={500}>{value ?? '—'}</Typography>
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }} color="text.secondary">Loading review summary...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
          <Button size="small" onClick={loadSummary} sx={{ ml: 2 }}>Retry</Button>
        </Alert>
      </Box>
    );
  }

  const secretary = getOfficerByRole('SECRETARY');
  const spd = getOfficerByRole('SPD');
  const nodal = getOfficerByRole('NODAL_OFFICER');

  return (
    <Box>
      {/* Submitted Banner */}
      {submitted && (
        <Alert
          icon={<CheckCircleIcon />}
          severity="success"
          sx={{ mb: 3, borderRadius: 2 }}
        >
          <Typography variant="body2" fontWeight={500}>
            Submitted successfully — this form is now read-only.
          </Typography>
        </Alert>
      )}

      <Typography variant="h6" fontWeight={600} sx={{ mb: 3, color: '#1E293B' }}>
        <CheckCircleIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#10B981' }} />
        Review & Submit
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Please review all the information below before submitting. Once submitted, the form will be locked for editing.
      </Typography>

      {/* Incomplete Steps Warning */}
      {!summary?.allStepsComplete && !submitted && (
        <Alert
          icon={<WarningAmberIcon />}
          severity="warning"
          sx={{ mb: 3, borderRadius: 2 }}
        >
          <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
            Not all steps are complete. Please complete the following before submitting:
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            {incompleteSteps.map((step) => (
              <li key={step}>
                <Typography variant="body2" color="warning.dark">{step}</Typography>
              </li>
            ))}
          </Box>
        </Alert>
      )}

      {/* Step 1: Officers Summary */}
      <Accordion defaultExpanded sx={{ mb: 2, borderRadius: 2, '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#F8FAFC' }}>
          <PersonIcon sx={{ mr: 1, color: '#7C3AED' }} />
          <Typography fontWeight={600}>Step 1: Officers & Committee Members</Typography>
          {!getStepStatus(summary?.profile?.step1Status) && !submitted && (
            <Chip label="Incomplete" size="small" color="warning" sx={{ ml: 2 }} />
          )}
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>Secretary</Typography>
              <ReadOnlyField label="Name" value={secretary?.name} />
              <ReadOnlyField label="Designation" value={secretary?.designation} />
              <ReadOnlyField label="Phone" value={secretary?.phone} />
              <ReadOnlyField label="WhatsApp" value={secretary?.whatsapp} />
              <ReadOnlyField label="Email" value={secretary?.email} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>SPD</Typography>
              <ReadOnlyField label="Name" value={spd?.name} />
              <ReadOnlyField label="Designation" value={spd?.designation} />
              <ReadOnlyField label="Phone" value={spd?.phone} />
              <ReadOnlyField label="WhatsApp" value={spd?.whatsapp} />
              <ReadOnlyField label="Email" value={spd?.email} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>Nodal Officer</Typography>
              <ReadOnlyField label="Name" value={nodal?.name} />
              <ReadOnlyField label="Designation" value={nodal?.designation} />
              <ReadOnlyField label="Phone" value={nodal?.phone} />
              <ReadOnlyField label="WhatsApp" value={nodal?.whatsapp} />
              <ReadOnlyField label="Email" value={nodal?.email} />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Committee Members */}
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Committee Members</Typography>
          {summary?.committeeMembers && summary.committeeMembers.length > 0 ? (
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Designation</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {summary.committeeMembers.map((member, idx) => (
                    <TableRow key={member.id ?? idx}>
                      <TableCell>{member.name || '—'}</TableCell>
                      <TableCell>{member.designation || '—'}</TableCell>
                      <TableCell>{member.phone || '—'}</TableCell>
                      <TableCell>{member.email || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              No committee members added.
            </Typography>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Step 2: Infrastructure Summary */}
      <Accordion defaultExpanded sx={{ mb: 2, borderRadius: 2, '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#F8FAFC' }}>
          <BuildIcon sx={{ mr: 1, color: '#7C3AED' }} />
          <Typography fontWeight={600}>Step 2: Infrastructure & Hardware</Typography>
          {!getStepStatus(summary?.profile?.step2Status) && !submitted && (
            <Chip label="Incomplete" size="small" color="warning" sx={{ ml: 2 }} />
          )}
        </AccordionSummary>
        <AccordionDetails>
          {summary?.infra ? (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>Room Measurements</Typography>
                <ReadOnlyField label="Length (ft)" value={summary.infra.roomLength} />
                <ReadOnlyField label="Width (ft)" value={summary.infra.roomWidth} />
                <ReadOnlyField label="Height (ft)" value={summary.infra.roomHeight} />
                {summary.infra.roomImageUrl ? (
                  <Box sx={{ mt: 1 }}>
                    <img
                      src={summary.infra.roomImageUrl}
                      alt="Room"
                      style={{ maxWidth: 120, maxHeight: 90, borderRadius: 4, objectFit: 'cover' }}
                    />
                  </Box>
                ) : (
                  <Chip label="No photo" size="small" color="default" variant="outlined" />
                )}
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>Screen Measurements</Typography>
                <ReadOnlyField label="Length (ft)" value={summary.infra.screenLength} />
                <ReadOnlyField label="Height (ft)" value={summary.infra.screenHeight} />
                {summary.infra.screenImageUrl ? (
                  <Box sx={{ mt: 1 }}>
                    <img
                      src={summary.infra.screenImageUrl}
                      alt="Screen"
                      style={{ maxWidth: 120, maxHeight: 90, borderRadius: 4, objectFit: 'cover' }}
                    />
                  </Box>
                ) : (
                  <Chip label="No photo" size="small" color="default" variant="outlined" />
                )}
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>Workstations</Typography>
                <ReadOnlyField label="Number of Workstations" value={summary.infra.workstationCount} />
                {summary.infra.workstationImageUrl ? (
                  <Box sx={{ mt: 1 }}>
                    <img
                      src={summary.infra.workstationImageUrl}
                      alt="Workstations"
                      style={{ maxWidth: 120, maxHeight: 90, borderRadius: 4, objectFit: 'cover' }}
                    />
                  </Box>
                ) : (
                  <Chip label="No photo" size="small" color="default" variant="outlined" />
                )}
              </Grid>
            </Grid>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No infrastructure data available.
            </Typography>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Step 3: Software Summary */}
      <Accordion defaultExpanded sx={{ mb: 2, borderRadius: 2, '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#F8FAFC' }}>
          <ComputerIcon sx={{ mr: 1, color: '#7C3AED' }} />
          <Typography fontWeight={600}>Step 3: Software Details</Typography>
          {!getStepStatus(summary?.profile?.step3Status) && !submitted && (
            <Chip label="Incomplete" size="small" color="warning" sx={{ ml: 2 }} />
          )}
        </AccordionSummary>
        <AccordionDetails>
          {summary?.software ? (
            <>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <ReadOnlyField
                    label="Starter Pack Available"
                    value={summary.software.starterPack === 1 ? 'Yes' : summary.software.starterPack === 0 ? 'No' : '—'}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ReadOnlyField label="Server Type" value={summary.software.serverType} />
                </Grid>
              </Grid>
              {summary.software.items && summary.software.items.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Software Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {summary.software.items.map((item, idx) => (
                        <TableRow key={item.id ?? idx}>
                          <TableCell>
                            {item.softwareName === 'Other'
                              ? `${item.customSoftwareName || 'Other'} (Other)`
                              : item.softwareName || '—'}
                          </TableCell>
                          <TableCell>{item.softwareType || '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">No software items added.</Typography>
              )}
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No software data available.
            </Typography>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Step 4: PMU Summary */}
      <Accordion defaultExpanded sx={{ mb: 2, borderRadius: 2, '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#F8FAFC' }}>
          <GroupsIcon sx={{ mr: 1, color: '#7C3AED' }} />
          <Typography fontWeight={600}>Step 4: PMU Details</Typography>
          {!getStepStatus(summary?.profile?.step4Status) && !submitted && (
            <Chip label="Incomplete" size="small" color="warning" sx={{ ml: 2 }} />
          )}
        </AccordionSummary>
        <AccordionDetails>
          {summary?.pmu ? (
            <>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <ReadOnlyField label="PMU Team Type" value={summary.pmu.pmuTeamType} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ReadOnlyField label="Total Team Members" value={summary.pmu.totalTeamMembers} />
                </Grid>
              </Grid>
              {summary.pmu.roles && summary.pmu.roles.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>No. of Members</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {summary.pmu.roles.map((role, idx) => (
                        <TableRow key={role.id ?? idx}>
                          <TableCell>
                            {role.roleName === 'Other'
                              ? `${role.customRoleName || 'Other'} (Other)`
                              : role.roleName || '—'}
                          </TableCell>
                          <TableCell>{role.noOfMembers ?? '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">No roles added.</Typography>
              )}
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No PMU data available.
            </Typography>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Certification & Submit */}
      <Card sx={{ mt: 3, borderRadius: 2, border: '1px solid #E2E8F0' }}>
        <CardContent sx={{ p: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={certChecked || submitted}
                onChange={e => setCertChecked(e.target.checked)}
                disabled={submitted || isReadOnly}
                color="primary"
              />
            }
            label={
              <Typography variant="body2">
                I certify that the information provided is correct.
              </Typography>
            }
          />
          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={downloadingPdf ? <CircularProgress size={16} /> : <DownloadIcon />}
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              sx={{ textTransform: 'none' }}
            >
              Download PDF
            </Button>
            {!submitted && !isReadOnly && (
              <Button
                variant="contained"
                startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                disabled={!canSubmit || submitting}
                onClick={handleSubmit}
                sx={{
                  textTransform: 'none',
                  bgcolor: '#10B981',
                  '&:hover': { bgcolor: '#059669' },
                  '&.Mui-disabled': { bgcolor: '#D1D5DB' },
                }}
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
