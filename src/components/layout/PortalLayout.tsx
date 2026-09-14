import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, Divider, IconButton, AppBar, Toolbar, Avatar, Menu, MenuItem,
  Tooltip, Collapse, CircularProgress, Alert,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SchoolIcon from '@mui/icons-material/School';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import VerifiedIcon from '@mui/icons-material/Verified';
import ApartmentIcon from '@mui/icons-material/Apartment';
import DynamicFormIcon from '@mui/icons-material/DynamicForm';
import DescriptionIcon from '@mui/icons-material/Description';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FolderIcon from '@mui/icons-material/Folder';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';
import { RootState } from '../../store';
import apiClient from '../../services/apiClient';
import { getApiErrorMessage } from '../../services/apiError';

interface Props { portalType: 'rvsk' | 'vsk'; }

const DRAWER_WIDTH = 260;
const DRAWER_COLLAPSED = 68;
const HEADER_HEIGHT = 56;

interface NavChild {
  label: string;
  icon: React.ReactNode;
  path: string;
}

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  children?: NavChild[];
}

// Icon mapping from database icon string to React component
const ICON_MAP: Record<string, React.ReactNode> = {
  Home: <HomeIcon />, Dashboard: <DashboardIcon />, School: <SchoolIcon />,
  Assessment: <AssessmentIcon />, AccountBalance: <AccountBalanceIcon />,
  Verified: <VerifiedIcon />, Apartment: <ApartmentIcon />,
  DynamicForm: <DynamicFormIcon />, Description: <DescriptionIcon />,
  AdminPanelSettings: <AdminPanelSettingsIcon />, Person: <PersonIcon />,
};

function getIcon(iconName: string | null, small?: boolean): React.ReactNode {
  if (!iconName) return <FolderIcon fontSize={small ? 'small' : undefined} />;
  const Icon = ICON_MAP[iconName];
  return Icon || <FolderIcon fontSize={small ? 'small' : undefined} />;
}

// Convert API menu tree response to NavItem[]
function apiTreeToNavItems(modules: any[]): NavItem[] {
  return modules.map((mod) => {
    const pages = mod.pages || [];
    const hasMultiplePages = pages.length > 1;
    const firstPage = pages[0];
    return {
      label: mod.name,
      icon: getIcon(mod.icon),
      path: firstPage?.routePath || '',
      children: hasMultiplePages ? pages.map((p: any) => ({
        label: p.name,
        icon: getIcon(p.icon, true),
        path: p.routePath,
      })) : undefined,
    };
  });
}

// VSK portal uses a simple static nav (not database-driven)
const vskNav: NavItem[] = [
  { label: 'Home', icon: <HomeIcon />, path: '/vsk/home' },
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/vsk/dashboard' },
];

