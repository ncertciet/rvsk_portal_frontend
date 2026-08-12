import apiClient from '../../../services/apiClient';
import {
  SuperAdminHomeData,
  RvskAdminHomeData,
  StateAdminHomeData,
  SpocHomeData,
  GalleryImage,
  ActivityLogEntry,
  AssignedForm,
  PendingAction,
} from './types';

// ─── Dummy Data Constants ───────────────────────────────────────────────────

const DUMMY_ACTIVITIES: ActivityLogEntry[] = [
  { id: '1', module: 'Forms', action: 'CREATE', description: 'New form "State Infrastructure Survey" created', performedBy: 'admin@rvsk.gov.in', performedAt: '2024-12-20T10:30:00Z' },
  { id: '2', module: 'Users', action: 'UPDATE', description: 'User permissions updated for Maharashtra SPOC', performedBy: 'admin@rvsk.gov.in', performedAt: '2024-12-20T09:15:00Z' },
  { id: '3', module: 'Grievances', action: 'RESOLVE', description: 'Grievance #GRV-045 marked as resolved', performedBy: 'spoc.mp@rvsk.gov.in', performedAt: '2024-12-19T16:45:00Z' },
  { id: '4', module: 'Gallery', action: 'UPLOAD', description: 'New VSK image uploaded from Rajasthan', performedBy: 'state.rj@rvsk.gov.in', performedAt: '2024-12-19T14:20:00Z' },
  { id: '5', module: 'Forms', action: 'PUBLISH', description: 'Form "Teacher Feedback Q4" published to 12 states', performedBy: 'admin@rvsk.gov.in', performedAt: '2024-12-19T11:00:00Z' },
];

const DUMMY_SUPER_ADMIN: SuperAdminHomeData = {
  totalUsers: 156,
  totalForms: 24,
  totalGrievances: 89,
  activeServices: 6,
  recentActivities: DUMMY_ACTIVITIES,
};

const DUMMY_RVSK_ADMIN: RvskAdminHomeData = {
  formsSent: 18,
  formsPublished: 12,
  responsesReceived: 94,
  recentActivities: DUMMY_ACTIVITIES.filter(a => a.module === 'Forms' || a.module === 'Gallery'),
};

const DUMMY_ASSIGNED_FORMS: AssignedForm[] = [
  { id: 'f1', title: 'State Infrastructure Survey 2024', status: 'PENDING', dueDate: '2025-01-15', assignedDate: '2024-12-10' },
  { id: 'f2', title: 'Teacher Training Progress Report', status: 'DRAFT_SAVED', dueDate: '2025-01-20', assignedDate: '2024-12-05' },
  { id: 'f3', title: 'Student Enrollment Verification', status: 'SUBMITTED', dueDate: '2024-12-30', assignedDate: '2024-12-01' },
  { id: 'f4', title: 'Mid-Day Meal Compliance Check', status: 'PENDING', dueDate: '2025-02-01', assignedDate: '2024-12-18' },
];

const DUMMY_STATE_ADMIN: StateAdminHomeData = {
  pendingCount: 3,
  draftCount: 1,
  submittedCount: 2,
  assignedForms: DUMMY_ASSIGNED_FORMS,
};

const DUMMY_PENDING_ACTIONS: PendingAction[] = [
  { grievanceId: 'GRV-101', subject: 'School building maintenance issue', status: 'OPEN', createdAt: '2024-12-18T08:30:00Z' },
  { grievanceId: 'GRV-098', subject: 'Teacher shortage in Block C', status: 'IN_PROGRESS', createdAt: '2024-12-15T10:00:00Z' },
  { grievanceId: 'GRV-095', subject: 'Library books not received', status: 'OPEN', createdAt: '2024-12-12T14:20:00Z' },
];

const DUMMY_SPOC: SpocHomeData = {
  openGrievances: 12,
  inProgressGrievances: 5,
  resolvedGrievances: 34,
  pendingActions: DUMMY_PENDING_ACTIONS,
};

