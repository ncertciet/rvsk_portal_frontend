import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DownloadIcon from '@mui/icons-material/Download';
import apiClient from '../../services/apiClient';
import { GRIEVANCE_STATUSES, SPOC_ROLES, ADMIN_ROLES } from './constants';
import StatusBadge from './StatusBadge';
import ActivityTimeline from './ActivityTimeline';

interface RootState {
  auth: {
    user: {
      id: string;
      username: string;
      displayName: string;
      role: string;
      stateCode: string | null;
      districtCode: string | null;
    } | null;
  };
}

const GrievanceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();

  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Response form
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Internal note form
  const [noteText, setNoteText] = useState('');

  // Status change
  const [statusDialog, setStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusComment, setStatusComment] = useState('');

  // Reopen/Close
  const [reopenDialog, setReopenDialog] = useState(false);
  const [reopenReason, setReopenReason] = useState('');

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/grievances/${id}`);
      setDetail(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load grievance details');
    } finally {
      setLoading(false);
    }
  };

  const isSpocOrAdmin = user && SPOC_ROLES.includes(user.role);
  const isCreator = user && detail && detail.createdBy === user.id;

  // Status transition helper
  const getNextStatuses = (): string[] => {
    if (!detail) return [];
    const current = detail.status;
    const transitions: Record<string, string[]> = {
      ASSIGNED: ['UNDER_REVIEW'],
      UNDER_REVIEW: ['IN_PROGRESS'],
      IN_PROGRESS: ['RESPONSE_PROVIDED'],
      REOPENED: ['UNDER_REVIEW'],
    };
    return transitions[current] || [];
  };

  const handleStatusChange = async () => {
    if (!newStatus) return;
    setSubmitting(true);
    try {
      await apiClient.put(`/grievances/${id}/status`, {
        status: newStatus,
        comment: statusComment || undefined,
      });
      setStatusDialog(false);
      setNewStatus('');
      setStatusComment('');
      fetchDetail();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddResponse = async () => {
    if (!responseText.trim()) return;
    setSubmitting(true);
    try {
      await apiClient.post(`/grievances/${id}/response`, {
        responseText: responseText.trim(),
      });
      setResponseText('');
      fetchDetail();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add response');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setSubmitting(true);
    try {
      await apiClient.post(`/grievances/${id}/notes`, { note: noteText.trim() });
      setNoteText('');
      fetchDetail();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add note');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReopen = async () => {
    setSubmitting(true);
    try {
      await apiClient.post(`/grievances/${id}/reopen`, { reason: reopenReason });
      setReopenDialog(false);
      setReopenReason('');
      fetchDetail();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reopen');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async () => {
    setSubmitting(true);
    try {
      await apiClient.post(`/grievances/${id}/close`, { comment: 'Accepted resolution' });
      fetchDetail();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to close');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !detail) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!detail) return null;

  return (
    <Box sx={{ p: 3 }}>
      {/* Back + Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" fontWeight={700}>
              {detail.grievanceId}
            </Typography>
            <StatusBadge status={detail.status} size="medium" />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {detail.category} {detail.subCategory ? `/ ${detail.subCategory}` : ''}
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Column: Details + Timeline */}
        <Grid item xs={12} md={8}>
          {/* Subject & Description */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              {detail.subject}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
              {detail.description || 'No description provided.'}
            </Typography>
          </Paper>

          {/* Requester & SPOC Info */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <Card elevation={0} sx={{ border: '1px solid #E5E7EB', height: '100%' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">Raised By</Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {detail.createdByName || 'Unknown'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {detail.createdByRole?.replace(/_/g, ' ')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(detail.createdAt).toLocaleString('en-IN')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card elevation={0} sx={{ border: '1px solid #E5E7EB', height: '100%' }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">Assigned To</Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {detail.assignedToName || 'Unassigned'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {detail.assignedToRole?.replace(/_/g, ' ') || ''}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Attachments */}
          {detail.attachments && detail.attachments.length > 0 && (
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                <AttachFileIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                Attachments ({detail.attachments.length})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {detail.attachments.map((att: any) => (
                  <Chip
                    key={att.id}
                    label={att.fileName}
                    variant="outlined"
                    icon={<DownloadIcon />}
                    onClick={async () => {
                      try {
                        const res = await apiClient.get(`/grievances/${id}/attachments/${att.id}`, { responseType: 'blob' });
                        const url = window.URL.createObjectURL(new Blob([res.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = att.fileName || 'download';
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                        window.URL.revokeObjectURL(url);
                      } catch (err) {
                        console.error('Download failed', err);
                      }
                    }}
                  />
                ))}
              </Box>
            </Paper>
          )}

          {/* Activity Timeline */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Activity Timeline
            </Typography>
            <ActivityTimeline
              entries={detail.history || []}
              showInternal={isSpocOrAdmin || false}
            />
          </Paper>
        </Grid>

        {/* Right Column: Actions */}
        <Grid item xs={12} md={4}>
          {/* SPOC Action Console */}
          {isSpocOrAdmin && (
            <>
              {/* Status Change */}
              {getNextStatuses().length > 0 && (
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                    Update Status
                  </Typography>
                  {getNextStatuses().map((s) => (
                    <Button
                      key={s}
                      variant="outlined"
                      size="small"
                      fullWidth
                      sx={{ mb: 1 }}
                      onClick={() => { setNewStatus(s); setStatusDialog(true); }}
                    >
                      Move to {GRIEVANCE_STATUSES[s]?.label || s}
                    </Button>
                  ))}
                </Paper>
              )}

              {/* Add Response (only if IN_PROGRESS) */}
              {detail.status === 'IN_PROGRESS' && (
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                    Provide Response
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    size="small"
                    placeholder="Type your response..."
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ mt: 1 }}
                    disabled={!responseText.trim() || submitting}
                    onClick={handleAddResponse}
                  >
                    Send Response
                  </Button>
                </Paper>
              )}

              {/* Internal Note */}
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  Internal Note
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                  placeholder="Add internal note (not visible to raiser)..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                />
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ mt: 1 }}
                  disabled={!noteText.trim() || submitting}
                  onClick={handleAddNote}
                >
                  Add Note
                </Button>
              </Paper>
            </>
          )}

          {/* Raiser Actions: Accept / Reopen */}
          {isCreator && detail.status === 'RESPONSE_PROVIDED' && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                Response Received
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                The SPOC has provided a response. You can accept and close, or reopen if unsatisfied.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  onClick={handleClose}
                  disabled={submitting}
                >
                  Accept & Close
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => setReopenDialog(true)}
                  disabled={submitting}
                >
                  Reopen
                </Button>
              </Box>
            </Paper>
          )}

          {/* Responses list */}
          {detail.responses && detail.responses.length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                Responses ({detail.responses.length})
              </Typography>
              {detail.responses.map((resp: any) => (
                <Box key={resp.id} sx={{ mb: 2, p: 1.5, backgroundColor: '#F0FDF4', borderRadius: 1 }}>
                  <Typography variant="body2">{resp.responseText}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(resp.respondedAt).toLocaleString('en-IN')}
                  </Typography>
                </Box>
              ))}
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Status Change Dialog */}
      <Dialog open={statusDialog} onClose={() => setStatusDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Status to {GRIEVANCE_STATUSES[newStatus]?.label || newStatus}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Comment (optional)"
            value={statusComment}
            onChange={(e) => setStatusComment(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleStatusChange} disabled={submitting}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reopen Dialog */}
      <Dialog open={reopenDialog} onClose={() => setReopenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reopen Grievance</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please provide a reason why the response was unsatisfactory.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reason for reopening"
            value={reopenReason}
            onChange={(e) => setReopenReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReopenDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleReopen} disabled={submitting}>
            Reopen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GrievanceDetail;
