// Types matching backend DTOs for the role-based homepage feature

export interface ActivityLogEntry {
  id: string;
  module: string;
  action: string;
  description: string;
  performedBy: string;
  performedAt: string;
}

export interface GalleryImage {
  id: string;
  imageUrl: string;
  thumbnailUrl: string;
  stateName: string;
  stateCode: string;
  caption: string;
  uploadedAt: string;
}

export interface AssignedForm {
  id: string;
  title: string;
  status: 'PENDING' | 'DRAFT_SAVED' | 'SUBMITTED';
  dueDate: string;
  assignedDate: string;
}

export interface PendingAction {
  grievanceId: string;
  subject: string;
  status: string;
  createdAt: string;
}

export interface SuperAdminHomeData {
  totalUsers: number;
  totalForms: number;
  totalGrievances: number;
  activeServices: number;
  recentActivities: ActivityLogEntry[];
}

export interface RvskAdminHomeData {
  formsSent: number;
  formsPublished: number;
  responsesReceived: number;
  recentActivities: ActivityLogEntry[];
}

export interface StateAdminHomeData {
  pendingCount: number;
  draftCount: number;
  submittedCount: number;
  assignedForms: AssignedForm[];
}

export interface SpocHomeData {
  openGrievances: number;
  inProgressGrievances: number;
  resolvedGrievances: number;
  pendingActions: PendingAction[];
}
