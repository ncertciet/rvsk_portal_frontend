import { Box, Typography, Grid, IconButton, Collapse } from '@mui/material';
import { useState } from 'react';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface KpiData {
  TOTAL_PROJECTS: number;
  TOTAL_STARTED: number;
  TOTAL_INPROGRESS: number;
  TOTAL_SUBMITTED: number;
  TOTAL_WITH_EVIDENCE: number;
}

interface MicroImprovementMetricsProps {
  kpis: KpiData;
}

/**
 * Formats a number in Indian number system with L (lakh) suffix
 * e.g., 1348000 → "13.48L", 72243 → "72,243"
 */
function formatIndianNumber(num: number): string {
  if (num >= 100000) {
    const inLakhs = num / 100000;
    return `${inLakhs.toFixed(2).replace(/\.?0+$/, '')}L`;
  }
  return num.toLocaleString('en-IN');
}

const metricCards: { key: keyof KpiData; label: string }[] = [
  { key: 'TOTAL_PROJECTS', label: 'Total Micro Improvements Ongoing' },
  { key: 'TOTAL_STARTED', label: 'Total Micro Improvements Started' },
  { key: 'TOTAL_INPROGRESS', label: 'Total Micro Improvements In Progress' },
  { key: 'TOTAL_SUBMITTED', label: 'Total Micro Improvements Submitted' },
  { key: 'TOTAL_WITH_EVIDENCE', label: 'Total Submitted With Evidence' },
];

export default function MicroImprovementMetrics({ kpis }: MicroImprovementMetricsProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <Box sx={{ mt: 3 }}>
      {/* Section header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(22,163,74,0.12)',
          }}
        >
          <Typography sx={{ fontSize: 16 }}>🌱</Typography>
        </Box>
        <Box>
          <Typography
            sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B' }}
          >
            Micro-Improvements
          </Typography>
        </Box>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 800, pb: 2, borderBottom: '1px solid #F1F5F9' }}>
        Micro-Improvements cater to the objective of making the improvement process easy, simple,
        and achievable for every teacher and leader in the education system. The approach uses the
        &lsquo;learning by doing&rsquo; concept.
      </Typography>

      {/* Metrics Data label with toggle */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Box
          sx={{
            bgcolor: '#F1F5F9',
            px: 1.5,
            py: 0.5,
            borderRadius: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
            Metrics Data
          </Typography>
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={{
              transition: 'transform 0.3s ease',
              transform: expanded ? 'rotate(0deg)' : 'rotate(180deg)',
            }}
          >
            <ExpandLessIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Grid container spacing={2}>
          {metricCards.map((card) => (
            <Grid item xs={6} sm={3} key={card.key}>
              <Box
                sx={{
                  border: '1px solid #E2E8F0',
                  borderLeft: '3px solid #2563EB',
                  borderRadius: '12px',
                  p: 2.5,
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFF 100%)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  },
                }}
              >
                <Typography
                  sx={{
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    color: '#1E40AF',
                    mb: 0.5,
                    letterSpacing: '-0.5px',
                  }}
                >
                  {formatIndianNumber(kpis[card.key] || 0)}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.72rem',
                    letterSpacing: '0.3px',
                    color: '#64748B',
                    fontWeight: 500,
                  }}
                >
                  {card.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Collapse>
    </Box>
  );
}
