import { Box, Typography, Grid, IconButton, Collapse } from '@mui/material';
import { useState } from 'react';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SchoolIcon from '@mui/icons-material/School';
import PercentIcon from '@mui/icons-material/Percent';

interface PmPoshanKpis {
  TOTAL_SCHOOLS_ENROLLED: number;
  TOTAL_SCHOOLS_MEALS_SERVED: number;
  SCHOOLS_MEALS_SERVED_PCT: number;
  TOTAL_MEALS_ENROLLED: number;
  TOTAL_MEALS_SERVED: number;
  MEALS_SERVED_PCT: number;
}

interface PmPoshanMetricsProps {
  kpis: PmPoshanKpis;
}

/**
 * Formats a number in Indian number system with L (lakh) or Cr (crore) suffix.
 */
function formatNumber(num: number): string {
  if (num >= 10000000) return `${(num / 10000000).toFixed(2).replace(/\.?0+$/, '')}Cr`;
  if (num >= 100000) return `${(num / 100000).toFixed(2).replace(/\.?0+$/, '')}L`;
  return num.toLocaleString('en-IN');
}

interface MetricCardDef {
  label: string;
  value: string;
  borderColor: string;
  iconBg: string;
  icon: React.ReactNode;
}

export default function PmPoshanMetrics({ kpis }: PmPoshanMetricsProps) {
  const [expanded, setExpanded] = useState(true);

  const row1Cards: MetricCardDef[] = [
    {
      label: 'Total Schools Enrolled',
      value: formatNumber(kpis.TOTAL_SCHOOLS_ENROLLED || 0),
      borderColor: '#DC2626',
      iconBg: '#FEE2E2',
      icon: <SchoolIcon sx={{ color: '#DC2626', fontSize: 20 }} />,
    },
    {
      label: 'Total Schools Meals Served',
      value: formatNumber(kpis.TOTAL_SCHOOLS_MEALS_SERVED || 0),
      borderColor: '#2563EB',
      iconBg: '#DBEAFE',
      icon: <RestaurantIcon sx={{ color: '#2563EB', fontSize: 20 }} />,
    },
    {
      label: 'Schools Meals Served',
      value: `${(kpis.SCHOOLS_MEALS_SERVED_PCT || 0).toFixed(2)}%`,
      borderColor: '#7C3AED',
      iconBg: '#EDE9FE',
      icon: <PercentIcon sx={{ color: '#7C3AED', fontSize: 20 }} />,
    },
  ];

  const row2Cards: MetricCardDef[] = [
    {
      label: 'Total Meals Enrolled',
      value: formatNumber(kpis.TOTAL_MEALS_ENROLLED || 0),
      borderColor: '#DC2626',
      iconBg: '#FEE2E2',
      icon: <RestaurantIcon sx={{ color: '#DC2626', fontSize: 20 }} />,
    },
    {
      label: 'Total Meals Served',
      value: formatNumber(kpis.TOTAL_MEALS_SERVED || 0),
      borderColor: '#2563EB',
      iconBg: '#DBEAFE',
      icon: <RestaurantIcon sx={{ color: '#2563EB', fontSize: 20 }} />,
    },
    {
      label: 'Meals Served',
      value: `${(kpis.MEALS_SERVED_PCT || 0).toFixed(2)}%`,
      borderColor: '#7C3AED',
      iconBg: '#EDE9FE',
      icon: <PercentIcon sx={{ color: '#7C3AED', fontSize: 20 }} />,
    },
  ];

  const renderCard = (card: MetricCardDef) => (
    <Grid item xs={12} sm={4} key={card.label}>
      <Box
        sx={{
          border: '1px solid #E2E8F0',
          borderLeft: `4px solid ${card.borderColor}`,
          borderRadius: '16px',
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          background: '#FFFFFF',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          },
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            bgcolor: card.iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {card.icon}
        </Box>
        <Box>
          <Typography
            sx={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#1E293B',
              lineHeight: 1.2,
            }}
          >
            {card.value}
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
      </Box>
    </Grid>
  );

  return (
    <Box sx={{ mt: 3 }}>
      {/* Section header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FEF2F2, #FECACA)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(220,38,38,0.12)',
          }}
        >
          <Typography sx={{ fontSize: 16 }}>🍽️</Typography>
        </Box>
        <Box>
          <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B' }}>
            PM POSHAN
          </Typography>
        </Box>
      </Box>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 2, maxWidth: 900, pb: 2, borderBottom: '1px solid #F1F5F9' }}
      >
        The Government has approved the Centrally Sponsored Scheme &lsquo;Pradhan Mantri Poshan
        Shakti Nirman (PM POSHAN)&rsquo; for providing one hot cooked meal in Government and
        Government-aided Schools from 2021-22 to 2025-26.
      </Typography>

      {/* Subtitle */}
      <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
        Data Metrics as on 08-MAY-2026 | For 21 States &amp; UTs
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
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {row1Cards.map(renderCard)}
        </Grid>
        <Grid container spacing={2}>
          {row2Cards.map(renderCard)}
        </Grid>
      </Collapse>
    </Box>
  );
}
