import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Divider, Button,
  Checkbox, FormControlLabel, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Snackbar, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip,
  Accordion, AccordionSummary, AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import BuildIcon from '@mui/icons-material/Build';
import ComputerIcon from '@mui/icons-material/Computer';
import GroupsIcon from '@mui/icons-material/Groups';

interface Step5ReviewProps {
  onSubmit: () => void;
}

export default function Step5Review({ onSubmit }: Step5ReviewProps) {
  const [certChecked, setCertChecked] = useState(false);
  const [snackbar, setSnackbar] = useState(false);
  const [successDialog, setSuccessDialog] = useState(false);

  const handleDownloadPdf = () => {
    setSnackbar(true);
  };

  const handleSubmit = () => {
    setSuccessDialog(true);
  };

  const handleConfirmSubmit = () => {
    setSuccessDialog(false);
    onSubmit();
  };

  const ReadOnlyField = ({ label, value }: { label: string; value: string }) => (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={500}>{value || '—'}</Typography>
    </Box>
  );

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 3, color: '#1E293B' }}>
        <CheckCircleIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#10B981' }} />
        Review & Submit
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Please review all the information below before submitting. Once submitted, the form will be locked for editing.
      </Typography>

      {/* Step 1: Officers Summary */}
      <Accordion defaultExpanded sx={{ mb: 2, borderRadius: 2, '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#F8FAFC' }}>
          <PersonIcon sx={{ mr: 1, color: '#7C3AED' }} />
          <Typography fontWeight={600}>Step 1: Officers & Committee Members</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>Secretary</Typography>
              <ReadOnlyField label="Name" value="Rajesh Kumar" />
              <ReadOnlyField label="Designation" value="Secretary" />
              <ReadOnlyField label="Phone" value="9876543210" />
              <ReadOnlyField label="WhatsApp" value="9876543210" />
              <ReadOnlyField label="Email" value="secretary@state.gov.in" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>SPD</Typography>
              <ReadOnlyField label="Name" value="Priya Sharma" />
              <ReadOnlyField label="Designation" value="SPD" />
              <ReadOnlyField label="Phone" value="9123456789" />
              <ReadOnlyField label="WhatsApp" value="9123456789" />
              <ReadOnlyField label="Email" value="spd@state.gov.in" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>Nodal Officer</Typography>
              <ReadOnlyField label="Name" value="Amit Singh" />
              <ReadOnlyField label="Designation" value="Nodal Officer" />
              <ReadOnlyField label="Phone" value="8765432100" />
              <ReadOnlyField label="WhatsApp" value="8765432100" />
              <ReadOnlyField label="Email" value="nodal@state.gov.in" />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Committee Members */}
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Committee Members</Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Designation</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Dr. Meera Iyer</TableCell>
                  <TableCell>Education Advisor</TableCell>
                  <TableCell>9988776655</TableCell>
                  <TableCell>meera.iyer@state.gov.in</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Vikram Rathore</TableCell>
                  <TableCell>IT Coordinator</TableCell>
                  <TableCell>9876512340</TableCell>
                  <TableCell>vikram.r@state.gov.in</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={{ my: 2 }} />

          {/* Address & Scheme */}
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Address & Scheme</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <ReadOnlyField label="Address" value="Vidya Samiksha Kendra, Block A, State Education Department Complex" />
              <ReadOnlyField label="City" value="Jaipur" />
              <ReadOnlyField label="Pin Code" value="302001" />
              <ReadOnlyField label="State/UT" value="Rajasthan" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <ReadOnlyField label="Scheme Facilitated By" value="Stars" />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Step 2: Infrastructure Summary */}
      <Accordion defaultExpanded sx={{ mb: 2, borderRadius: 2, '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#F8FAFC' }}>
          <BuildIcon sx={{ mr: 1, color: '#7C3AED' }} />
          <Typography fontWeight={600}>Step 2: Infrastructure & Hardware</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>Room Measurements</Typography>
              <ReadOnlyField label="Length" value="40 ft" />
              <ReadOnlyField label="Width" value="25 ft" />
              <ReadOnlyField label="Height" value="12 ft" />
              <Chip label="Photo uploaded ✓" size="small" color="success" variant="outlined" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>Screen Measurements</Typography>
              <ReadOnlyField label="Length" value="15 ft" />
              <ReadOnlyField label="Height" value="8 ft" />
              <Chip label="No photo" size="small" color="default" variant="outlined" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>Workstations</Typography>
              <ReadOnlyField label="Number of Workstations" value="24" />
              <Chip label="No photo" size="small" color="default" variant="outlined" />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Step 3: Software Summary */}
      <Accordion defaultExpanded sx={{ mb: 2, borderRadius: 2, '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#F8FAFC' }}>
          <ComputerIcon sx={{ mr: 1, color: '#7C3AED' }} />
          <Typography fontWeight={600}>Step 3: Software Details</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <ReadOnlyField label="Starter Pack Available" value="Yes" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <ReadOnlyField label="Server Type" value="Central" />
            </Grid>
          </Grid>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Software Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow><TableCell>Power BI</TableCell><TableCell>License</TableCell></TableRow>
                <TableRow><TableCell>Tableau</TableCell><TableCell>Unlicensed</TableCell></TableRow>
                <TableRow><TableCell>Custom Analytics Tool (Other)</TableCell><TableCell>License</TableCell></TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      {/* Step 4: PMU Summary */}
      <Accordion defaultExpanded sx={{ mb: 2, borderRadius: 2, '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#F8FAFC' }}>
          <GroupsIcon sx={{ mr: 1, color: '#7C3AED' }} />
          <Typography fontWeight={600}>Step 4: PMU Details</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <ReadOnlyField label="PMU Team Type" value="External PMU" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <ReadOnlyField label="Total Team Members" value="12" />
            </Grid>
          </Grid>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>No. of Members</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow><TableCell>Program Managers</TableCell><TableCell>2</TableCell></TableRow>
                <TableRow><TableCell>Team Lead</TableCell><TableCell>1</TableCell></TableRow>
                <TableRow><TableCell>Backend Developers</TableCell><TableCell>3</TableCell></TableRow>
                <TableRow><TableCell>Frontend Developers</TableCell><TableCell>2</TableCell></TableRow>
                <TableRow><TableCell>Data/Business Analysts</TableCell><TableCell>2</TableCell></TableRow>
                <TableRow><TableCell>DevOps Engineer</TableCell><TableCell>1</TableCell></TableRow>
                <TableRow><TableCell>Subject Matter Experts</TableCell><TableCell>1</TableCell></TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ mt: 1 }}>
            <Chip label="Total: 12 / 12 ✓" size="small" color="success" />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Certification & Submit */}
      <Card sx={{ mt: 3, borderRadius: 2, border: '1px solid #E2E8F0' }}>
        <CardContent sx={{ p: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={certChecked}
                onChange={e => setCertChecked(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography variant="body2">
                I hereby certify that, to the best of my knowledge, the provided information is true and accurate.
              </Typography>
            }
          />
          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadPdf}
              sx={{ textTransform: 'none' }}
            >
              Download PDF
            </Button>
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              disabled={!certChecked}
              onClick={handleSubmit}
              sx={{
                textTransform: 'none',
                bgcolor: '#10B981',
                '&:hover': { bgcolor: '#059669' },
                '&.Mui-disabled': { bgcolor: '#D1D5DB' },
              }}
            >
              Submit
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <Dialog open={successDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
          <CheckCircleIcon sx={{ fontSize: 64, color: '#10B981', mb: 1 }} />
          <Typography variant="h5" fontWeight={600}>Submission Successful!</Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
          <Typography variant="body1" color="text.secondary">
            Your VSK details have been submitted successfully. The form is now locked for editing.
            You will receive a confirmation email shortly.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            onClick={handleConfirmSubmit}
            sx={{ textTransform: 'none', bgcolor: '#7C3AED', '&:hover': { bgcolor: '#6D28D9' } }}
          >
            OK, Got it
          </Button>
        </DialogActions>
      </Dialog>

      {/* PDF Download Snackbar */}
      <Snackbar
        open={snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar(false)} severity="info" variant="filled">
          PDF download started — your file will be ready shortly.
        </Alert>
      </Snackbar>
    </Box>
  );
}
