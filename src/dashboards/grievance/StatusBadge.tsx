import React from 'react';
import { Chip } from '@mui/material';
import { GRIEVANCE_STATUSES } from './constants';

interface StatusBadgeProps {
  status: string;
  size?: 'small' | 'medium';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'small' }) => {
  const config = GRIEVANCE_STATUSES[status] || { label: status, color: '#9CA3AF' };

  return (
    <Chip
      label={config.label}
      size={size}
      sx={{
        backgroundColor: `${config.color}20`,
        color: config.color,
        fontWeight: 600,
        border: `1px solid ${config.color}40`,
      }}
    />
  );
};

export default StatusBadge;
