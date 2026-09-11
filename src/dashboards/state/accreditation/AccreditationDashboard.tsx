import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Typography, Chip } from '@mui/material';
import FilterBar, { FilterState } from './components/FilterBar';
import { SectionErrorBoundary } from './components';

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const HEADER_HEIGHT = 56;
const AMBER_PRIMARY = '#D97706';
const AMBER_DARK = '#92400E';

// ─── HEADER COMPONENT ────────────────────────────────────────────────────────
function AccreditationHeader() {
  return (
    <Box
      sx={{
        height: HEADER_HEIGHT,
        background: `linear-gradient(135deg, ${AMBER_DARK} 0%, ${AMBER_PRIMARY} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        color: '#fff',
        flexShrink: 0,
      }}
    >
      <Typography variant="subtitle2" fontWeight={700} sx={{ letterSpacing: 0.5 }}>
        Rashtriya Vidya Samiksha Kendra — Accreditation Dashboard
      </Typography>
      <Chip
        label="NATIONAL LEVEL"
        size="small"
        sx={{ bgcolor: '#F59E0B', color: '#fff', fontWeight: 700, fontSize: 11, height: 24 }}
      />
    </Box>
  );
}

// ─── LAYOUT COMPONENT ────────────────────────────────────────────────────────
/**
 * AccreditationDashboard is the shared layout for all 5 accreditation sections.
 *
 * Navigation is handled by the portal's left sidebar (PortalLayout), which is
 * database-driven from page_master — exactly like the Attendance dashboard.
 * This component therefore only renders the page header, the shared filter bar,
 * and an <Outlet> for the active section. It does NOT render its own sidebar.
 *
 * Route segments (mapped from page_master.route_path):
 *   programme | coverage | process | data-quality | impact
 */
export default function AccreditationDashboard() {
  // Global filter state shared across all sections via Outlet context
  const [filters, setFilters] = useState<FilterState>({ academicYear: '', stateCode: 'ALL' });

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Page Header */}
      <AccreditationHeader />

      {/* Global Filter Bar */}
      <FilterBar onFilterChange={handleFilterChange} />

      {/* Section content via React Router Outlet */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3, bgcolor: '#F8FAFC' }}>
        <SectionErrorBoundary>
          <Outlet context={{ filters }} />
        </SectionErrorBoundary>
      </Box>
    </Box>
  );
}
