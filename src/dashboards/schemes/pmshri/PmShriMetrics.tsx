import { Box, Typography, Grid, IconButton, Collapse } from '@mui/material';
import { useState } from 'react';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface KpiData {
  totalSchools: number;
  totalKvsSchools: number;
  totalNvsSchools: number;
  totalClassrooms: number;
  totalSmartClassrooms: number;
  totalStudents: number;
  totalTeachers: number;
  totalCwsn: number;
}

interface PmShriMetricsProps {
  kpis: KpiData;
}

/**
 * Formats a number in Indian number system with L (lakh) suffix
 * e.g., 170000 → "1.70L", 6603000 → "66.03L"
 */
function formatIndianNumber(num: number): string {
  if (num >= 100000) {
    const inLakhs = num / 100000;
    return `${inLakhs.toFixed(2).replace(/\.?0+$/, '')}L`;
  }
  return num.toLocaleString('en-IN');
}

const metricCards = [
  { key: 'totalSchools', label: 'Total Schools' },
  { key: 'totalKvsSchools', label: 'Total KVS Schools' },
  { key: 'totalNvsSchools', label: 'Total NVS Schools' },
  { key: 'totalClassrooms', label: 'Total Classrooms' },
  { key: 'totalSmartClassrooms', label: 'Total Smart Classrooms' },
  { key: 'totalTeachers', label: 'Total Teachers' },
  { key: 'totalStudents', label: 'Total Students' },
  { key: 'totalCwsn', label: 'Total CWSN Enrollment' },
];

export default function PmShriMetrics({ kpis }: PmShriMetricsProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <Box sx={{ mt: 3 }}>
      {/* Section header with PM SHRI title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(37,99,235,0.12)',
          }}
        >
          <Typography sx={{ fontSize: 16 }}>🏛️</Typography>
        </Box>
        <Box>
          <Typography
            sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B' }}
          >
            PM SHRI
          </Typography>
        </Box>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 800, pb: 2, borderBottom: '1px solid #F1F5F9' }}>
        PM Schools for Rising India (PM SHRI) is a centrally sponsored scheme for upgrading and developing
        select existing schools from across the country, demonstrating the implementation of the National Education Policy 2020.
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
                  {formatIndianNumber((kpis as any)[card.key] || 0)}
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
