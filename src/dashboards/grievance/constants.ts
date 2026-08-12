/**
 * RVSK Grievance Module Constants
 */

export const GRIEVANCE_STATUSES: Record<string, { label: string; color: string }> = {
  OPEN: { label: 'Open', color: '#F59E0B' },
  ASSIGNED: { label: 'Assigned', color: '#3B82F6' },
  UNDER_REVIEW: { label: 'Under Review', color: '#6366F1' },
  IN_PROGRESS: { label: 'In Progress', color: '#8B5CF6' },
  RESPONSE_PROVIDED: { label: 'Response Provided', color: '#10B981' },
  CLOSED: { label: 'Closed', color: '#6B7280' },
  REOPENED: { label: 'Reopened', color: '#EF4444' },
};

export const STATUS_OPTIONS = Object.entries(GRIEVANCE_STATUSES).map(([value, { label }]) => ({
  value,
  label,
}));

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const MAX_FILE_SIZE_MB = 5;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const MAX_SUBJECT_LENGTH = 200;
export const MAX_DESCRIPTION_LENGTH = 2000;

export const SPOC_ROLES = ['RVSK_SPOC', 'Super_Admin', 'RVSK_Admin'];
export const ADMIN_ROLES = ['Super_Admin', 'RVSK_Admin'];
