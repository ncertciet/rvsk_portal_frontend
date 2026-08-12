import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  Box, Typography, Tabs, Tab, Stepper, Step, StepLabel, StepButton,
  Button, Paper, Chip, Alert, Snackbar, Fade, CircularProgress,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import BuildIcon from '@mui/icons-material/Build';
import ComputerIcon from '@mui/icons-material/Computer';
import GroupsIcon from '@mui/icons-material/Groups';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CollectionsIcon from '@mui/icons-material/Collections';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SaveIcon from '@mui/icons-material/Save';
import LockIcon from '@mui/icons-material/Lock';

import Step1OfficersCommittee from './vsk/steps/Step1OfficersCommittee';
import Step2InfraHardware from './vsk/steps/Step2InfraHardware';
import Step3Software from './vsk/steps/Step3Software';
import Step4Pmu from './vsk/steps/Step4Pmu';
import Step5ReviewSubmit from './vsk/steps/Step5ReviewSubmit';
import VskImageUpload from './home/VskImageUpload';
import { fetchVskProfile, saveDraft, saveAndNext, VskProfileDto } from './vsk/vskApi';
import { RootState } from '../../store';

// ─── Types ────────────────────────────────────────────────────────────────────

type StepStatus = 'PENDING' | 'DRAFT' | 'COMPLETE';

