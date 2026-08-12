import { useState } from 'react';
import {
  Box, Typography, TextField, Grid, Card, CardContent, Button,
  Checkbox, FormControlLabel, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton,
  MenuItem, Select, FormControl, InputLabel, Divider, Tooltip,
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import OfficerHistoryDialog from './OfficerHistoryDialog';

interface OfficerData {
  name: string;
  designation: string;
  phone: string;
  whatsapp: string;
  email: string;
}

interface CommitteeMember {
  id: number;
  name: string;
  designation: string;
  phone: string;
  whatsapp: string;
  email: string;
}

interface AddressData {
  addressLine1: string;
  addressLine2: string;
  city: string;
  pinCode: string;
  stateUt: string;
}

export default function Step1Officers() {
  const [secretary, setSecretary] = useState<OfficerData>({
    name: 'Rajesh Kumar',
    designation: 'Secretary',
    phone: '9876543210',
    whatsapp: '9876543210',
    email: 'secretary@state.gov.in',
  });

  const [spd, setSpd] = useState<OfficerData>({
    name: 'Priya Sharma',
    designation: 'SPD',
    phone: '9123456789',
    whatsapp: '9123456789',
    email: 'spd@state.gov.in',
  });

  const [spdSameAsSecretary, setSpdSameAsSecretary] = useState(false);

  const [nodalOfficers, setNodalOfficers] = useState<OfficerData[]>([
    {
      name: 'Amit Singh',
      designation: 'Nodal Officer',
      phone: '8765432100',
      whatsapp: '8765432100',
      email: 'nodal@state.gov.in',
    },
  ]);

  const [committeeMembers, setCommitteeMembers] = useState<CommitteeMember[]>([
    { id: 1, name: 'Dr. Meera Iyer', designation: 'Education Advisor', phone: '9988776655', whatsapp: '9988776655', email: 'meera.iyer@state.gov.in' },
    { id: 2, name: 'Vikram Rathore', designation: 'IT Coordinator', phone: '9876512340', whatsapp: '9876512340', email: 'vikram.r@state.gov.in' },
  ]);

  const [address, setAddress] = useState<AddressData>({
    addressLine1: 'Vidya Samiksha Kendra, Block A',
    addressLine2: 'State Education Department Complex',
    city: 'Jaipur',
    pinCode: '302001',
    stateUt: 'Rajasthan',
  });

  const [schemeFacilitatedBy, setSchemeFacilitatedBy] = useState('Stars');
  const [customScheme, setCustomScheme] = useState('');

  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyOfficerType, setHistoryOfficerType] = useState('Secretary');

  const handleSpdSameAsSecretary = (checked: boolean) => {
    setSpdSameAsSecretary(checked);
    if (checked) {
      setSpd({ ...secretary, designation: 'SPD' });
    }
  };

  const handleAddNodalOfficer = () => {
    setNodalOfficers([...nodalOfficers, { name: '', designation: 'Nodal Officer', phone: '', whatsapp: '', email: '' }]);
  };

  const handleRemoveNodalOfficer = (index: number) => {
    setNodalOfficers(nodalOfficers.filter((_, i) => i !== index));
  };

  const updateNodalOfficer = (index: number, field: keyof OfficerData, value: string) => {
    const updated = [...nodalOfficers];
    updated[index] = { ...updated[index], [field]: value };
    setNodalOfficers(updated);
  };

  const handleAddCommitteeMember = () => {
    const newId = Math.max(0, ...committeeMembers.map(m => m.id)) + 1;
    setCommitteeMembers([...committeeMembers, { id: newId, name: '', designation: '', phone: '', whatsapp: '', email: '' }]);
  };

  const handleRemoveCommitteeMember = (id: number) => {
    setCommitteeMembers(committeeMembers.filter(m => m.id !== id));
  };

  const openHistory = (type: string) => {
    setHistoryOfficerType(type);
    setHistoryOpen(true);
  };

  const renderOfficerFields = (
    label: string,
    data: OfficerData,
    setData: (d: OfficerData) => void,
    showSameAsSecretary: boolean,
    historyType: string,
  ) => (
    <Card sx={{ mb: 3, borderRadius: 2, border: '1px solid #E2E8F0' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon sx={{ color: '#7C3AED' }} />
            <Typography variant="subtitle1" fontWeight={600}>{label}</Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            startIcon={<HistoryIcon />}
            onClick={() => openHistory(historyType)}
            sx={{ textTransform: 'none' }}
          >
            View History
          </Button>
        </Box>
        {showSameAsSecretary && (
          <FormControlLabel
            control={
              <Checkbox
                checked={spdSameAsSecretary}
                onChange={(e) => handleSpdSameAsSecretary(e.target.checked)}
                size="small"
              />
            }
            label="Same as Secretary"
            sx={{ mb: 2 }}
          />
        )}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth size="small" label="Name" value={data.name}
              onChange={e => setData({ ...data, name: e.target.value })} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth size="small" label="Designation" value={data.designation}
              onChange={e => setData({ ...data, designation: e.target.value })} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth size="small" label="Phone" value={data.phone}
              onChange={e => setData({ ...data, phone: e.target.value })} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth size="small" label="WhatsApp" value={data.whatsapp}
              onChange={e => setData({ ...data, whatsapp: e.target.value })} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth size="small" label="Email" type="email" value={data.email}
              onChange={e => setData({ ...data, email: e.target.value })} />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 3, color: '#1E293B' }}>
        Officers & Committee Members
      </Typography>

      {/* Secretary */}
      {renderOfficerFields('Secretary', secretary, setSecretary, false, 'Secretary')}

      {/* SPD */}
      {renderOfficerFields('SPD (State Project Director)', spd, setSpd, true, 'SPD')}

      {/* Nodal Officers */}
      <Card sx={{ mb: 3, borderRadius: 2, border: '1px solid #E2E8F0' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon sx={{ color: '#7C3AED' }} />
              <Typography variant="subtitle1" fontWeight={600}>Nodal Officer(s)</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<HistoryIcon />}
                onClick={() => openHistory('Nodal Officer')}
                sx={{ textTransform: 'none' }}
              >
                View History
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddNodalOfficer}
                sx={{ textTransform: 'none', bgcolor: '#7C3AED', '&:hover': { bgcolor: '#6D28D9' } }}
              >
                Add More Members
              </Button>
            </Box>
          </Box>
          {nodalOfficers.map((officer, idx) => (
            <Box key={idx} sx={{ mb: 2 }}>
              {idx > 0 && <Divider sx={{ my: 2 }} />}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Nodal Officer #{idx + 1}</Typography>
                {nodalOfficers.length > 1 && (
                  <Tooltip title="Remove">
                    <IconButton size="small" color="error" onClick={() => handleRemoveNodalOfficer(idx)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" label="Name" value={officer.name}
                    onChange={e => updateNodalOfficer(idx, 'name', e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" label="Designation" value={officer.designation}
                    onChange={e => updateNodalOfficer(idx, 'designation', e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" label="Phone" value={officer.phone}
                    onChange={e => updateNodalOfficer(idx, 'phone', e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" label="WhatsApp" value={officer.whatsapp}
                    onChange={e => updateNodalOfficer(idx, 'whatsapp', e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" label="Email" type="email" value={officer.email}
                    onChange={e => updateNodalOfficer(idx, 'email', e.target.value)} />
                </Grid>
              </Grid>
            </Box>
          ))}
        </CardContent>
      </Card>

      {/* Committee Members Table */}
      <Card sx={{ mb: 3, borderRadius: 2, border: '1px solid #E2E8F0' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>Committee Members</Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddCommitteeMember}
              sx={{ textTransform: 'none', bgcolor: '#7C3AED', '&:hover': { bgcolor: '#6D28D9' } }}
            >
              Add Committee Member
            </Button>
          </Box>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Designation</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>WhatsApp</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {committeeMembers.map((member) => (
                  <TableRow key={member.id} hover>
                    <TableCell>{member.name}</TableCell>
                    <TableCell>{member.designation}</TableCell>
                    <TableCell>{member.phone}</TableCell>
                    <TableCell>{member.whatsapp}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton size="small" sx={{ color: '#3B82F6' }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Remove">
                        <IconButton size="small" color="error" onClick={() => handleRemoveCommitteeMember(member.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {committeeMembers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <Typography variant="body2" color="text.secondary">No committee members added yet.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Address Section */}
      <Card sx={{ mb: 3, borderRadius: 2, border: '1px solid #E2E8F0' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Address</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Address Line 1" value={address.addressLine1}
                onChange={e => setAddress({ ...address, addressLine1: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Address Line 2" value={address.addressLine2}
                onChange={e => setAddress({ ...address, addressLine2: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth size="small" label="City" value={address.city}
                onChange={e => setAddress({ ...address, city: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth size="small" label="Pin Code" value={address.pinCode}
                onChange={e => setAddress({ ...address, pinCode: e.target.value })}
                inputProps={{ maxLength: 6 }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth size="small" label="State/UT" value={address.stateUt} disabled />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Scheme Section */}
      <Card sx={{ mb: 3, borderRadius: 2, border: '1px solid #E2E8F0' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Scheme</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Scheme Facilitated By</InputLabel>
                <Select
                  value={schemeFacilitatedBy}
                  label="Scheme Facilitated By"
                  onChange={e => setSchemeFacilitatedBy(e.target.value)}
                >
                  <MenuItem value="Stars">Stars</MenuItem>
                  <MenuItem value="Samagra Shiksha">Samagra Shiksha</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {schemeFacilitatedBy === 'Other' && (
              <Grid item xs={12} sm={6}>
                <TextField fullWidth size="small" label="Custom Scheme Name" value={customScheme}
                  onChange={e => setCustomScheme(e.target.value)}
                  placeholder="Enter scheme name" />
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Officer History Dialog */}
      <OfficerHistoryDialog
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        officerType={historyOfficerType}
      />
    </Box>
  );
}