export default function PortalLayout({ portalType }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Dynamic menu state. VSK uses a static nav; RVSK is strictly DB-driven
  // (no fake fallback menu â€” a failure must surface so it can be fixed).
  const [navItems, setNavItems] = useState<NavItem[]>(portalType === 'vsk' ? vskNav : []);
  const [menuLoading, setMenuLoading] = useState(portalType === 'rvsk');
  const [menuError, setMenuError] = useState<string | null>(null);

  // Fetch menu from API for RVSK portal
  useEffect(() => {
    if (portalType !== 'rvsk') return;
    setMenuLoading(true);
    apiClient.get('/menu/tree')
      .then(res => {
        const tree = res.data;
        if (tree?.modules && tree.modules.length > 0) {
          setNavItems(apiTreeToNavItems(tree.modules));
          setMenuError(null);
        } else {
          setNavItems([]);
          setMenuError('No menu items are available for your account.');
        }
      })
      .catch((err) => {
        setNavItems([]);
        setMenuError(getApiErrorMessage(err, 'Unable to load the menu. Please try again.'));
      })
      .finally(() => setMenuLoading(false));
  }, [portalType]);

  const drawerWidth = collapsed ? DRAWER_COLLAPSED : DRAWER_WIDTH;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const toggleExpand = (path: string) => {
    setExpandedItems(prev =>
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  };

  const isChildActive = (item: NavItem) => {
    if (!item.children) return false;
    return item.children.some(child => location.pathname === child.path);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: '#1E293B', boxShadow: '0 1px 3px rgba(0,0,0,0.12)', height: HEADER_HEIGHT }}>
        <Toolbar sx={{ minHeight: `${HEADER_HEIGHT}px !important`, px: 2 }}>
          <IconButton color="inherit" onClick={() => setCollapsed(!collapsed)} sx={{ mr: 1 }}>
            {collapsed ? <MenuIcon /> : <ChevronLeftIcon />}
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1" fontWeight={700} color="#fff" sx={{ letterSpacing: 0.5 }}>
              Rashtriya Vidya Samiksha Kendra
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8', ml: 1 }}>| Ministry of Education</Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="#E2E8F0" sx={{ mr: 1 }}>{user?.displayName || 'User'}</Typography>
            <Tooltip title="Account">
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#7C3AED', fontSize: 14 }}>
                  {user?.displayName?.charAt(0) || <PersonIcon />}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
              <MenuItem disabled><Typography variant="body2" color="text.secondary">{user?.username}</Typography></MenuItem>
              <MenuItem disabled><Typography variant="caption" color="text.secondary">Role: {user?.role}</Typography></MenuItem>
              <Divider />
              <MenuItem onClick={() => { setAnchorEl(null); navigate('/rvsk/home'); }}><ListItemIcon><HomeIcon fontSize="small" /></ListItemIcon>Home</MenuItem>
              <MenuItem onClick={() => { setAnchorEl(null); navigate('/rvsk/profile'); }}><ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>My Profile</MenuItem>
              <MenuItem onClick={() => { setAnchorEl(null); handleLogout(); }}><ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>Logout</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer variant="permanent" sx={{
        width: drawerWidth, flexShrink: 0, transition: 'width 0.2s ease',
        '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', top: HEADER_HEIGHT, height: `calc(100% - ${HEADER_HEIGHT}px)`, overflowX: 'hidden', transition: 'width 0.2s ease', borderRight: '1px solid #E5E7EB' },
      }}>
        {menuLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={24} /></Box>
        ) : (
          <List sx={{ pt: 1, overflowY: 'auto', flex: 1 }}>
            {menuError && !collapsed && (
              <Box sx={{ px: 1, mb: 1 }}>
                <Alert severity="warning" sx={{ fontSize: '0.65rem', py: 0, '& .MuiAlert-icon': { fontSize: 16 } }}>
                  {menuError}
                </Alert>
              </Box>
            )}
            {navItems.map((item, idx) => {
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedItems.includes(item.path);
              const isActive = location.pathname === item.path || isChildActive(item);

              return (
                <Box key={`${item.path}-${idx}`}>
                  <ListItemButton
                    onClick={() => {
                      if (hasChildren) {
                        toggleExpand(item.path);
                        if (!isChildActive(item)) navigate(item.children![0].path);
                      } else {
                        navigate(item.path);
                      }
                    }}
                    sx={{
                      mx: 0.5, mb: 0.3, borderRadius: 1.5, minHeight: 42,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      px: collapsed ? 1.5 : 2,
                      bgcolor: isActive ? '#EDE9FE' : 'transparent',
                      '&:hover': { bgcolor: isActive ? '#EDE9FE' : '#F5F3FF' },
                      '& .MuiListItemIcon-root': { color: isActive ? '#5B21B6' : undefined },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: collapsed ? 0 : 36, justifyContent: 'center' }}>
                      {item.icon}
                    </ListItemIcon>
                    {!collapsed && (
                      <>
                        <ListItemText primary={item.label}
                          primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: isActive ? 600 : 400, color: isActive ? '#5B21B6' : '#374151' }} />
                        {hasChildren && (isExpanded ? <ExpandLess sx={{ color: '#9CA3AF' }} /> : <ExpandMore sx={{ color: '#9CA3AF' }} />)}
                      </>
                    )}
                  </ListItemButton>

                  {hasChildren && !collapsed && (
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                      <List disablePadding sx={{ pl: 1, borderLeft: '2px solid #E5E7EB', ml: 3.5, my: 0.5 }}>
                        {item.children!.map((child) => {
                          const childActive = location.pathname === child.path;
                          return (
                            <ListItemButton key={child.path} onClick={() => navigate(child.path)}
                              sx={{ py: 0.5, px: 1.5, mb: 0.2, borderRadius: 1, minHeight: 34, bgcolor: childActive ? '#EDE9FE' : 'transparent', '&:hover': { bgcolor: childActive ? '#EDE9FE' : '#F9FAFB' } }}>
                              <ListItemIcon sx={{ minWidth: 28, color: childActive ? '#5B21B6' : '#6B7280' }}>
                                {child.icon}
                              </ListItemIcon>
                              <ListItemText primary={child.label}
                                primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: childActive ? 600 : 400, color: childActive ? '#5B21B6' : '#4B5563' }} />
                            </ListItemButton>
                          );
                        })}
                      </List>
                    </Collapse>
                  )}
                </Box>
              );
            })}
          </List>
        )}
        <Divider />
        <List>
          <ListItemButton onClick={handleLogout}
            sx={{ mx: 0.5, borderRadius: 1.5, minHeight: 42, justifyContent: collapsed ? 'center' : 'flex-start', px: collapsed ? 1.5 : 2 }}>
            <ListItemIcon sx={{ minWidth: collapsed ? 0 : 36, justifyContent: 'center', color: '#DC2626' }}>
              <LogoutIcon />
            </ListItemIcon>
            {!collapsed && <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.85rem', color: '#DC2626' }} />}
          </ListItemButton>
        </List>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, mt: `${HEADER_HEIGHT}px`, minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`, bgcolor: '#F8FAFC', overflow: 'auto' }}>
        <Outlet />
      </Box>
    </Box>
  );
}