interface StepConfig {
  label: string;
  tabLabel: string;
  icon: React.ReactElement;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STEP_CONFIGS: StepConfig[] = [
  { label: 'Officers', tabLabel: 'Step 1: Officers', icon: <PersonIcon /> },
  { label: 'Infra', tabLabel: 'Step 2: Infra', icon: <BuildIcon /> },
  { label: 'Software', tabLabel: 'Step 3: Software', icon: <ComputerIcon /> },
  { label: 'PMU', tabLabel: 'Step 4: PMU', icon: <GroupsIcon /> },
  { label: 'Review', tabLabel: 'Step 5: Review', icon: <CheckCircleIcon /> },
];

const STATUS_COLORS: Record<StepStatus, 'default' | 'warning' | 'success'> = {
  PENDING: 'default',
  DRAFT: 'warning',
  COMPLETE: 'success',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Determine step statuses from profile data.
 * Returns array of 5 statuses for steps 1-5.
 */
function resolveStepStatuses(profile: VskProfileDto | null): StepStatus[] {
  if (!profile) return ['PENDING', 'PENDING', 'PENDING', 'PENDING', 'PENDING'];

  const mapStatus = (s?: string): StepStatus => {
    if (s === 'COMPLETE') return 'COMPLETE';
    if (s === 'DRAFT') return 'DRAFT';
    return 'PENDING';
  };

  return [
    mapStatus(profile.step1Status),
    mapStatus(profile.step2Status),
    mapStatus(profile.step3Status),
    mapStatus(profile.step4Status),
    // Step 5 (Review) is COMPLETE only when submissionStatus is SUBMITTED
    profile.submissionStatus === 'SUBMITTED' ? 'COMPLETE' : 'PENDING',
  ];
}

/**
 * Determine which step should be active based on step statuses.
 * Returns the first non-COMPLETE step, or the last step if all are done.
 */
function resolveActiveStep(statuses: StepStatus[]): number {
  const firstIncomplete = statuses.findIndex(s => s !== 'COMPLETE');
  return firstIncomplete === -1 ? 4 : firstIncomplete;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function VskDetails() {
  const user = useSelector((state: RootState) => state.auth.user);
  const stateCode = user?.stateCode ?? '';

  // Profile & step state
  const [profile, setProfile] = useState<VskProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(
    ['PENDING', 'PENDING', 'PENDING', 'PENDING', 'PENDING']
  );

  // Navigation
  const [activeTab, setActiveTab] = useState(0); // 0-4 = steps, 5 = gallery
  const [autoSaving, setAutoSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'error' }>({
    open: false, message: '', severity: 'info',
  });

  const isSubmitted = profile?.submissionStatus === 'SUBMITTED';
  const isGalleryTab = activeTab === 5;
  const activeStepIndex = activeTab < 5 ? activeTab : -1;

  // ─── Load profile on mount ────────────────────────────────────────────────

  const loadProfile = useCallback(async () => {
    try {
      const data = await fetchVskProfile();
      setProfile(data);
      const statuses = resolveStepStatuses(data);
      setStepStatuses(statuses);
      return statuses;
    } catch {
      // If profile fetch fails, stay on defaults
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile().then((statuses) => {
      if (statuses) {
        setActiveTab(resolveActiveStep(statuses));
      }
    });
  }, [loadProfile]);

  // ─── Navigation handlers ──────────────────────────────────────────────────

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    if (newValue === 5) {
      // Gallery tab — always accessible
      setActiveTab(5);
      return;
    }

    if (isSubmitted) {
      // Allow viewing steps in read-only mode when submitted
      setActiveTab(newValue);
      return;
    }

    // Allow navigation to completed steps and the current active step
    // Disable navigation to steps beyond the furthest reached
    const furthestReachable = stepStatuses.findIndex(s => s === 'PENDING');
    const maxAllowed = furthestReachable === -1 ? 4 : furthestReachable;

    if (newValue <= maxAllowed) {
      setActiveTab(newValue);
    }
  };

  const handleStepClick = (stepIndex: number) => () => {
    if (isSubmitted) {
      setActiveTab(stepIndex);
      return;
    }
    const furthestReachable = stepStatuses.findIndex(s => s === 'PENDING');
    const maxAllowed = furthestReachable === -1 ? 4 : furthestReachable;
    if (stepIndex <= maxAllowed) {
      setActiveTab(stepIndex);
    }
  };

  const handleBack = () => {
    if (activeTab > 0 && activeTab < 6) {
      setActiveTab(activeTab - 1);
    }
  };

  const handleSaveDraft = async () => {
    if (activeStepIndex < 0) return;
    setAutoSaving(true);
    try {
      await saveDraft({ step: activeStepIndex + 1, data: {} });
      // Refresh profile to update statuses
      await loadProfile();
      setSnackbar({ open: true, message: 'Draft saved successfully', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to save draft', severity: 'error' });
    } finally {
      setAutoSaving(false);
    }
  };

  /**
   * Called when a step component completes its save-and-next.
   * Refreshes profile data and advances to next step.
   */
  const handleStepComplete = useCallback(async () => {
    const statuses = await loadProfile();
    if (statuses) {
      const currentStep = activeTab;
      if (currentStep < 4) {
        setActiveTab(currentStep + 1);
      }
      setSnackbar({ open: true, message: 'Step saved. Moving to next step.', severity: 'success' });
    }
  }, [activeTab, loadProfile]);

  /**
   * Footer "Save & Next" button handler.
   * Calls the saveAndNext API to mark current step as COMPLETE, then advances.
   */
  const handleFooterSaveAndNext = useCallback(async () => {
    if (activeStepIndex < 0 || activeStepIndex >= 4) return;
    try {
      await saveAndNext({ step: activeStepIndex + 1, data: {} });
      await loadProfile();
      setActiveTab(activeStepIndex + 1);
      setSnackbar({ open: true, message: 'Step saved. Moving to next step.', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to save step', severity: 'error' });
    }
  }, [activeStepIndex, loadProfile]);

  /**
   * Called after successful submission from Step5ReviewSubmit.
   * Refreshes profile → locks everything.
   */
  const handleSubmitSuccess = useCallback(async () => {
    await loadProfile();
    setSnackbar({ open: true, message: 'VSK Details submitted successfully!', severity: 'success' });
  }, [loadProfile]);

  // ─── Step content renderer ────────────────────────────────────────────────

  const renderStepContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      );
    }

    switch (activeTab) {
      case 0:
        return (
          <Step1OfficersCommittee
            stateCode={stateCode}
            isReadOnly={isSubmitted}
            onStepComplete={handleStepComplete}
          />
        );
      case 1:
        return (
          <Step2InfraHardware
            stateCode={stateCode}
            isReadOnly={isSubmitted}
            onStepComplete={handleStepComplete}
          />
        );
      case 2:
        return (
          <Step3Software
            stateCode={stateCode}
            isReadOnly={isSubmitted}
            onStepComplete={handleStepComplete}
          />
        );
      case 3:
        return (
          <Step4Pmu
            stateCode={stateCode}
            isReadOnly={isSubmitted}
            onStepComplete={handleStepComplete}
          />
        );
      case 4:
        return (
          <Step5ReviewSubmit
            stateCode={stateCode}
            isReadOnly={isSubmitted}
            onSubmitSuccess={handleSubmitSuccess}
          />
        );
      case 5:
        return <VskImageUpload />;
      default:
        return null;
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700} color="#1E293B">
          VSK Details Wizard
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {autoSaving && (
            <Fade in={autoSaving}>
              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                Saving...
              </Typography>
            </Fade>
          )}
          {isSubmitted && (
            <Chip
              label="SUBMITTED"
              color="success"
              icon={<CheckCircleIcon />}
              sx={{ fontWeight: 600 }}
            />
          )}
        </Box>
      </Box>

      {/* Submitted Banner */}
      {isSubmitted && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} icon={<LockIcon />}>
          <Typography variant="body2" fontWeight={500}>
            This VSK Details form was submitted successfully and is now locked. All steps are read-only.
          </Typography>
        </Alert>
      )}

      {/* Tabs: Steps 1-5 + Gallery */}
      <Paper sx={{ borderRadius: 2, mb: 3, overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            bgcolor: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              minHeight: 48,
            },
            '& .Mui-selected': {
              color: '#7C3AED',
            },
            '& .MuiTabs-indicator': {
              bgcolor: '#7C3AED',
            },
          }}
        >
          {STEP_CONFIGS.map((step, idx) => (
            <Tab
              key={idx}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {step.tabLabel}
                  <Chip
                    label={stepStatuses[idx]}
                    size="small"
                    color={STATUS_COLORS[stepStatuses[idx]]}
                    sx={{ ml: 0.5, fontSize: '0.65rem', height: 20 }}
                  />
                </Box>
              }
            />
          ))}
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CollectionsIcon sx={{ fontSize: 18 }} />
                Gallery
              </Box>
            }
          />
        </Tabs>
      </Paper>

