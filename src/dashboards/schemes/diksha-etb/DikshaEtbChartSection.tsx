import { Box, Typography, IconButton } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import EtbCoverageChart from './charts/EtbCoverageChart';
import QrCoverageDonutChart from './charts/QrCoverageDonutChart';
import QrCoverageBarChart from './charts/QrCoverageBarChart';
import LearningSessionChart from './charts/LearningSessionChart';

interface StatewiseData {
  STATE_NAME: string;
  TOTAL_CURRICULUM_TEXTBOOKS: number;
  TOTAL_ENERGISED_TEXTBOOKS: number;
  ETB_COVERAGE_PCT: number;
  QR_COVERAGE_PCT: number;
  LEARNING_SESSION_PER_CAPITA: number;
}

interface DikshaEtbChartSectionProps {
  statewiseData: StatewiseData[];
}

export default function DikshaEtbChartSection({ statewiseData }: DikshaEtbChartSectionProps) {
  return (
    <Box
      sx={{
        mt: 4,
        border: '2px dashed #2563EB',
        borderRadius: '16px',
        p: 3,
        bgcolor: '#FFFFFF',
        boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
      }}
    >
      {/* Header Row */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <Typography variant="h6" fontWeight={700} color="#1E293B">
          State-wise Performance
        </Typography>
        <IconButton
          sx={{
            bgcolor: '#1A4F99',
            color: '#fff',
            borderRadius: 1,
            '&:hover': { bgcolor: '#0D2B5B' },
            width: 36,
            height: 36,
          }}
        >
          <DownloadIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* ETB Coverage Status - Stacked Bar Chart */}
      <Box sx={{ mb: 5 }}>
        <EtbCoverageChart statewiseData={statewiseData} />
      </Box>

      {/* Content Coverage on QR% - Donut Chart */}
      <Box sx={{ mb: 5 }}>
        <QrCoverageDonutChart statewiseData={statewiseData} />
      </Box>

      {/* Content Coverage on QR% - Bar Chart */}
      <Box sx={{ mb: 5 }}>
        <QrCoverageBarChart statewiseData={statewiseData} />
      </Box>

      {/* Learning Session Per Capita - Donut Chart */}
      <Box sx={{ mb: 2 }}>
        <LearningSessionChart statewiseData={statewiseData} />
      </Box>

      {/* Last Updated */}
      <Box sx={{ mt: 2, textAlign: 'right' }}>
        <Typography variant="caption" color="text.secondary">
          Last Updated date : 13 JUL 2025
        </Typography>
      </Box>
    </Box>
  );
}
