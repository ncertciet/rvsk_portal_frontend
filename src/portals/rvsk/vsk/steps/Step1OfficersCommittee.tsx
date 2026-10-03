import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, TextField, Grid, Card, CardContent, Button,
  FormControlLabel, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton,
  Divider, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, CircularProgress, Snackbar, Alert,
  RadioGroup, Radio, FormControl, FormLabel, Chip, Collapse,
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import {
  OfficerHistoryDto,
  CommitteeMemberDto,
  fetchActiveOfficers,
  fetchOfficerHistory,
  createOfficer,
  appointNewOfficer,
  typoCorrection,
  fetchCommitteeMembers,
  addCommitteeMember,
  updateCommitteeMember,
  removeCommitteeMember,
  saveAndNext,
  fetchVskProfile,
  createProfile,
  updateProfile,
  VskProfileDto,
} from '../vskApi';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Step1OfficersCommitteeProps {
  stateCode: string;
  isReadOnly?: boolean;
  onStepComplete?: () => void;
}

interface OfficerFormData {
  name: string;
  designation: string;
  phone: string;
  whatsapp: string;
  email: string;
}

interface CommitteeMemberFormData {
  name: string;
  designation: string;
  phone: string;
  whatsapp: string;
  email: string;
}

type EditMode = 'typo' | 'appoint' | null;

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

const OFFICER_ROLES = ['SECRETARY', 'SPD', 'NODAL_OFFICER'] as const;
type OfficerRole = typeof OFFICER_ROLES[number];

const ROLE_LABELS: Record<OfficerRole, string> = {
  SECRETARY: 'Secretary',
  SPD: 'SPD (State Project Director)',
  NODAL_OFFICER: 'Nodal Officer',
};

// ─── Validation Constants ─────────────────────────────────────────────────────

const PHONE_REGEX = /^[6-9]\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[a-zA-Z\s.]+$/;

const DEFAULT_DESIGNATIONS: Record<string, string> = {
  SECRETARY: 'Secretary',
  SPD: 'SPD (State Project Director)',
  NODAL_OFFICER: 'Nodal Officer',
};

interface OfficerFormErrors {
  name?: string;
  designation?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
}

interface MemberFormErrors {
  name?: string;
  phone?: string;
  email?: string;
}

function validateOfficerForm(form: OfficerFormData): OfficerFormErrors {
  const errors: OfficerFormErrors = {};
  // Name
  if (!form.name.trim()) {
    errors.name = 'Name is required';
  } else if (form.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  } else if (form.name.trim().length > 200) {
    errors.name = 'Name must not exceed 200 characters';
  } else if (!NAME_REGEX.test(form.name.trim())) {
    errors.name = 'Name can only contain letters, spaces, and dots';
  }
  // Designation
  if (!form.designation.trim()) {
    errors.designation = 'Designation is required';
  }
  // Phone
  if (!form.phone.trim()) {
    errors.phone = 'Phone is required';
  } else if (!PHONE_REGEX.test(form.phone.trim())) {
    errors.phone = 'Phone must be 10 digits starting with 6-9';
  }
  // WhatsApp (optional)
  if (form.whatsapp.trim() && !PHONE_REGEX.test(form.whatsapp.trim())) {
    errors.whatsapp = 'WhatsApp must be 10 digits starting with 6-9';
  }
  // Email
  if (!form.email.trim()) {
    errors.email = 'Email is required';
  } else if (!EMAIL_REGEX.test(form.email.trim())) {
    errors.email = 'Invalid email format';
  }
  return errors;
}

function validateMemberForm(form: CommitteeMemberFormData): MemberFormErrors {
  const errors: MemberFormErrors = {};
  // Name
  if (!form.name.trim()) {
    errors.name = 'Name is required';
  } else if (form.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }
  // Phone (optional but must be valid if filled)
  if (form.phone.trim() && !PHONE_REGEX.test(form.phone.trim())) {
    errors.phone = 'Phone must be 10 digits starting with 6-9';
  }
  // Email (optional but must be valid if filled)
  if (form.email.trim() && !EMAIL_REGEX.test(form.email.trim())) {
    errors.email = 'Invalid email format';
  }
  return errors;
}

