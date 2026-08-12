import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Grid, Typography, List, ListItem,
  ListItemIcon, ListItemText, Skeleton,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PublishIcon from '@mui/icons-material/Publish';
import InboxIcon from '@mui/icons-material/Inbox';
import DynamicFormIcon from '@mui/icons-material/DynamicForm';
import ImageIcon from '@mui/icons-material/Image';
import { RvskAdminHomeData, GalleryImage } from './types';
import { fetchRvskAdminHome, fetchGalleryImages } from './homeApi';
import GalleryCarousel from './GalleryCarousel';

const KPI_CONFIG = [
  { key: 'formsSent', label: 'Forms Sent', icon: <SendIcon />, color: '#3B82F6', bg: '#EFF6FF' },
  { key: 'formsPublished', label: 'Forms Published', icon: <PublishIcon />, color: '#8B5CF6', bg: '#F5F3FF' },
  { key: 'responsesReceived', label: 'Responses Received', icon: <InboxIcon />, color: '#10B981', bg: '#ECFDF5' },
] as const;

const MODULE_ICONS: Record<string, React.ReactNode> = {
  Forms: <DynamicFormIcon fontSize="small" sx={{ color: '#8B5CF6' }} />,
  Gallery: <ImageIcon fontSize="small" sx={{ color: '#10B981' }} />,
};

export default function RvskAdminHome() {
  const [data, setData] = useState<RvskAdminHomeData | null>(null);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const [homeData, images] = await Promise.all([
        fetchRvskAdminHome(),
        fetchGalleryImages(),
      ]);
      if (!cancelled) {
        setData(homeData);
        setGallery(images);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rounded" height={120} sx={{ mb: 3 }} />
        <Grid container spacing={2}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} sm={4} key={i}>
              <Skeleton variant="rounded" height={120} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rounded" height={200} sx={{ mt: 3 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Gallery Carousel */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          VSK Gallery
        </Typography>
        <GalleryCarousel images={gallery} />
      </Box>

      {/* Form Builder Stats - KPI Cards */}
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
        Form Builder Stats
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {KPI_CONFIG.map((kpi) => (
          <Grid item xs={12} sm={4} key={kpi.key}>
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                border: '1px solid #F1F5F9',
              }}
            >
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

      {/* Recent Activities Panel */}
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Recent Activities
      </Typography>
      <Card sx={{ borderRadius: 2, border: '1px solid #F1F5F9' }}>
        <List dense>
          {data?.recentActivities.map((activity) => (
            <ListItem key={activity.id} sx={{ borderBottom: '1px solid #F8FAFC' }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                {MODULE_ICONS[activity.module] || <DynamicFormIcon fontSize="small" />}
              </ListItemIcon>
              <ListItemText
                primary={activity.description}
                secondary={`${activity.performedBy} · ${new Date(activity.performedAt).toLocaleString()}`}
                primaryTypographyProps={{ fontSize: '0.85rem', color: '#1E293B' }}
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </ListItem>
          ))}
          {(!data?.recentActivities || data.recentActivities.length === 0) && (
            <ListItem>
              <ListItemText
                primary="No recent activity"
                primaryTypographyProps={{ color: 'text.secondary', textAlign: 'center' }}
              />
            </ListItem>
          )}
        </List>
      </Card>
    </Box>
  );
}
