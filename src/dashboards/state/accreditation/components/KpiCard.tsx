import React from 'react';
import { Box, Paper, Typography, Skeleton } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

// ─── TYPES ───────────────────────────────────────────────────────────────────
export interface KpiCardProps {
  kpiNo: number;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { direction: 'up' | 'down' | 'flat'; value: number };
  color?: string;
  loading?: boolean;
}

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const AMBER_PRIMARY = '#D97706';

const TREND_CONFIG = {
  up: { icon: TrendingUpIcon, color: '#10B981', label: '+' },
  down: { icon: TrendingDownIcon, color: '#EF4444', label: '-' },
  flat: { icon: TrendingFlatIcon, color: '#6B7280', label: '' },
} as const;

// ─── COMPONENT ───────────────────────────────────────────────────────────────
/**
 * KpiCard displays a numeric KPI value as a card with title, value,
 * optional subtitle, and optional trend indicator.
 *
 * Validates: Requirements 16.1
 */
const KpiCard: React.FC<KpiCardProps> = ({
  kpiNo,
  title,
  value,
  subtitle,
  trend,
  color = AMBER_PRIMARY,
  loading = false,
}) => {
  if (loading) {
    return (
      <Paper
        sx={{
          p: 2.5,
          height: '100%',
          borderTop: `3px solid ${color}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Skeleton variant="text" width="60%" height={20} />
        <Skeleton variant="text" width="40%" height={40} sx={{ mt: 1 }} />
        <Skeleton variant="text" width="50%" height={16} sx={{ mt: 0.5 }} />
      </Paper>
    );
  }

  const TrendIcon = trend ? TREND_CONFIG[trend.direction].icon : null;
  const trendColor = trend ? TREND_CONFIG[trend.direction].color : undefined;
  const trendLabel = trend ? TREND_CONFIG[trend.direction].label : '';

  return (
    <Paper
      sx={{
        p: 2.5,
        height: '100%',
        borderTop: `3px solid ${color}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      {/* KPI Number Badge */}
      <Box
        sx={{
          bgcolor: `${color}15`,
          borderRadius: 1,
          px: 1,
          py: 0.25,
          mb: 1,
          alignSelf: 'flex-start',
        }}
      >
        <Typography variant="caption" fontWeight={600} color={color}>
          KPI {kpiNo}
        </Typography>
      </Box>

      {/* Title */}
      <Typography
        variant="body2"
        color="text.secondary"
        gutterBottom
        sx={{ lineHeight: 1.3 }}
      >
        {title}
      </Typography>

      {/* Value */}
      <Typography variant="h5" fontWeight={700} color={color} sx={{ mt: 'auto' }}>
        {value}
      </Typography>

      {/* Subtitle */}
      {subtitle && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
          {subtitle}
        </Typography>
      )}

      {/* Trend Indicator */}
      {trend && TrendIcon && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            mt: 1,
            color: trendColor,
          }}
        >
          <TrendIcon sx={{ fontSize: 16 }} />
          <Typography variant="caption" fontWeight={600} color={trendColor}>
            {trendLabel}{trend.value}%
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default KpiCard;
