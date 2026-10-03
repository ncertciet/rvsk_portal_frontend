import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Typography, Button, Card, CardContent, CardMedia, Grid, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton,
  Snackbar, Alert, CircularProgress, Tooltip, Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EventIcon from '@mui/icons-material/Event';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PublishIcon from '@mui/icons-material/Publish';
import UnpublishedIcon from '@mui/icons-material/Unpublished';
import EditIcon from '@mui/icons-material/Edit';

import {
  VskEvent, fetchEvents, fetchEvent, createEvent, deleteEvent,
  uploadEventImage, updateImageCaption, deleteEventImage, setCoverImage,
  publishEvent, unpublishEvent,
} from './eventsApi';
import { getApiErrorMessage } from '../../../services/apiError';

type Snack = { open: boolean; message: string; severity: 'success' | 'error' | 'info' };

function fmtRange(start: string, end?: string | null): string {
  const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
  const s = new Date(start).toLocaleDateString('en-IN', opts);
  if (!end || end === start) return s;
  return `${new Date(start).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} – ${new Date(end).toLocaleDateString('en-IN', opts)}`;
}

export default function EventManagement() {
  const [events, setEvents] = useState<VskEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState<Snack>({ open: false, message: '', severity: 'info' });

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', startDate: '', endDate: '' });
  const [saving, setSaving] = useState(false);

  // Editor dialog
  const [editorEvent, setEditorEvent] = useState<VskEvent | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const notify = (message: string, severity: Snack['severity'] = 'info') =>
    setSnack({ open: true, message, severity });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setEvents(await fetchEvents());
    } catch (err) {
      notify(getApiErrorMessage(err, 'Failed to load events'), 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const reloadEditor = async (id: string) => {
    const fresh = await fetchEvent(id);
    setEditorEvent(fresh);
    setEvents(prev => prev.map(e => (e.id === id ? fresh : e)));
  };

  const handleCreate = async () => {
    if (!form.name.trim() || !form.startDate) {
      notify('Event name and start date are required.', 'error');
      return;
    }
    setSaving(true);
    try {
      const created = await createEvent({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        startDate: form.startDate,
        endDate: form.endDate || undefined,
      });
      setCreateOpen(false);
      setForm({ name: '', description: '', startDate: '', endDate: '' });
      await load();
      setEditorEvent(created);
      notify('Event created. Add images, pick a cover, then publish.', 'success');
    } catch (err) {
      notify(getApiErrorMessage(err, 'Failed to create event'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteEvent(id);
      setEvents(prev => prev.filter(e => e.id !== id));
      notify('Event deleted.', 'success');
    } catch (err) {
      notify(getApiErrorMessage(err, 'Failed to delete event'), 'error');
    }
  };

  const handleAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editorEvent) return;
    try {
      await uploadEventImage(editorEvent.id, file);
      await reloadEditor(editorEvent.id);
      notify('Image added.', 'success');
    } catch (err) {
      notify(getApiErrorMessage(err, 'Failed to add image'), 'error');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleCaptionBlur = async (imageId: string, caption: string) => {
    try {
      await updateImageCaption(imageId, caption);
    } catch (err) {
      notify(getApiErrorMessage(err, 'Failed to save caption'), 'error');
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!editorEvent) return;
    try {
      await deleteEventImage(imageId);
      await reloadEditor(editorEvent.id);
      notify('Image removed.', 'success');
    } catch (err) {
      notify(getApiErrorMessage(err, 'Failed to remove image'), 'error');
    }
  };

  const handleSetCover = async (imageId: string) => {
    if (!editorEvent) return;
    try {
      await setCoverImage(editorEvent.id, imageId);
      await reloadEditor(editorEvent.id);
      notify('Cover image set.', 'success');
    } catch (err) {
      notify(getApiErrorMessage(err, 'Failed to set cover image'), 'error');
    }
  };

  const handleTogglePublish = async (ev: VskEvent) => {
    try {
      const updated = ev.isPublished ? await unpublishEvent(ev.id) : await publishEvent(ev.id);
      if (editorEvent && editorEvent.id === ev.id) setEditorEvent(updated);
      setEvents(prev => prev.map(e => (e.id === ev.id ? updated : e)));
      notify(updated.isPublished ? 'Event published to the portal.' : 'Event unpublished.', 'success');
    } catch (err) {
      notify(getApiErrorMessage(err, 'Failed to update publish status'), 'error');
    }
  };

  const coverUrl = (ev: VskEvent): string | undefined => {
    const cover = ev.images.find(i => i.id === ev.coverImageId) || ev.images[0];
    return cover?.imageUrl;
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="#1E293B">Event Management</Typography>
          <Typography variant="body2" color="text.secondary">
            Create events, upload photos, choose a cover image, and publish to the public portal.
          </Typography>
        </Box>
        <Button
          variant="contained" startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
          sx={{ bgcolor: '#7C3AED', '&:hover': { bgcolor: '#6D28D9' }, textTransform: 'none' }}
        >
          Create Event
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : events.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <EventIcon sx={{ fontSize: 56, color: '#CBD5E1', mb: 1 }} />
          <Typography color="text.secondary">No events yet. Create your first event.</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {events.map(ev => (
            <Grid item xs={12} sm={6} md={4} key={ev.id}>
              <Card sx={{ borderRadius: 2, border: '1px solid #F1F5F9', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="160"
                  image={coverUrl(ev) || 'https://via.placeholder.com/400x240?text=No+Image'}
                  alt={ev.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>{ev.name}</Typography>
                    <Chip
                      size="small"
                      label={ev.isPublished ? 'Published' : 'Draft'}
                      color={ev.isPublished ? 'success' : 'default'}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">{fmtRange(ev.startDate, ev.endDate)}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }} noWrap>
                    {ev.description || '—'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">{ev.images.length} photo(s)</Typography>
                </CardContent>
                <Box sx={{ p: 1.5, pt: 0, display: 'flex', gap: 1 }}>
                  <Button size="small" startIcon={<EditIcon />} onClick={() => setEditorEvent(ev)} sx={{ textTransform: 'none' }}>
                    Manage
                  </Button>
                  <Button
                    size="small"
                    startIcon={ev.isPublished ? <UnpublishedIcon /> : <PublishIcon />}
                    onClick={() => handleTogglePublish(ev)}
                    sx={{ textTransform: 'none' }}
                  >
                    {ev.isPublished ? 'Unpublish' : 'Publish'}
                  </Button>
                  <Tooltip title="Delete event">
                    <IconButton size="small" color="error" onClick={() => handleDeleteEvent(ev.id)} sx={{ ml: 'auto' }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Event Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Event</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Event Name" fullWidth required sx={{ mb: 2 }}
            value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
          <TextField
            label="Description" fullWidth multiline rows={3} sx={{ mb: 2 }}
            value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Start Date" type="date" fullWidth required InputLabelProps={{ shrink: true }}
                value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="End Date (optional)" type="date" fullWidth InputLabelProps={{ shrink: true }}
                value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                helperText="Leave blank for single-day events"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleCreate} variant="contained" disabled={saving}
            sx={{ bgcolor: '#7C3AED', '&:hover': { bgcolor: '#6D28D9' } }}>
            {saving ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Event Editor Dialog */}
      <Dialog open={!!editorEvent} onClose={() => setEditorEvent(null)} maxWidth="md" fullWidth>
        {editorEvent && (
          <>
            <DialogTitle>
              {editorEvent.name}
              <Chip
                size="small"
                label={editorEvent.isPublished ? 'Published' : 'Draft'}
                color={editorEvent.isPublished ? 'success' : 'default'}
                sx={{ ml: 1 }}
              />
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="caption" color="text.secondary">
                {fmtRange(editorEvent.startDate, editorEvent.endDate)}
              </Typography>
              {editorEvent.description && (
                <Typography variant="body2" sx={{ mt: 0.5, mb: 2 }}>{editorEvent.description}</Typography>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" fontWeight={600}>Photos ({editorEvent.images.length})</Typography>
                <input ref={fileRef} type="file" accept="image/*" hidden id="event-image-input" onChange={handleAddImage} />
                <label htmlFor="event-image-input">
                  <Button component="span" size="small" startIcon={<CloudUploadIcon />} sx={{ textTransform: 'none' }}>
                    Add Photo
                  </Button>
                </label>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Click the star to set the cover image shown on the portal. Captions save automatically.
              </Typography>
              <Divider sx={{ my: 1.5 }} />

              {editorEvent.images.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                  No photos yet. Add at least one before publishing.
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {editorEvent.images.map(img => {
                    const isCover = img.id === editorEvent.coverImageId;
                    return (
                      <Grid item xs={6} sm={4} key={img.id}>
                        <Card sx={{ borderRadius: 2, border: isCover ? '2px solid #7C3AED' : '1px solid #E2E8F0' }}>
                          <Box sx={{ position: 'relative' }}>
                            <CardMedia component="img" height="110" image={img.imageUrl} alt={img.caption || 'event photo'} />
                            {isCover && (
                              <Chip label="Cover" size="small" sx={{ position: 'absolute', top: 4, left: 4, bgcolor: '#7C3AED', color: '#fff', height: 20, fontSize: '0.65rem' }} />
                            )}
                          </Box>
                          <Box sx={{ p: 1 }}>
                            <TextField
                              variant="standard" placeholder="Caption" fullWidth defaultValue={img.caption || ''}
                              onBlur={e => handleCaptionBlur(img.id, e.target.value)}
                              inputProps={{ style: { fontSize: 12 } }}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                              <Tooltip title={isCover ? 'Cover image' : 'Set as cover'}>
                                <span>
                                  <IconButton size="small" disabled={isCover} onClick={() => handleSetCover(img.id)}
                                    sx={{ color: isCover ? '#7C3AED' : '#94A3B8' }}>
                                    {isCover ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip title="Remove photo">
                                <IconButton size="small" color="error" onClick={() => handleDeleteImage(img.id)}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditorEvent(null)} color="inherit">Close</Button>
              <Button
                variant="contained"
                startIcon={editorEvent.isPublished ? <UnpublishedIcon /> : <PublishIcon />}
                onClick={() => handleTogglePublish(editorEvent)}
                sx={{ bgcolor: editorEvent.isPublished ? '#64748B' : '#10B981', '&:hover': { bgcolor: editorEvent.isPublished ? '#475569' : '#059669' } }}
              >
                {editorEvent.isPublished ? 'Unpublish' : 'Publish'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack(s => ({ ...s, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
