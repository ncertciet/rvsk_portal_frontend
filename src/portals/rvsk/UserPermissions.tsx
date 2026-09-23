import { useState } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Grid, Checkbox, FormControlLabel,
  Accordion, AccordionSummary, AccordionDetails, Chip, Alert, CircularProgress,
  InputAdornment,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import apiClient from '../../services/apiClient';

// Module + page definitions (mirrors backend)
const MODULES = [
  { id: 'A1', name: 'Attendance', pages: [
    { id: 'summary', name: 'Summary' }, { id: 'detailed', name: 'Detailed Data' },
    { id: 'trends', name: 'Trends' }, { id: 'report', name: 'Report View' },
    { id: 'table', name: 'Table View' }, { id: 'school', name: 'School Directory' },
    { id: 'teacher', name: 'Teacher Registry' }, { id: 'student', name: 'Student Registry' },
    { id: 'monthly', name: 'Monthly Details' }, { id: 'analysis', name: 'Attendance Analysis' },
  ]},
  { id: 'A2', name: 'Assessment', pages: [
    { id: 'summary', name: 'Summary' }, { id: 'scores', name: 'Score Analytics' },
    { id: 'trends', name: 'Trends' }, { id: 'reports', name: 'Reports' },
  ]},
  { id: 'A3', name: 'Administration', pages: [
    { id: 'summary', name: 'Summary' }, { id: 'schools', name: 'School Management' },
    { id: 'districts', name: 'District Dashboard' }, { id: 'operations', name: 'Operations' },
  ]},
  { id: 'A4', name: 'Accreditation', pages: [
    { id: 'summary', name: 'Summary' }, { id: 'audits', name: 'Audit Tracker' },
    { id: 'compliance', name: 'Compliance' }, { id: 'reports', name: 'Reports' },
  ]},
  { id: 'A5', name: 'Adaptive Learning', pages: [
    { id: 'summary', name: 'Summary' }, { id: 'recommendations', name: 'AI Recommendations' },
    { id: 'engagement', name: 'Engagement Analytics' },
  ]},
  { id: 'A6', name: 'APAAR', pages: [
    { id: 'summary', name: 'Summary' }, { id: 'registry', name: 'Student Registry' },
    { id: 'aadhaar', name: 'Aadhaar Linking' }, { id: 'reports', name: 'Reports' },
  ]},
];

interface UserInfo {
  id: string;
  username: string;
  displayName: string;
  role: string;
  stateCode: string | null;
  isActive: boolean;
}

