import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { GRIEVANCE_STATUSES } from './constants';

interface TimelineEntry {
  id: string;
  action: string;
  oldStatus?: string;
  newStatus?: string;
  comment?: string;
  isInternal?: boolean;
  performedBy: string;
  performedAt: string;
  performedByName?: string;
}

interface ActivityTimelineProps {
  entries: TimelineEntry[];
  showInternal?: boolean;
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ entries, showInternal = false }) => {
  const visibleEntries = showInternal ? entries : entries.filter((e) => !e.isInternal);

  const getDotColor = (entry: TimelineEntry): string => {
    if (entry.newStatus && GRIEVANCE_STATUSES[entry.newStatus]) {
      return GRIEVANCE_STATUSES[entry.newStatus].color;
    }
    if (entry.isInternal) return '#9CA3AF';
    return '#3B82F6';
  };

  const getActionLabel = (entry: TimelineEntry): string => {
    if (entry.action === 'CREATED') return 'Grievance Created';
    if (entry.action === 'STATUS_CHANGE') return `Status changed to ${GRIEVANCE_STATUSES[entry.newStatus || '']?.label || entry.newStatus}`;
    if (entry.action === 'RESPONSE_ADDED') return 'Response Provided';
    if (entry.action === 'REOPENED') return 'Grievance Reopened';
    if (entry.action === 'CLOSED') return 'Grievance Closed';
    if (entry.action === 'INTERNAL_NOTE') return 'Internal Note';
    return entry.action;
  };

  if (visibleEntries.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No activity recorded yet.
      </Typography>
    );
  }

  return (
    <Box sx={{ position: 'relative', pl: 3 }}>
      {/* Vertical line */}
      <Box
        sx={{
          position: 'absolute',
          left: 10,
          top: 8,
          bottom: 8,
          width: 2,
          backgroundColor: '#E5E7EB',
        }}
      />

      {visibleEntries.map((entry, index) => (
        <Box key={entry.id || index} sx={{ position: 'relative', mb: 2 }}>
          {/* Dot */}
          <Box
            sx={{
              position: 'absolute',
              left: -22,
              top: 8,
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: getDotColor(entry),
              border: '2px solid #fff',
              boxShadow: '0 0 0 2px ' + getDotColor(entry) + '40',
            }}
          />

          <Paper
            variant="outlined"
            sx={{
              p: 1.5,
              backgroundColor: entry.isInternal ? '#FEF3C7' : '#F9FAFB',
              borderColor: entry.isInternal ? '#F59E0B40' : '#E5E7EB',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {getActionLabel(entry)}
                {entry.isInternal && (
                  <Typography component="span" variant="caption" sx={{ ml: 1, color: '#F59E0B' }}>
                    (Internal)
                  </Typography>
                )}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(entry.performedAt).toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            </Box>
            {entry.comment && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {entry.comment}
              </Typography>
            )}
          </Paper>
        </Box>
      ))}
    </Box>
  );
};

export default ActivityTimeline;