const DUMMY_GALLERY: GalleryImage[] = [
  { id: 'g1', imageUrl: '/images/vsk/rajasthan.jpg', thumbnailUrl: '/images/vsk/rajasthan_thumb.jpg', stateName: 'Rajasthan', stateCode: 'RJ', caption: 'VSK Rajasthan Inauguration', uploadedAt: '2024-12-15T10:00:00Z' },
  { id: 'g2', imageUrl: '/images/vsk/maharashtra.jpg', thumbnailUrl: '/images/vsk/maharashtra_thumb.jpg', stateName: 'Maharashtra', stateCode: 'MH', caption: 'VSK Maharashtra Digital Lab', uploadedAt: '2024-12-14T09:30:00Z' },
  { id: 'g3', imageUrl: '/images/vsk/karnataka.jpg', thumbnailUrl: '/images/vsk/karnataka_thumb.jpg', stateName: 'Karnataka', stateCode: 'KA', caption: 'VSK Karnataka Library', uploadedAt: '2024-12-13T11:00:00Z' },
  { id: 'g4', imageUrl: '/images/vsk/tamilnadu.jpg', thumbnailUrl: '/images/vsk/tamilnadu_thumb.jpg', stateName: 'Tamil Nadu', stateCode: 'TN', caption: 'VSK Tamil Nadu Smart Class', uploadedAt: '2024-12-12T08:45:00Z' },
  { id: 'g5', imageUrl: '/images/vsk/kerala.jpg', thumbnailUrl: '/images/vsk/kerala_thumb.jpg', stateName: 'Kerala', stateCode: 'KL', caption: 'VSK Kerala Science Lab', uploadedAt: '2024-12-11T15:30:00Z' },
  { id: 'g6', imageUrl: '/images/vsk/mp.jpg', thumbnailUrl: '/images/vsk/mp_thumb.jpg', stateName: 'Madhya Pradesh', stateCode: 'MP', caption: 'VSK MP Computer Lab', uploadedAt: '2024-12-10T12:00:00Z' },
  { id: 'g7', imageUrl: '/images/vsk/up.jpg', thumbnailUrl: '/images/vsk/up_thumb.jpg', stateName: 'Uttar Pradesh', stateCode: 'UP', caption: 'VSK UP Sports Ground', uploadedAt: '2024-12-09T10:15:00Z' },
];

// ─── API Functions ──────────────────────────────────────────────────────────

export async function fetchSuperAdminHome(): Promise<SuperAdminHomeData> {
  try {
    const response = await apiClient.get<SuperAdminHomeData>('/home/super-admin');
    return response.data;
  } catch {
    console.warn('fetchSuperAdminHome: API unavailable, using dummy data');
    return DUMMY_SUPER_ADMIN;
  }
}

export async function fetchRvskAdminHome(): Promise<RvskAdminHomeData> {
  try {
    const response = await apiClient.get<RvskAdminHomeData>('/home/rvsk-admin');
    return response.data;
  } catch {
    console.warn('fetchRvskAdminHome: API unavailable, using dummy data');
    return DUMMY_RVSK_ADMIN;
  }
}

export async function fetchStateAdminHome(): Promise<StateAdminHomeData> {
  try {
    const response = await apiClient.get<StateAdminHomeData>('/home/state-admin');
    return response.data;
  } catch {
    console.warn('fetchStateAdminHome: API unavailable, using dummy data');
    return DUMMY_STATE_ADMIN;
  }
}

export async function fetchSpocHome(): Promise<SpocHomeData> {
  try {
    const response = await apiClient.get<SpocHomeData>('/home/spoc');
    return response.data;
  } catch {
    console.warn('fetchSpocHome: API unavailable, using dummy data');
    return DUMMY_SPOC;
  }
}

export async function fetchGalleryImages(page = 0, size = 20): Promise<GalleryImage[]> {
  try {
    const response = await apiClient.get<GalleryImage[]>('/gallery/images', {
      params: { page, size },
    });
    return response.data;
  } catch {
    console.warn('fetchGalleryImages: API unavailable, using dummy data');
    return DUMMY_GALLERY;
  }
}

export async function uploadGalleryImage(file: File, caption: string): Promise<GalleryImage> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('caption', caption);

  const response = await apiClient.post<GalleryImage>('/gallery/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function deleteGalleryImage(id: string): Promise<void> {
  await apiClient.delete(`/gallery/images/${id}`);
}