export default function UserPermissions() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [roleDefaults, setRoleDefaults] = useState<Record<string, string[]>>({});
  const [permissions, setPermissions] = useState<Record<string, Set<string>>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Search users
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await apiClient.get(`/users?search=${encodeURIComponent(searchQuery)}`);
      setUsers(res.data || []);
    } catch {
      // Try listing all users if search fails
      try {
        const res = await apiClient.get('/users');
        const allUsers = res.data || [];
        const filtered = allUsers.filter((u: any) =>
          u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setUsers(filtered.length > 0 ? filtered : allUsers);
      } catch { setUsers([]); }
    } finally { setLoading(false); }
  };

  // Select a user and load their permissions
  const handleSelectUser = async (user: UserInfo) => {
    setSelectedUser(user);
    setMessage(null);
    setLoading(true);
    try {
      // Load role defaults
      const defaultsRes = await apiClient.get(`/permissions/roles/${user.role}/defaults`);
      const defaultsData = defaultsRes.data?.data || {};
      const defaults: Record<string, string[]> = {};
      for (const [module, pages] of Object.entries(defaultsData)) {
        defaults[module] = (pages as any[]).map((p: any) => p.pageId);
      }
      setRoleDefaults(defaults);

      // Load resolved access
      const resolvedRes = await apiClient.get(`/permissions/users/${user.id}/resolved?role=${user.role}`);
      const access = resolvedRes.data?.access || {};
      const perms: Record<string, Set<string>> = {};
      for (const [module, pages] of Object.entries(access)) {
        perms[module] = new Set(pages as string[]);
      }
      setPermissions(perms);
    } catch {
      // If API fails (tables not yet created), use default full access for Super_Admin
      const perms: Record<string, Set<string>> = {};
      MODULES.forEach(m => { perms[m.id] = new Set(m.pages.map(p => p.id)); });
      setPermissions(perms);
      setRoleDefaults({});
    } finally { setLoading(false); }
  };

  // Toggle a page permission
  const togglePage = (module: string, pageId: string) => {
    setPermissions(prev => {
      const updated = { ...prev };
      const pages = new Set(updated[module] || []);
      if (pages.has(pageId)) {
        pages.delete(pageId);
      } else {
        pages.add(pageId);
      }
      updated[module] = pages;
      return updated;
    });
  };

  // Check if a page is overridden (different from role default)
  const isOverridden = (module: string, pageId: string): 'granted' | 'revoked' | null => {
    const defaultPages = roleDefaults[module] || [];
    const currentPages = permissions[module] || new Set();
    const isDefault = defaultPages.includes(pageId);
    const isCurrent = currentPages.has(pageId);

    if (isDefault && !isCurrent) return 'revoked';
    if (!isDefault && isCurrent) return 'granted';
    return null;
  };

  // Save overrides
  const handleSave = async () => {
    if (!selectedUser) return;
    setSaving(true);
    setMessage(null);
    try {
      // Calculate overrides: diff between current permissions and role defaults
      const overrides: { module: string; pageId: string; canView: boolean; canExport: boolean }[] = [];
      MODULES.forEach(m => {
        const defaultPages = roleDefaults[m.id] || [];
        const currentPages = permissions[m.id] || new Set();

        // Pages revoked (in defaults but not in current)
        defaultPages.forEach(pageId => {
          if (!currentPages.has(pageId)) {
            overrides.push({ module: m.id, pageId, canView: false, canExport: false });
          }
        });

        // Pages granted (in current but not in defaults)
        currentPages.forEach(pageId => {
          if (!defaultPages.includes(pageId)) {
            overrides.push({ module: m.id, pageId, canView: true, canExport: false });
          }
        });
      });

      await apiClient.put(`/permissions/users/${selectedUser.id}/overrides`, overrides);
      setMessage({ type: 'success', text: `Permissions saved. ${overrides.length} override(s) applied.` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to save permissions' });
    } finally { setSaving(false); }
  };

  // Reset to defaults
  const handleReset = async () => {
    if (!selectedUser) return;
    setSaving(true);
    setMessage(null);
    try {
      await apiClient.delete(`/permissions/users/${selectedUser.id}/overrides`);
      // Reload with defaults
      const perms: Record<string, Set<string>> = {};
      for (const [module, pages] of Object.entries(roleDefaults)) {
        perms[module] = new Set(pages);
      }
      setPermissions(perms);
      setMessage({ type: 'success', text: 'Permissions reset to role defaults.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to reset permissions' });
    } finally { setSaving(false); }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        User Permissions Management
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage page-level access for individual users. Overrides apply on top of role defaults.
      </Typography>

      {/* User Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by email or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          />
          <Button variant="contained" onClick={handleSearch} disabled={loading}
            sx={{ bgcolor: '#5B21B6', '&:hover': { bgcolor: '#4C1D95' } }}>
            Search
          </Button>
        </Box>

        {/* User list */}
        {users.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {users.map(u => (
              <Chip
                key={u.id}
                label={`${u.displayName} (${u.role})`}
                onClick={() => handleSelectUser(u)}
                color={selectedUser?.id === u.id ? 'primary' : 'default'}
                variant={selectedUser?.id === u.id ? 'filled' : 'outlined'}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>
        )}
      </Paper>

      {/* Permission Matrix */}
      {selectedUser && (
        <>
          <Paper sx={{ p: 2, mb: 2, bgcolor: '#F5F3FF' }}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">User</Typography>
                <Typography fontWeight={600}>{selectedUser.displayName}</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="body2" color="text.secondary">Role</Typography>
                <Chip label={selectedUser.role} size="small" color="primary" />
              </Grid>
              <Grid item xs={3}>
                <Typography variant="body2" color="text.secondary">State</Typography>
                <Typography>{selectedUser.stateCode || 'National'}</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <Chip label={selectedUser.isActive ? 'Active' : 'Inactive'} size="small"
                  color={selectedUser.isActive ? 'success' : 'default'} />
              </Grid>
            </Grid>
          </Paper>

          {message && <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {MODULES.map(module => (
                <Accordion key={module.id} defaultExpanded={module.id === 'A1'}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography fontWeight={600}>{module.id} — {module.name}</Typography>
                    <Chip
                      label={`${permissions[module.id]?.size || 0}/${module.pages.length} pages`}
                      size="small"
                      sx={{ ml: 2 }}
                      color={(permissions[module.id]?.size || 0) === module.pages.length ? 'success' : 'warning'}
                    />
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={1}>
                      {module.pages.map(page => {
                        const checked = permissions[module.id]?.has(page.id) || false;
                        const override = isOverridden(module.id, page.id);
                        return (
                          <Grid item xs={6} sm={4} key={page.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={checked}
                                    onChange={() => togglePage(module.id, page.id)}
                                    size="small"
                                    sx={{ '&.Mui-checked': { color: '#5B21B6' } }}
                                  />
                                }
                                label={<Typography variant="body2">{page.name}</Typography>}
                              />
                              {override === 'granted' && <Chip label="GRANTED" size="small" sx={{ fontSize: 9, height: 18, bgcolor: '#D1FAE5', color: '#065F46' }} />}
                              {override === 'revoked' && <Chip label="REVOKED" size="small" sx={{ fontSize: 9, height: 18, bgcolor: '#FEE2E2', color: '#991B1B' }} />}
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}

              {/* Action Buttons */}
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={saving}
                  sx={{ bgcolor: '#5B21B6', '&:hover': { bgcolor: '#4C1D95' } }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RestartAltIcon />}
                  onClick={handleReset}
                  disabled={saving}
                  color="warning"
                >
                  Reset to Defaults
                </Button>
              </Box>
            </>
          )}
        </>
      )}
    </Box>
  );
}
