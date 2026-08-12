import { useState } from 'react';
import { Box, Typography, Tabs, Tab, IconButton } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import StatewiseTab from './tabs/StatewiseTab';
import DistrictwiseTab from './tabs/DistrictwiseTab';

interface StatewiseData {
  STATE_NAME: string;
  MEALS_ENROLLED: number;
  MEALS_SERVED: number;
  TOTAL_SCHOOLS_ENROLLED: number;
  TOTAL_SCHOOLS_MEALS_SERVED: number;
}

interface PmPoshanChartSectionProps {
  statewiseData: StatewiseData[];
}

export default function PmPoshanChartSection({ statewiseData }: PmPoshanChartSectionProps) {
  const [tab, setTab] = useState(0);

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
      {/* Tabs & Download Button Row */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              minHeight: 40,
              borderRadius: '6px 6px 0 0',
              transition: 'background-color 0.2s ease',
            },
            '& .Mui-selected': {
              color: '#1A4F99',
              bgcolor: '#EFF6FF',
              fontWeight: 700,
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#FF9933',
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          }}
        >
          <Tab label="State wise performance" />
          <Tab label="District wise performance" />
        </Tabs>

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

      {/* Tab Content */}
      {tab === 0 && <StatewiseTab statewiseData={statewiseData} />}
      {tab === 1 && <DistrictwiseTab />}

      {/* Last Updated */}
      <Box sx={{ mt: 2, textAlign: 'right' }}>
        <Typography variant="caption" color="text.secondary">
          Last Updated date : 08-MAY-2026
        </Typography>
      </Box>
    </Box>
  );
}
