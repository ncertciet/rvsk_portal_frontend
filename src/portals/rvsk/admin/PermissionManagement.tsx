import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Checkbox, FormControl, InputLabel, Select, MenuItem,
  Tabs, Tab, TextField, Chip, InputAdornment, Snackbar, Alert, CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import apiClient from '../../../services/apiClient';

// --- Types ---
interface RolePageDefault {
  id: string;
  role: string;
  pageId: string;
  pageCode: string;
  pageName: string;
  moduleId: string;
  moduleCode: string;
  permissions: { canView: boolean; canEdit: boolean; canExport: boolean; canDelete: boolean };
  createdAt: string;
  updatedAt: string;
}

interface UserOverride {
  id: string;
  userId: string;
  pageId: string;
  pageCode: string;
  pageName: string;
  moduleId: string;
  moduleCode: string;
  override: { canView: boolean | null; canEdit: boolean | null; canExport: boolean | null; canDelete: boolean | null };
  updatedBy: string;
  updatedAt: string;
}

interface UserInfo {
  id: string;
  username: string;
  displayName: string;
  role: string;
}

// Local state for editing permissions (before saving)
interface EditablePermission {
  pageId: string;
  pageCode: string;
  pageName: string;
  moduleId: string;
  moduleCode: string;
  moduleName?: string;
  canView: boolean;
  canEdit: boolean;
  canExport: boolean;
  canDelete: boolean;
  dirty: boolean; // has been modified
}

interface EditableOverride {
  pageId: string;
  pageCode: string;
  pageName: string;
  moduleId: string;
  moduleCode: string;
  canView: boolean | null;
  canEdit: boolean | null;
  canExport: boolean | null;
  canDelete: boolean | null;
  dirty: boolean;
}

const ROLES = ['Super_Admin', 'RVSK_Admin', 'State_Admin', 'District_Admin', 'Analytics_User', 'Read_Only_User'];

// Fallback permission data when backend is unavailable
const FALLBACK_PAGES_BY_MODULE = [
  { moduleCode: 'HOME', moduleName: 'Home', pages: [{ id: 'p1', code: 'DASHBOARD', name: 'Dashboard' }] },
  { moduleCode: 'ATTENDANCE', moduleName: 'Attendance', pages: [
    { id: 'p2', code: 'SUMMARY', name: 'Summary' },
    { id: 'p3', code: 'DETAILED_DATA', name: 'Detailed Data' },
    { id: 'p4', code: 'TRENDS', name: 'Trends' },
  ]},
  { moduleCode: 'ASSESSMENT', moduleName: 'Assessment', pages: [{ id: 'p5', code: 'SUMMARY', name: 'Summary' }] },
  { moduleCode: 'SCHEMES', moduleName: 'Schemes', pages: [
    { id: 'p6', code: 'PMSHRI', name: 'PM SHRI' },
    { id: 'p7', code: 'MICRO_IMPROVEMENT', name: 'Micro Improvement' },
  ]},
  { moduleCode: 'ADMINISTRATION', moduleName: 'Administration', pages: [
    { id: 'p8', code: 'USER_MGMT', name: 'User Management' },
    { id: 'p9', code: 'PERMISSIONS', name: 'Permissions' },
    { id: 'p10', code: 'FORM_BUILDER', name: 'Form Builder' },
    { id: 'p11', code: 'VSK_ADMIN', name: 'VSK Admin' },
    { id: 'p12', code: 'GRIEVANCE_MGMT', name: 'Grievance Mgmt' },
  ]},
  { moduleCode: 'ACCREDITATION', moduleName: 'Accreditation', pages: [{ id: 'p13', code: 'DASHBOARD', name: 'Dashboard' }] },
];

function generateFallbackRolePermissions(role: string): EditablePermission[] {
  const isSuperAdmin = role === 'Super_Admin' || role === 'RVSK_Admin';
  return FALLBACK_PAGES_BY_MODULE.flatMap(mod =>
    mod.pages.map(page => ({
      pageId: page.id,
      pageCode: page.code,
      pageName: page.name,
      moduleId: mod.moduleCode,
      moduleCode: mod.moduleCode,
      canView: true,
      canEdit: isSuperAdmin,
      canExport: isSuperAdmin || role === 'Analytics_User',
      canDelete: role === 'Super_Admin',
      dirty: false,
    }))
  );
}