      {/* Stepper (only visible for step tabs, not gallery) */}
      {!isGalleryTab && (
        <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Stepper activeStep={activeStepIndex} nonLinear alternativeLabel>
            {STEP_CONFIGS.map((step, idx) => {
              const completed = stepStatuses[idx] === 'COMPLETE';
              const furthestReachable = stepStatuses.findIndex(s => s === 'PENDING');
              const maxAllowed = furthestReachable === -1 ? 4 : furthestReachable;
              const isDisabled = !isSubmitted && idx > maxAllowed;

              return (
                <Step key={idx} completed={completed}>
                  <StepButton
                    onClick={handleStepClick(idx)}
                    disabled={isDisabled}
                    optional={
                      <Chip
                        label={stepStatuses[idx]}
                        size="small"
                        color={STATUS_COLORS[stepStatuses[idx]]}
                        variant="outlined"
                        sx={{ fontSize: '0.6rem', height: 18 }}
                      />
                    }
                  >
                    <StepLabel
                      StepIconProps={{
                        sx: {
                          color: completed ? '#10B981' :
                                 stepStatuses[idx] === 'DRAFT' ? '#F59E0B' : '#CBD5E1',
                          '&.Mui-active': { color: '#7C3AED' },
                          '&.Mui-completed': { color: '#10B981' },
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
                        {step.icon}
                        <Typography variant="caption" fontWeight={500}>{step.label}</Typography>
                      </Box>
                    </StepLabel>
                  </StepButton>
                </Step>
              );
            })}
          </Stepper>
        </Paper>
      )}

      {/* Step Content */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2, minHeight: 400 }}>
        {renderStepContent()}
      </Paper>

      {/* Footer Navigation (only for step tabs, not gallery, not if submitted) */}
      {!isGalleryTab && !isSubmitted && (
        <Paper sx={{ p: 2, borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            disabled={activeTab === 0}
            sx={{ textTransform: 'none' }}
          >
            Back
          </Button>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={handleSaveDraft}
              disabled={autoSaving}
              sx={{ textTransform: 'none' }}
            >
              Save Draft
            </Button>
            {activeTab < 4 && (
              <Button
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                onClick={handleFooterSaveAndNext}
                sx={{ textTransform: 'none', bgcolor: '#7C3AED', '&:hover': { bgcolor: '#6D28D9' } }}
              >
                Save & Next
              </Button>
            )}
          </Box>
        </Paper>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
