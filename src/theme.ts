import { createTheme } from '@mui/material/styles';

/**
 * RVSK Portal Design System Theme
 * 
 * Color Palette: MIS Indigo + Amber Thematic (Government Dashboard Framework)
 * Typography: Inter / system fonts
 * Based on the NVSK Central Dashboard Framework design specifications.
 */
export const theme = createTheme({
  palette: {
    primary: {
      main: '#1E3A8A',    // Indigo 700 — Primary actions, headers
      dark: '#1A1F7E',    // Indigo 900 — Primary contrast
      light: '#2563EB',   // Indigo 600 — Primary accent/hover
    },
    secondary: {
      main: '#D97706',    // Amber 800 — Secondary actions
      dark: '#92400E',    // Amber 900
      light: '#F59E0B',   // Amber 600
    },
    success: { main: '#4CAF50', light: '#E8F5E9' },
    warning: { main: '#FF9800', light: '#FFF3E0' },
    error: { main: '#DC2626', light: '#FEE2E2' },
    info: { main: '#0891B2', light: '#E0F2FE' },
    background: {
      default: '#F8FAFC',   // App background
      paper: '#FFFFFF',
    },
    text: {
      primary: '#111827',   // Gray 900 — Body text
      secondary: '#374151', // Gray 700 — Subtitles/icons
    },
    divider: '#E2E8F0',
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontSize: '57px', fontWeight: 800, lineHeight: 1.1 },       // Display Large — Portal Hero
    h2: { fontSize: '45px', fontWeight: 700, lineHeight: 1.15 },      // Display Medium — Overview
    h3: { fontSize: '36px', fontWeight: 700, lineHeight: 1.22 },      // Display Small — Dashboard Header
    h4: { fontSize: '32px', fontWeight: 700, lineHeight: 1.25 },      // Headline Large — Primary Card Header
    h5: { fontSize: '28px', fontWeight: 600, lineHeight: 1.29 },      // Headline Medium — Analytics Module
    h6: { fontSize: '24px', fontWeight: 600, lineHeight: 1.33 },      // Headline Small — Component Block Title
    subtitle1: { fontSize: '22px', fontWeight: 600, lineHeight: 1.27 }, // Title Large
    subtitle2: { fontSize: '16px', fontWeight: 600, lineHeight: 1.43 }, // Title Medium — Form Field Title
    body1: { fontSize: '16px', fontWeight: 400, lineHeight: 1.5 },
    body2: { fontSize: '14px', fontWeight: 400, lineHeight: 1.43 },
    caption: { fontSize: '12px', fontWeight: 500, lineHeight: 1.33 },
    overline: { fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' as const },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none' as const,
          fontWeight: 600,
          borderRadius: 8,
          padding: '8px 20px',
        },
        containedPrimary: {
          backgroundColor: '#1E3A8A',
          '&:hover': { backgroundColor: '#1A1F7E' },
        },
        containedSecondary: {
          backgroundColor: '#D97706',
          '&:hover': { backgroundColor: '#92400E' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
        },
      },
    },
  },
});
