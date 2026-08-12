import { Box, Typography, Grid, IconButton, Collapse } from '@mui/material';
import { useState } from 'react';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PublicIcon from '@mui/icons-material/Public';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import PercentIcon from '@mui/icons-material/Percent';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface DikshaEtbKpis {
  TOTAL_STATES_PARTICIPATING: number;
  TOTAL_ETBS: number;
  TOTAL_QR_CODES: number;
  CONTENT_COVERAGE_QR_PCT: number;
  TOTAL_CONTENT: number;
  TOTAL_TIME_SPENT_MINS: number;
}

interface DikshaEtbMetricsProps {
  kpis: DikshaEtbKpis;
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
  bgTint: string;
  icon: React.ReactNode;
}

export default function DikshaEtbMetrics({ kpis }: DikshaEtbMetricsProps) {
  const [expanded, setExpanded] = useState(true);

  const row1Cards: MetricCardDef[] = [
    {
      label: 'Total States/UTs Participating',
      value: formatNumber(kpis.TOTAL_STATES_PARTICIPATING || 0),
      borderColor: '#059669',
      bgTint: '#F0FDF4',
      icon: <PublicIcon sx={{ color: '#059669', fontSize: 20 }} />,
    },
    {
      label: "Total ETB's",
      value: formatNumber(kpis.TOTAL_ETBS || 0),
      borderColor: '#2563EB',
      bgTint: '#EFF6FF',
      icon: <MenuBookIcon sx={{ color: '#2563EB', fontSize: 20 }} />,
    },
    {
      label: 'Total QR Codes',
      value: formatNumber(kpis.TOTAL_QR_CODES || 0),
      borderColor: '#7C3AED',
      bgTint: '#F5F3FF',
      icon: <QrCode2Icon sx={{ color: '#7C3AED', fontSize: 20 }} />,
    },
  ];

  const row2Cards: MetricCardDef[] = [
    {
      label: 'Content Coverage QR%',
      value: `${(kpis.CONTENT_COVERAGE_QR_PCT || 0).toFixed(2)}%`,
      borderColor: '#059669',
      bgTint: '#F0FDF4',
      icon: <PercentIcon sx={{ color: '#059669', fontSize: 20 }} />,
    },
    {
      label: 'Total Content',
      value: formatNumber(kpis.TOTAL_CONTENT || 0),
      borderColor: '#2563EB',
      bgTint: '#EFF6FF',
      icon: <ContentCopyIcon sx={{ color: '#2563EB', fontSize: 20 }} />,
    },
    {
      label: 'Total Time Spent (mins)',
      value: formatNumber(kpis.TOTAL_TIME_SPENT_MINS || 0),
      borderColor: '#7C3AED',
      bgTint: '#F5F3FF',
      icon: <AccessTimeIcon sx={{ color: '#7C3AED', fontSize: 20 }} />,
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
          background: card.bgTint,
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
            bgcolor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
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
            background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(5,150,105,0.12)',
          }}
        >
          <Typography sx={{ fontSize: 16 }}>📚</Typography>
        </Box>
        <Box>
          <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B' }}>
            DIKSHA - ETB &amp; eContent
          </Typography>
        </Box>
      </Box>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 2, maxWidth: 900, pb: 2, borderBottom: '1px solid #F1F5F9' }}
      >
        Energised TextBooks (ETBs) are QR-coded textbooks that provide students access to digital
        content aligned with their curriculum. DIKSHA platform enables teachers, students, and
        parents to access engaging learning content through QR codes embedded in textbooks.
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