// ─── Helper: empty form data ──────────────────────────────────────────────────

function emptyOfficerForm(): OfficerFormData {
  return { name: '', designation: '', phone: '', whatsapp: '', email: '' };
}

function emptyMemberForm(): CommitteeMemberFormData {
  return { name: '', designation: '', phone: '', whatsapp: '', email: '' };
}

function officerToForm(o: OfficerHistoryDto): OfficerFormData {
  return {
    name: o.name || '',
    designation: o.designation || '',
    phone: o.phone || '',
    whatsapp: o.whatsapp || '',
    email: o.email || '',
  };
}

function memberToForm(m: CommitteeMemberDto): CommitteeMemberFormData {
  return {
    name: m.name || '',
    designation: m.designation || '',
    phone: m.phone || '',
    whatsapp: m.whatsapp || '',
    email: m.email || '',
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════════

export default function Step1OfficersCommittee({
  stateCode,
  isReadOnly = false,
  onStepComplete: _onStepComplete,
}: Step1OfficersCommitteeProps) {
  // ─── State: Officers ──────────────────────────────────────────────────────
  const [officers, setOfficers] = useState<Record<OfficerRole, OfficerHistoryDto | null>>({
    SECRETARY: null,
    SPD: null,
    NODAL_OFFICER: null,
  });
  const [loading, setLoading] = useState(true);

  // ─── State: VSK Address & Facilitation (vsk_profile fields) ────────────────
  const [profileForm, setProfileForm] = useState({
    addressLine1: '', addressLine2: '', city: '', pincode: '', facilitatedBy: '', otherSchemeName: '',
  });
  const [profileExists, setProfileExists] = useState(false);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

  // ─── State: "Same as Secretary" checkboxes (REMOVED - not needed) ─────────

  // ─── State: Edit Mode Dialog ──────────────────────────────────────────────
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editRole, setEditRole] = useState<OfficerRole | null>(null);
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [editForm, setEditForm] = useState<OfficerFormData>(emptyOfficerForm());
  const [appointStartDate, setAppointStartDate] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  // ─── State: Inline (on-page) officer history ──────────────────────────────
  // Keeps "current vs historical" visible on the page itself (no pop-up needed).
  const [inlineHistory, setInlineHistory] = useState<Record<OfficerRole, OfficerHistoryDto[]>>({
    SECRETARY: [], SPD: [], NODAL_OFFICER: [],
  });
  const [expandedHistory, setExpandedHistory] = useState<Record<OfficerRole, boolean>>({
    SECRETARY: false, SPD: false, NODAL_OFFICER: false,
  });
  const [inlineHistoryLoading, setInlineHistoryLoading] = useState<Record<OfficerRole, boolean>>({
    SECRETARY: false, SPD: false, NODAL_OFFICER: false,
  });

  // ─── State: Officer Form Validation Errors ──────────────────────────────────
  const [officerFormErrors, setOfficerFormErrors] = useState<OfficerFormErrors>({});

  // ─── State: Committee Members ───────────────────────────────────────────────
  const [members, setMembers] = useState<CommitteeMemberDto[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [memberForm, setMemberForm] = useState<CommitteeMemberFormData>(emptyMemberForm());
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberSaving, setMemberSaving] = useState(false);
  const [memberFormErrors, setMemberFormErrors] = useState<MemberFormErrors>({});

  // ─── State: Snackbar ──────────────────────────────────────────────────────
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'info',
  });

  const showSnackbar = (message: string, severity: SnackbarState['severity'] = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const updateProfileField = (field: keyof typeof profileForm, value: string) => {
    setProfileForm(prev => ({ ...prev, [field]: value }));
    setProfileErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  /** Validate the required VSK address/facilitation fields. */
  const validateProfile = (): boolean => {
    const errs: Record<string, string> = {};
    if (!profileForm.addressLine1.trim()) errs.addressLine1 = 'Address Line 1 is required';
    if (!profileForm.city.trim()) errs.city = 'City is required';
    if (!profileForm.pincode.trim()) errs.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(profileForm.pincode.trim())) errs.pincode = 'Pincode must be 6 digits';
    if (!profileForm.facilitatedBy.trim()) errs.facilitatedBy = 'Facilitated By is required';
    setProfileErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /** Persist the VSK address/facilitation fields to the vsk_profile row. */
  const saveProfileFields = async (): Promise<void> => {
    const dto: VskProfileDto = {
      addressLine1: profileForm.addressLine1.trim(),
      addressLine2: profileForm.addressLine2.trim() || undefined,
      city: profileForm.city.trim(),
      pincode: profileForm.pincode.trim(),
      facilitatedBy: profileForm.facilitatedBy.trim(),
      otherSchemeName: profileForm.otherSchemeName.trim() || undefined,
    };
    if (profileExists) {
      await updateProfile(dto);
    } else {
      await createProfile(dto);
      setProfileExists(true);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // Data Fetching
  // ═══════════════════════════════════════════════════════════════════════════

  const loadOfficers = useCallback(async () => {
    try {
      setLoading(true);
      const activeOfficers = await fetchActiveOfficers();
      const mapped: Record<OfficerRole, OfficerHistoryDto | null> = {
        SECRETARY: null,
        SPD: null,
        NODAL_OFFICER: null,
      };
      for (const o of activeOfficers) {
        const role = o.officerRole as OfficerRole;
        if (OFFICER_ROLES.includes(role)) {
          mapped[role] = o;
        }
      }
      setOfficers(mapped);
    } catch (err) {
      console.error('Failed to load officers', err);
      showSnackbar('Failed to load officers', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMembers = useCallback(async () => {
    try {
      setMembersLoading(true);
      const data = await fetchCommitteeMembers();
      setMembers(data);
    } catch (err) {
      console.error('Failed to load committee members', err);
      showSnackbar('Failed to load committee members', 'error');
    } finally {
      setMembersLoading(false);
    }
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      const p = await fetchVskProfile();
      if (p) {
        setProfileExists(true);
        setProfileForm({
          addressLine1: p.addressLine1 ?? '',
          addressLine2: p.addressLine2 ?? '',
          city: p.city ?? '',
          pincode: p.pincode ?? '',
          facilitatedBy: p.facilitatedBy ?? '',
          otherSchemeName: p.otherSchemeName ?? '',
        });
      }
    } catch (err) {
      console.error('Failed to load VSK profile fields', err);
    }
  }, []);

  useEffect(() => {
    loadOfficers();
    loadMembers();
    loadProfile();
  }, [loadOfficers, loadMembers, loadProfile]);

  // ═══════════════════════════════════════════════════════════════════════════
  // Officer Edit Handlers
  // ═══════════════════════════════════════════════════════════════════════════

  const handleEditClick = (role: OfficerRole) => {
    const officer = officers[role];
    setEditRole(role);
    setEditMode(null); // user picks mode first
    const form = officer ? officerToForm(officer) : emptyOfficerForm();
    // Pre-fill designation if empty
    if (!form.designation) {
      form.designation = DEFAULT_DESIGNATIONS[role] || '';
    }
    setEditForm(form);
    setAppointStartDate('');
    setOfficerFormErrors({});
    setEditDialogOpen(true);
  };

  const handleCreateOfficer = (role: OfficerRole) => {
    setEditRole(role);
    setEditMode('appoint'); // new officer creation
    setEditForm({ ...emptyOfficerForm(), designation: DEFAULT_DESIGNATIONS[role] || '' });
    setAppointStartDate(new Date().toISOString().split('T')[0]);
    setOfficerFormErrors({});
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setEditRole(null);
    setEditMode(null);
    setEditForm(emptyOfficerForm());
    setAppointStartDate('');
    setOfficerFormErrors({});
  };

  const handleEditSave = async () => {
    if (!editRole) return;

    // Validate the form
    const errors = validateOfficerForm(editForm);
    setOfficerFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      setEditSaving(true);
      const officer = officers[editRole];

      if (editMode === 'typo' && officer?.id) {
        // Typo Correction: update in-place
        const dto: OfficerHistoryDto = {
          ...officer,
          name: editForm.name,
          designation: editForm.designation,
          phone: editForm.phone,
          whatsapp: editForm.whatsapp,
          email: editForm.email,
        };
        await typoCorrection(officer.id, dto);
        showSnackbar(`${ROLE_LABELS[editRole]} updated (typo correction)`);
      } else if (editMode === 'appoint') {
        // Appoint New Officer
        const dto: OfficerHistoryDto = {
          officerRole: editRole,
          name: editForm.name,
          designation: editForm.designation,
          phone: editForm.phone,
          whatsapp: editForm.whatsapp,
          email: editForm.email,
          startDate: appointStartDate || undefined,
          stateCode,
        };

        if (officer) {
          await appointNewOfficer(dto);
          showSnackbar(`New ${ROLE_LABELS[editRole]} appointed`);
        } else {
          await createOfficer(dto);
          showSnackbar(`${ROLE_LABELS[editRole]} created`);
        }
      }

      const savedRole = editRole;
      handleEditDialogClose();
      await loadOfficers();
      // Keep the inline history panel fresh if it's open for this role.
      if (savedRole && expandedHistory[savedRole]) {
        await loadInlineHistory(savedRole);
      }
    } catch (err) {
      console.error('Failed to save officer', err);
      showSnackbar('Failed to save officer changes', 'error');
    } finally {
      setEditSaving(false);
    }
  };

  // "Same as Secretary" functionality removed per requirement

  // ═══════════════════════════════════════════════════════════════════════════
  // Officer History Dialog Handlers
  // ═══════════════════════════════════════════════════════════════════════════

  /** Load this role's full history inline (lazy) and toggle the panel. */
  const loadInlineHistory = useCallback(async (role: OfficerRole) => {
    setInlineHistoryLoading(prev => ({ ...prev, [role]: true }));
    try {
      const data = await fetchOfficerHistory(role);
      setInlineHistory(prev => ({ ...prev, [role]: data }));
    } catch (err) {
      console.error('Failed to load inline history', err);
      showSnackbar('Failed to load officer history', 'error');
    } finally {
      setInlineHistoryLoading(prev => ({ ...prev, [role]: false }));
    }
  }, []);

  const toggleInlineHistory = (role: OfficerRole) => {
    const willExpand = !expandedHistory[role];
    setExpandedHistory(prev => ({ ...prev, [role]: willExpand }));
    if (willExpand) loadInlineHistory(role);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // Committee Member Handlers
  // ═══════════════════════════════════════════════════════════════════════════

  const handleAddMember = () => {
    setEditingMemberId(null);
    setMemberForm(emptyMemberForm());
    setMemberFormErrors({});
    setMemberDialogOpen(true);
  };

  const handleEditMember = (member: CommitteeMemberDto) => {
    setEditingMemberId(member.id || null);
    setMemberForm(memberToForm(member));
    setMemberFormErrors({});
    setMemberDialogOpen(true);
  };

  const handleRemoveMember = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this committee member?')) return;
    try {
      await removeCommitteeMember(id);
      showSnackbar('Committee member removed');
      await loadMembers();
    } catch (err) {
      console.error('Failed to remove member', err);
      showSnackbar('Failed to remove committee member', 'error');
    }
  };

  const handleMemberSave = async () => {
    // Validate
    const errors = validateMemberForm(memberForm);
    setMemberFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      setMemberSaving(true);
      const dto: CommitteeMemberDto = {
        name: memberForm.name,
        designation: memberForm.designation,
        phone: memberForm.phone,
        whatsapp: memberForm.whatsapp,
        email: memberForm.email,
        stateCode,
      };

      if (editingMemberId) {
        await updateCommitteeMember(editingMemberId, dto);
        showSnackbar('Committee member updated');
      } else {
        await addCommitteeMember(dto);
        showSnackbar('Committee member added');
      }

      setMemberDialogOpen(false);
      setMemberForm(emptyMemberForm());
      setEditingMemberId(null);
      setMemberFormErrors({});
      await loadMembers();
    } catch (err) {
      console.error('Failed to save member', err);
      showSnackbar('Failed to save committee member', 'error');
    } finally {
      setMemberSaving(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // Render: Officer Block
  // ═══════════════════════════════════════════════════════════════════════════

  const renderOfficerBlock = (role: OfficerRole) => {
    const officer = officers[role];

    return (
      <Card key={role} sx={{ mb: 3, borderRadius: 2, border: '1px solid #E2E8F0' }}>
        <CardContent sx={{ p: 3 }}>
          {/* Header row */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon sx={{ color: '#7C3AED' }} />
              <Typography variant="subtitle1" fontWeight={600}>
                {ROLE_LABELS[role]}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="text"
                size="small"
                startIcon={<HistoryIcon />}
                onClick={() => toggleInlineHistory(role)}
                sx={{ textTransform: 'none' }}
              >
                {expandedHistory[role] ? 'Hide History' : 'View History'}
              </Button>
              {!isReadOnly && officer && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => handleEditClick(role)}
                  sx={{ textTransform: 'none' }}
                >
                  Edit
                </Button>
              )}
              {!isReadOnly && !officer && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => handleCreateOfficer(role)}
                  sx={{ textTransform: 'none', bgcolor: '#7C3AED', '&:hover': { bgcolor: '#6D28D9' } }}
                >
                  Add
                </Button>
              )}
            </Box>
          </Box>

          {/* "Same as Secretary" checkbox removed */}

          {/* Officer data display (read-only) */}
          {officer ? (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Chip
                  size="small"
                  color="success"
                  label="Current office holder"
                  sx={{ fontWeight: 500 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth size="small" label="Name"
                  value={officer.name || ''} InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth size="small" label="Designation"
                  value={officer.designation || ''} InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth size="small" label="Phone"
                  value={officer.phone || ''} InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth size="small" label="WhatsApp"
                  value={officer.whatsapp || ''} InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth size="small" label="Email"
                  value={officer.email || ''} InputProps={{ readOnly: true }}
                />
              </Grid>
            </Grid>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              No {ROLE_LABELS[role]} assigned yet. Click "Add" to assign one.
            </Typography>
          )}

          {/* Inline history panel — current + previous holders, on the page */}
          <Collapse in={expandedHistory[role]} unmountOnExit>
            <Box sx={{ mt: 2 }}>
              <Divider sx={{ mb: 1.5 }} />
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                History — current and previous {ROLE_LABELS[role]} holders
              </Typography>
              {inlineHistoryLoading[role] ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={22} />
                </Box>
              ) : inlineHistory[role].length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  No history recorded yet.
                </Typography>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Designation</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>From</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>To</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {inlineHistory[role].map((h, idx) => {
                        const isCurrent = h.isActive === 1;
                        return (
                          <TableRow key={h.id ?? idx} sx={isCurrent ? { bgcolor: '#F0FDF4' } : undefined}>
                            <TableCell>
                              <Chip
                                size="small"
                                label={isCurrent ? 'Current' : 'Previous'}
                                color={isCurrent ? 'success' : 'default'}
                                variant={isCurrent ? 'filled' : 'outlined'}
                                sx={{ fontSize: '0.65rem', height: 20 }}
                              />
                            </TableCell>
                            <TableCell>{h.name || '—'}</TableCell>
                            <TableCell>{h.designation || '—'}</TableCell>
                            <TableCell>{h.phone || '—'}</TableCell>
                            <TableCell>{h.startDate ? new Date(h.startDate).toLocaleDateString('en-IN') : '—'}</TableCell>
                            <TableCell>{h.endDate ? new Date(h.endDate).toLocaleDateString('en-IN') : (isCurrent ? 'Present' : '—')}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // Render: Main Return
  // ═══════════════════════════════════════════════════════════════════════════

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 3, color: '#1E293B' }}>
        Officers & Committee Members
      </Typography>

      {/* VSK Address & Facilitation */}
      <Card sx={{ mb: 3, borderRadius: 2, border: '1px solid #E2E8F0' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <PersonIcon sx={{ color: '#7C3AED' }} />
            <Typography variant="subtitle1" fontWeight={600}>VSK Address &amp; Facilitation</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth size="small" label="Address Line 1 *"
                value={profileForm.addressLine1}
                onChange={e => updateProfileField('addressLine1', e.target.value)}
                error={!!profileErrors.addressLine1} helperText={profileErrors.addressLine1}
                InputProps={{ readOnly: isReadOnly }} inputProps={{ maxLength: 500 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth size="small" label="Address Line 2"
                value={profileForm.addressLine2}
                onChange={e => updateProfileField('addressLine2', e.target.value)}
                InputProps={{ readOnly: isReadOnly }} inputProps={{ maxLength: 500 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth size="small" label="City *"
                value={profileForm.city}
                onChange={e => updateProfileField('city', e.target.value)}
                error={!!profileErrors.city} helperText={profileErrors.city}
                InputProps={{ readOnly: isReadOnly }} inputProps={{ maxLength: 200 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth size="small" label="Pincode *"
                value={profileForm.pincode}
                onChange={e => updateProfileField('pincode', e.target.value.replace(/[^0-9]/g, ''))}
                error={!!profileErrors.pincode} helperText={profileErrors.pincode}
                InputProps={{ readOnly: isReadOnly }} inputProps={{ maxLength: 6 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth size="small" label="Facilitated By *"
                value={profileForm.facilitatedBy}
                onChange={e => updateProfileField('facilitatedBy', e.target.value)}
                error={!!profileErrors.facilitatedBy} helperText={profileErrors.facilitatedBy}
                InputProps={{ readOnly: isReadOnly }} inputProps={{ maxLength: 200 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth size="small" label="Other Scheme Name"
                value={profileForm.otherSchemeName}
                onChange={e => updateProfileField('otherSchemeName', e.target.value)}
                InputProps={{ readOnly: isReadOnly }} inputProps={{ maxLength: 200 }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Officer Blocks */}
      {OFFICER_ROLES.map((role) => renderOfficerBlock(role))}

      <Divider sx={{ my: 4 }} />

      {/* Committee Members Section */}
      <Card sx={{ mb: 3, borderRadius: 2, border: '1px solid #E2E8F0' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Committee Members
            </Typography>
            {!isReadOnly && (
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddMember}
                sx={{ textTransform: 'none', bgcolor: '#7C3AED', '&:hover': { bgcolor: '#6D28D9' } }}
              >
                Add Committee Member
              </Button>
            )}
          </Box>

          {membersLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Designation</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>WhatsApp</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    {!isReadOnly && (
                      <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id} hover>
                      <TableCell>{member.name}</TableCell>
                      <TableCell>{member.designation || '—'}</TableCell>
                      <TableCell>{member.phone || '—'}</TableCell>
                      <TableCell>{member.whatsapp || '—'}</TableCell>
                      <TableCell>{member.email || '—'}</TableCell>
                      {!isReadOnly && (
                        <TableCell align="center">
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              sx={{ color: '#3B82F6' }}
                              onClick={() => handleEditMember(member)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Remove">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => member.id && handleRemoveMember(member.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  {members.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={isReadOnly ? 5 : 6} align="center" sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          No committee members added yet.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Save & Next Button for Step 1 */}
      {!isReadOnly && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            variant="contained"
            onClick={async () => {
              // Validate VSK address/facilitation fields.
              if (!validateProfile()) {
                showSnackbar('Please complete the required VSK Address & Facilitation fields.', 'error');
                return;
              }
              // Validate: at least Secretary must be assigned
              if (!officers.SECRETARY) {
                showSnackbar('Please assign a Secretary before proceeding.', 'error');
                return;
              }
              try {
                await saveProfileFields();
                await saveAndNext({ step: 1, data: {} });
                showSnackbar('Step 1 saved successfully.');
                _onStepComplete?.();
              } catch (err) {
                console.error('Failed to save step 1:', err);
                showSnackbar('Failed to save step. Please try again.', 'error');
              }
            }}
            sx={{
              textTransform: 'none',
              bgcolor: '#7C3AED',
              '&:hover': { bgcolor: '#6D28D9' },
              px: 4,
              py: 1,
            }}
          >
            Save & Next
          </Button>
        </Box>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          Edit Officer Dialog (Typo Correction vs Appoint New)
          ═══════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={editDialogOpen}
        onClose={handleEditDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editRole && officers[editRole]
            ? `Edit ${ROLE_LABELS[editRole!]}`
            : `Add ${editRole ? ROLE_LABELS[editRole] : 'Officer'}`}
        </DialogTitle>
        <DialogContent dividers>
          {/* Mode selection (only when editing existing officer) */}
          {editRole && officers[editRole] && editMode === null && (
            <Box sx={{ mb: 3 }}>
              <FormControl component="fieldset">
                <FormLabel component="legend" sx={{ mb: 1 }}>
                  What kind of change is this?
                </FormLabel>
                <RadioGroup
                  value={editMode || ''}
                  onChange={(e) => setEditMode(e.target.value as EditMode)}
                >
                  <FormControlLabel
                    value="typo"
                    control={<Radio />}
                    label="Typo Correction — Fix a mistake in the current officer's details"
                  />
                  <FormControlLabel
                    value="appoint"
                    control={<Radio />}
                    label="Appoint New Officer — Replace with a different person"
                  />
                </RadioGroup>
              </FormControl>
            </Box>
          )}

          {/* Show form when mode is selected or creating new */}
          {(editMode !== null || (editRole && !officers[editRole!])) && (
            <Box>
              {editMode === 'appoint' && editRole && officers[editRole] && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  The current {ROLE_LABELS[editRole]} ({officers[editRole]?.name}) will be
                  marked inactive and replaced by the new officer.
                </Alert>
              )}

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth size="small" label="Name" required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    error={!!officerFormErrors.name}
                    helperText={officerFormErrors.name}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth size="small" label="Designation" required
                    value={editForm.designation}
                    onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                    error={!!officerFormErrors.designation}
                    helperText={officerFormErrors.designation}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth size="small" label="Phone" required
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    error={!!officerFormErrors.phone}
                    helperText={officerFormErrors.phone || '10 digits starting with 6-9'}
                    inputProps={{ maxLength: 10 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth size="small" label="WhatsApp"
                    value={editForm.whatsapp}
                    onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                    error={!!officerFormErrors.whatsapp}
                    helperText={officerFormErrors.whatsapp}
                    inputProps={{ maxLength: 10 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth size="small" label="Email" type="email" required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    error={!!officerFormErrors.email}
                    helperText={officerFormErrors.email}
                  />
                </Grid>
                {editMode === 'appoint' && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth size="small" label="Start Date" type="date"
                      value={appointStartDate}
                      onChange={(e) => setAppointStartDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleEditDialogClose} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleEditSave}
            variant="contained"
            disabled={
              editSaving ||
              (editRole && officers[editRole!] && editMode === null) ||
              !editForm.name.trim()
            }
            sx={{ bgcolor: '#7C3AED', '&:hover': { bgcolor: '#6D28D9' } }}
          >
            {editSaving ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════════════
          Committee Member Add/Edit Dialog
          ═══════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={memberDialogOpen}
        onClose={() => setMemberDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingMemberId ? 'Edit Committee Member' : 'Add Committee Member'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth size="small" label="Name" required
                value={memberForm.name}
                onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                error={!!memberFormErrors.name}
                helperText={memberFormErrors.name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth size="small" label="Designation"
                value={memberForm.designation}
                onChange={(e) => setMemberForm({ ...memberForm, designation: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth size="small" label="Phone"
                value={memberForm.phone}
                onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                error={!!memberFormErrors.phone}
                helperText={memberFormErrors.phone || 'Optional, 10 digits starting with 6-9'}
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth size="small" label="WhatsApp"
                value={memberForm.whatsapp}
                onChange={(e) => setMemberForm({ ...memberForm, whatsapp: e.target.value })}
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth size="small" label="Email" type="email"
                value={memberForm.email}
                onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                error={!!memberFormErrors.email}
                helperText={memberFormErrors.email}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setMemberDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleMemberSave}
            variant="contained"
            disabled={memberSaving}
            sx={{ bgcolor: '#7C3AED', '&:hover': { bgcolor: '#6D28D9' } }}
          >
            {memberSaving ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════════════
          Snackbar
          ═══════════════════════════════════════════════════════════════════ */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
