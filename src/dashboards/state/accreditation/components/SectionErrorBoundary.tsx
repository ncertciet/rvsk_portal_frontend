import React from 'react';
import { Box, Alert, AlertTitle, Button } from '@mui/material';

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface SectionErrorBoundaryProps {
  children: React.ReactNode;
}

interface SectionErrorBoundaryState {
  hasError: boolean;
  message: string;
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────
/**
 * SectionErrorBoundary catches render-time errors thrown by dashboard section
 * pages so a failure in one KPI section does not crash the whole dashboard.
 *
 * Validates: Requirements 16.5
 */
class SectionErrorBoundary extends React.Component<
  SectionErrorBoundaryProps,
  SectionErrorBoundaryState
> {
  constructor(props: SectionErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): SectionErrorBoundaryState {
    return { hasError: true, message: error?.message || 'An unexpected error occurred' };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log for diagnostics without crashing the dashboard shell
    console.error('[Accreditation Dashboard] Section render error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 2 }}>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={this.handleReset}>
                Retry
              </Button>
            }
          >
            <AlertTitle>Unable to display this section</AlertTitle>
            {this.state.message}
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default SectionErrorBoundary;
