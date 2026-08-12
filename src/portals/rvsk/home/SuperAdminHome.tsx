import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Grid, Typography, List, ListItem,
  ListItemIcon, ListItemText, Skeleton, IconButton, Tooltip,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import DynamicFormIcon from '@mui/icons-material/DynamicForm';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import BuildIcon from '@mui/icons-material/Build';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import ImageIcon from '@mui/icons-material/Image';
import { SuperAdminHomeData, GalleryImage } from './types';
import { fetchSuperAdminHome, fetchGalleryImages } from './homeApi';
import GalleryCarousel from './GalleryCarousel';

const KPI_CONFIG = [
  { key: 'totalUsers', label: 'Total Users', icon: <PeopleIcon />, color: '#3B82F6', bg: '#EFF6FF' },
  { key: 'totalForms', label: 'Total Forms', icon: <DynamicFormIcon />, color: '#8B5CF6', bg: '#F5F3FF' },
  { key: 'totalGrievances', label: 'Total Grievances', icon: <ReportProblemIcon />, color: '#F59E0B', bg: '#FFFBEB' },
  { key: 'activeServices', label: 'Active Services', icon: <MiscellaneousServicesIcon />, color: '#10B981', bg: '#ECFDF5' },
] as const;

const QUICK_ACCESS = [
  { label: 'User Management', icon: <ManageAccountsIcon />, path: '/rvsk/admin/users', color: '#3B82F6' },
  { label: 'Form Builder', icon: <BuildIcon />, path: '/rvsk/form-builder', color: '#8B5CF6' },
  { label: 'Grievances', icon: <SupportAgentIcon />, path: '/rvsk/grievances', color: '#F59E0B' },
  { label: 'Permissions', icon: <AdminPanelSettingsIcon />, path: '/rvsk/user-permissions', color: '#10B981' },
];

const MODULE_ICONS: Record<string, React.ReactNode> = {
  Forms: <DynamicFormIcon fontSize="small" sx={{ color: '#8B5CF6' }} />,
  Users: <PersonIcon fontSize="small" sx={{ color: '#3B82F6' }} />,
  Grievances: <ReportProblemIcon fontSize="small" sx={{ color: '#F59E0B' }} />,
  Gallery: <ImageIcon fontSize="small" sx={{ color: '#10B981' }} />,
};

export default function SuperAdminHome() {
  const navigate = useNavigate();
  const [data, setData] = useState<SuperAdminHomeData | null>(null);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const [homeData, images] = await Promise.all([
        fetchSuperAdminHome(),
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
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rounded" height={120} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rounded" height={100} sx={{ mt: 3 }} />
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rounded" height={100} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Gallery Carousel */}
      {gallery.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            VSK Gallery
          </Typography>
          <GalleryCarousel images={gallery} />
        </Box>
      )}

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {KPI_CONFIG.map((kpi) => (
          <Grid item xs={12} sm={6} md={3} key={kpi.key}>
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

      {/* Quick Access Cards */}
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
        Quick Access
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {QUICK_ACCESS.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.path}>
            <Card
              sx={{
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: '1px solid #F1F5F9',
                '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transform: 'translateY(-2px)' },
              }}
              onClick={() => navigate(item.path)}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ color: item.color }}>{item.icon}</Box>
                  <Typography variant="body2" fontWeight={600} color="#374151">
                    {item.label}
                  </Typography>
                </Box>
                <Tooltip title={`Go to ${item.label}`}>
                  <IconButton size="small" sx={{ color: item.color }}>
                    <ArrowForwardIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity Log */}
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Recent Activity
      </Typography>
      <Card sx={{ borderRadius: 2, border: '1px solid #F1F5F9' }}>
        <List dense>
          {data?.recentActivities.map((activity) => (
            <ListItem key={activity.id} sx={{ borderBottom: '1px solid #F8FAFC' }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                {MODULE_ICONS[activity.module] || <DescriptionIcon fontSize="small" />}
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