export default function PermissionManagement() {
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedRole, setSelectedRole] = useState('Super_Admin');
  const [rolePermissions, setRolePermissions] = useState<EditablePermission[]>([]);
  const [loadingRole, setLoadingRole] = useState(false);
  const [savingRole, setSavingRole] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  // User Overrides tab state
  const [userSearch, setUserSearch] = useState('');
  const [searchResults, setSearchResults] = useState<UserInfo[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [userOverrides, setUserOverrides] = useState<EditableOverride[]>([]);
  const [loadingUser, setLoadingUser] = useState(false);
  const [savingUser, setSavingUser] = useState(false);

  // --- Role Defaults Tab ---

  const fetchRoleDefaults = async (role: string) => {
    setLoadingRole(true);
    try {
      const res = await apiClient.get(`/permissions/role-defaults/${role}`);
      const defaults: RolePageDefault[] = res.data || [];
      if (defaults.length > 0) {
        setRolePermissions(defaults.map(d => ({
          pageId: d.pageId,
          pageCode: d.pageCode,
          pageName: d.pageName,
          moduleId: d.moduleId,
          moduleCode: d.moduleCode,
          canView: d.permissions.canView,
          canEdit: d.permissions.canEdit,
          canExport: d.permissions.canExport,
          canDelete: d.permissions.canDelete,
          dirty: false,
        })));
      } else {
        // If API returns empty, use fallback
        setRolePermissions(generateFallbackRolePermissions(role));
      }
    } catch (err: any) {
      // Use fallback data when API is unavailable
      setRolePermissions(generateFallbackRolePermissions(role));
      setSnackbar({ open: true, message: 'API unavailable — showing demo permissions', severity: 'error' });
    } finally {
      setLoadingRole(false);
    }
  };

  useEffect(() => { fetchRoleDefaults(selectedRole); }, [selectedRole]);

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
  };

  const toggleRolePermission = (pageId: string, field: 'canView' | 'canEdit' | 'canExport' | 'canDelete') => {
    setRolePermissions(prev => prev.map(p =>
      p.pageId === pageId ? { ...p, [field]: !p[field], dirty: true } : p
    ));
  };

  const handleSaveRoleDefaults = async () => {
    const dirtyPerms = rolePermissions.filter(p => p.dirty);
    if (dirtyPerms.length === 0) {
      setSnackbar({ open: true, message: 'No changes to save', severity: 'error' });
      return;
    }
    setSavingRole(true);
    try {
      // Save each dirty permission one by one (API accepts individual upserts)
      for (const perm of dirtyPerms) {
        await apiClient.put('/permissions/role-defaults', {
          role: selectedRole,
          pageId: perm.pageId,
          permissions: { canView: perm.canView, canEdit: perm.canEdit, canExport: perm.canExport, canDelete: perm.canDelete },
        });
      }
      setSnackbar({ open: true, message: `${dirtyPerms.length} permission(s) saved for ${selectedRole}`, severity: 'success' });
      // Reset dirty flags
      setRolePermissions(prev => prev.map(p => ({ ...p, dirty: false })));
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Failed to save', severity: 'error' });
    } finally {
      setSavingRole(false);
    }
  };

  // --- User Overrides Tab ---

  const handleUserSearch = async () => {
    if (!userSearch.trim()) return;
    try {
      const res = await apiClient.get(`/users?search=${encodeURIComponent(userSearch)}`);
      setSearchResults(res.data || []);
    } catch {
      // Fallback: list all and filter client-side
      try {
        const res = await apiClient.get('/users');
        const all: UserInfo[] = res.data || [];
        const filtered = all.filter(u =>
          u.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
          u.displayName?.toLowerCase().includes(userSearch.toLowerCase())
        );
        setSearchResults(filtered.length > 0 ? filtered : all.slice(0, 10));
      } catch { setSearchResults([]); }
    }
  };

  const handleSelectUser = async (user: UserInfo) => {
    setSelectedUser(user);
    setLoadingUser(true);
    try {
      // Load role defaults for the user's role (to know which pages exist)
      const defaultsRes = await apiClient.get(`/permissions/role-defaults/${user.role}`);
      const defaults: RolePageDefault[] = defaultsRes.data || [];

      // Load user overrides
      const overridesRes = await apiClient.get(`/permissions/user-overrides/${user.id}`);
      const overrides: UserOverride[] = overridesRes.data || [];

      // Build override map by pageId
      const overrideMap = new Map(overrides.map(o => [o.pageId, o]));

      // Build editable list from defaults, merging with overrides
      const editableOverrides: EditableOverride[] = defaults.map(d => {
        const override = overrideMap.get(d.pageId);
        return {
          pageId: d.pageId,
          pageCode: d.pageCode,
          pageName: d.pageName,
          moduleId: d.moduleId,
          moduleCode: d.moduleCode,
          canView: override ? override.override.canView : null,
          canEdit: override ? override.override.canEdit : null,
          canExport: override ? override.override.canExport : null,
          canDelete: override ? override.override.canDelete : null,
          dirty: false,
        };
      });

      setUserOverrides(editableOverrides);
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Failed to load user permissions', severity: 'error' });
    } finally {
      setLoadingUser(false);
    }
  };

  // Tri-state cycling: null (inherit) → true (grant) → false (revoke) → null
  const cycleOverrideState = (pageId: string, field: 'canView' | 'canEdit' | 'canExport' | 'canDelete') => {
    setUserOverrides(prev => prev.map(p => {
      if (p.pageId !== pageId) return p;
      const current = p[field];
      const next = current === null ? true : current === true ? false : null;
      return { ...p, [field]: next, dirty: true };
    }));
  };

  const getCheckboxProps = (value: boolean | null) => {
    if (value === true) return { checked: true, indeterminate: false };
    if (value === false) return { checked: false, indeterminate: false };
    return { checked: false, indeterminate: true }; // null = inherit
  };

  const getCheckboxColor = (value: boolean | null) => {
    if (value === true) return { '&.Mui-checked': { color: '#16A34A' } };
    if (value === false) return { color: '#DC2626' };
    return { '&.MuiCheckbox-indeterminate': { color: '#9CA3AF' } };
  };

  const handleSaveUserOverrides = async () => {
    if (!selectedUser) return;
    const dirtyOverrides = userOverrides.filter(o => o.dirty);
    if (dirtyOverrides.length === 0) {
      setSnackbar({ open: true, message: 'No changes to save', severity: 'error' });
      return;
    }
    setSavingUser(true);
    try {
      for (const o of dirtyOverrides) {
        await apiClient.put('/permissions/user-overrides', {
          userId: selectedUser.id,
          pageId: o.pageId,
          override: { canView: o.canView, canEdit: o.canEdit, canExport: o.canExport, canDelete: o.canDelete },
        });
      }
      setSnackbar({ open: true, message: `${dirtyOverrides.length} override(s) saved for ${selectedUser.displayName}`, severity: 'success' });
      setUserOverrides(prev => prev.map(o => ({ ...o, dirty: false })));
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Failed to save overrides', severity: 'error' });
    } finally {
      setSavingUser(false);
    }
  };

  const handleResetToDefaults = async () => {
    if (!selectedUser) return;
    setSavingUser(true);
    try {
      await apiClient.delete(`/permissions/user-overrides/${selectedUser.id}`);
      setSnackbar({ open: true, message: 'User permissions reset to role defaults', severity: 'success' });
      // Reload with all nulls (inherit)
      setUserOverrides(prev => prev.map(o => ({ ...o, canView: null, canEdit: null, canExport: null, canDelete: null, dirty: false })));
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Failed to reset', severity: 'error' });
    } finally {
      setSavingUser(false);
    }
  };

  // Group permissions by moduleCode
  const groupByModule = <T extends { moduleCode: string; }>(items: T[]) => {
    const groups: { moduleCode: string; moduleName: string; items: T[] }[] = [];
    const map = new Map<string, T[]>();
    for (const item of items) {
      if (!map.has(item.moduleCode)) map.set(item.moduleCode, []);
      map.get(item.moduleCode)!.push(item);
    }
    for (const [code, groupItems] of map) {
      const name = (groupItems[0] as any).moduleName || code;
      groups.push({ moduleCode: code, moduleName: name, items: groupItems });
    }
    return groups;
  };

  const groupedRolePermissions = groupByModule(rolePermissions);
  const groupedUserOverrides = groupByModule(userOverrides);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>Permission Management</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure role-based default permissions and user-specific overrides.
      </Typography>

      <Paper sx={{ borderRadius: 4 }}>
        <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ borderBottom: '1px solid #E5E7EB', px: 2 }}>
          <Tab label="Role Defaults" />
          <Tab label="User Overrides" />
        </Tabs>

        {/* Role Defaults Tab */}
        {tabIndex === 0 && (
          <Box sx={{ p: 3 }}>
            <FormControl size="small" sx={{ minWidth: 250, mb: 3 }}>
              <InputLabel>Select Role</InputLabel>
              <Select value={selectedRole} label="Select Role" onChange={e => handleRoleChange(e.target.value)}>
                {ROLES.map(r => <MenuItem key={r} value={r}>{r.replace(/_/g, ' ')}</MenuItem>)}
              </Select>
            </FormControl>

            {loadingRole ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
            ) : rolePermissions.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                No permissions configured for this role yet.
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#1E293B' }}>
                      <TableCell sx={{ color: '#fff', fontWeight: 600, minWidth: 200 }}>Page</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }} align="center">CAN_VIEW</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }} align="center">CAN_EDIT</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }} align="center">CAN_EXPORT</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }} align="center">CAN_DELETE</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {groupedRolePermissions.map(group => (
                      <>
                        <TableRow key={group.moduleCode}>
                          <TableCell colSpan={5} sx={{ bgcolor: '#F1F5F9', fontWeight: 700, fontSize: 13 }}>
                            {group.moduleCode} — {group.moduleName}
                          </TableCell>
                        </TableRow>
                        {group.items.map(perm => (
                          <TableRow key={perm.pageId} hover sx={{ bgcolor: perm.dirty ? '#FFFBEB' : undefined }}>
                            <TableCell sx={{ pl: 4 }}>{perm.pageName}</TableCell>
                            <TableCell align="center">
                              <Checkbox checked={perm.canView} size="small"
                                onChange={() => toggleRolePermission(perm.pageId, 'canView')}
                                sx={{ '&.Mui-checked': { color: '#5B21B6' } }} />
                            </TableCell>
                            <TableCell align="center">
                              <Checkbox checked={perm.canEdit} size="small"
                                onChange={() => toggleRolePermission(perm.pageId, 'canEdit')}
                                sx={{ '&.Mui-checked': { color: '#5B21B6' } }} />
                            </TableCell>
                            <TableCell align="center">
                              <Checkbox checked={perm.canExport} size="small"
                                onChange={() => toggleRolePermission(perm.pageId, 'canExport')}
                                sx={{ '&.Mui-checked': { color: '#5B21B6' } }} />
                            </TableCell>
                            <TableCell align="center">
                              <Checkbox checked={perm.canDelete} size="small"
                                onChange={() => toggleRolePermission(perm.pageId, 'canDelete')}
                                sx={{ '&.Mui-checked': { color: '#5B21B6' } }} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Box sx={{ mt: 3 }}>
              <Button variant="contained" startIcon={savingRole ? <CircularProgress size={16} /> : <SaveIcon />}
                onClick={handleSaveRoleDefaults} disabled={savingRole || !rolePermissions.some(p => p.dirty)}
                sx={{ bgcolor: '#5B21B6', '&:hover': { bgcolor: '#4C1D95' } }}>
                Save Role Defaults
              </Button>
            </Box>
          </Box>
        )}

        {/* User Overrides Tab */}
        {tabIndex === 1 && (
          <Box sx={{ p: 3 }}>
            {/* User Search */}
            <Paper sx={{ p: 2, mb: 3, bgcolor: '#FAFAFA' }} elevation={0}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField fullWidth size="small" placeholder="Search by email or name..."
                  value={userSearch} onChange={e => setUserSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleUserSearch()}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
                <Button variant="contained" onClick={handleUserSearch}
                  sx={{ bgcolor: '#5B21B6', '&:hover': { bgcolor: '#4C1D95' } }}>
                  Search
                </Button>
              </Box>
              {searchResults.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {searchResults.map(u => (
                    <Chip key={u.id} label={`${u.displayName} (${u.role.replace(/_/g, ' ')})`}
                      onClick={() => handleSelectUser(u)}
                      color={selectedUser?.id === u.id ? 'primary' : 'default'}
                      variant={selectedUser?.id === u.id ? 'filled' : 'outlined'}
                      sx={{ cursor: 'pointer' }} />
                  ))}
                </Box>
              )}
            </Paper>

            {selectedUser && (
              <>
                <Paper sx={{ p: 2, mb: 3, bgcolor: '#F5F3FF' }} elevation={0}>
                  <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">User</Typography>
                      <Typography fontWeight={600}>{selectedUser.displayName}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Role</Typography>
                      <Chip label={selectedUser.role.replace(/_/g, ' ')} size="small" color="primary" />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Email</Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{selectedUser.username}</Typography>
                    </Box>
                  </Box>
                </Paper>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Click checkboxes to cycle: <b>—</b> (gray, inherit) → <b>✓</b> (green, grant) → <b>✗</b> (red, revoke) → <b>—</b>
                  </Typography>
                </Box>

                {loadingUser ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#1E293B' }}>
                          <TableCell sx={{ color: '#fff', fontWeight: 600, minWidth: 200 }}>Page</TableCell>
                          <TableCell sx={{ color: '#fff', fontWeight: 600 }} align="center">CAN_VIEW</TableCell>
                          <TableCell sx={{ color: '#fff', fontWeight: 600 }} align="center">CAN_EDIT</TableCell>
                          <TableCell sx={{ color: '#fff', fontWeight: 600 }} align="center">CAN_EXPORT</TableCell>
                          <TableCell sx={{ color: '#fff', fontWeight: 600 }} align="center">CAN_DELETE</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {groupedUserOverrides.map(group => (
                          <>
                            <TableRow key={`user-${group.moduleCode}`}>
                              <TableCell colSpan={5} sx={{ bgcolor: '#F1F5F9', fontWeight: 700, fontSize: 13 }}>
                                {group.moduleCode} — {group.moduleName}
                              </TableCell>
                            </TableRow>
                            {group.items.map(perm => (
                              <TableRow key={`user-${perm.pageId}`} hover sx={{ bgcolor: perm.dirty ? '#FFFBEB' : undefined }}>
                                <TableCell sx={{ pl: 4 }}>{perm.pageName}</TableCell>
                                {(['canView', 'canEdit', 'canExport', 'canDelete'] as const).map(field => (
                                  <TableCell key={field} align="center">
                                    <Checkbox size="small"
                                      {...getCheckboxProps(perm[field])}
                                      onChange={() => cycleOverrideState(perm.pageId, field)}
                                      sx={getCheckboxColor(perm[field])} />
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button variant="contained" startIcon={savingUser ? <CircularProgress size={16} /> : <SaveIcon />}
                    onClick={handleSaveUserOverrides} disabled={savingUser || !userOverrides.some(o => o.dirty)}
                    sx={{ bgcolor: '#5B21B6', '&:hover': { bgcolor: '#4C1D95' } }}>
                    Save Overrides
                  </Button>
                  <Button variant="outlined" startIcon={<RestartAltIcon />} onClick={handleResetToDefaults}
                    disabled={savingUser} color="warning">
                    Reset to Defaults
                  </Button>
                </Box>
              </>
            )}
          </Box>
        )}
      </Paper>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
