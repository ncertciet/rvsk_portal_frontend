import { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardMedia, CardContent, Chip,
  Dialog, DialogTitle, DialogContent, IconButton, CircularProgress,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import CollectionsIcon from '@mui/icons-material/Collections';

import { VskEvent, fetchPublishedEvents } from '../rvsk/events/eventsApi';

function fmtRange(start: string, end?: string | null): string {
  const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
  const s = new Date(start).toLocaleDateString('en-IN', opts);
  if (!end || end === start) return s;
  return `${new Date(start).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} – ${new Date(end).toLocaleDateString('en-IN', opts)}`;
}

export default function GalleryPage() {
  const [events, setEvents] = useState<VskEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<VskEvent | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setEvents(await fetchPublishedEvents());
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const coverUrl = (ev: VskEvent): string | undefined => {
    const cover = ev.images.find(i => i.id === ev.coverImageId) || ev.images[0];
    return cover?.imageUrl;
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>Gallery</Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Highlights from our workshops and events.
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : events.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CollectionsIcon sx={{ fontSize: 56, color: '#CBD5E1', mb: 1 }} />
          <Typography color="text.secondary">No events have been published yet.</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {events.map(ev => (
            <Grid item xs={12} sm={6} md={4} key={ev.id}>
              <Card
                elevation={3}
                onClick={() => setSelected(ev)}
                sx={{
                  borderRadius: 3, overflow: 'hidden', cursor: 'pointer',
                  transition: 'transform 0.25s, box-shadow 0.25s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                }}
              >
                <CardMedia
                  component="img" height="220"
                  image={coverUrl(ev) || 'https://via.placeholder.com/400x280?text=Event'}
                  alt={ev.name}
                  sx={{ transition: 'transform 0.4s', '&:hover': { transform: 'scale(1.05)' } }}
                />
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>{ev.name}</Typography>
                  <Chip
                    icon={<CalendarTodayIcon sx={{ fontSize: '16px !important' }} />}
                    label={fmtRange(ev.startDate, ev.endDate)}
                    size="small" variant="outlined" sx={{ color: 'text.secondary' }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    {ev.images.length} photo(s) — click to view gallery
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Event Gallery Dialog */}
      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="lg" fullWidth>
        {selected && (
          <>
            <DialogTitle sx={{ pr: 6 }}>
              {selected.name}
              <Typography variant="body2" color="text.secondary">
                {fmtRange(selected.startDate, selected.endDate)}
              </Typography>
              <IconButton onClick={() => setSelected(null)} sx={{ position: 'absolute', right: 8, top: 8 }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              {selected.description && (
                <Typography variant="body2" sx={{ mb: 2 }}>{selected.description}</Typography>
              )}
              <Grid container spacing={2}>
                {selected.images.map(img => (
                  <Grid item xs={12} sm={6} md={4} key={img.id}>
                    <Card sx={{ borderRadius: 2 }}>
                      <CardMedia component="img" height="200" image={img.imageUrl} alt={img.caption || selected.name} />
                      {img.caption && (
                        <CardContent sx={{ py: 1 }}>
                          <Typography variant="caption" color="text.secondary">{img.caption}</Typography>
                        </CardContent>
                      )}
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
}
