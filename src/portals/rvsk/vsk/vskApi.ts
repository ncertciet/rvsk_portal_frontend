import apiClient from '../../../services/apiClient';

// ═══════════════════════════════════════════════════════════════════════════════
// TypeScript Interfaces (matching backend DTOs — v2 Redesign)
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Profile ──────────────────────────────────────────────────────────────────

export interface VskProfileDto {
  id?: string;
  stateCode?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  pincode?: string;
  facilitatedBy?: string;
  otherSchemeName?: string;
  step1Status?: string;
  step2Status?: string;
  step3Status?: string;
  step4Status?: string;
  submissionStatus?: string;
  declarationCertified?: number;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Officers ─────────────────────────────────────────────────────────────────

export interface OfficerHistoryDto {
  id?: string;
  stateCode?: string;
  officerRole: string;
  name: string;
  designation?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  startDate?: string;
  endDate?: string;
  isActive?: number;
}

// ─── Committee Members ────────────────────────────────────────────────────────

export interface CommitteeMemberDto {
  id?: string;
  stateCode?: string;
  name: string;
  designation?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  isActive?: number;
}

// ─── Infrastructure Hardware ──────────────────────────────────────────────────

export interface VskInfraDto {
  id?: string;
  stateCode?: string;
  roomLength?: number | null;
  roomWidth?: number | null;
  roomHeight?: number | null;
  roomImageUrl?: string;
  screenLength?: number | null;
  screenHeight?: number | null;
  screenImageUrl?: string;
  workstationCount?: number | null;
  workstationImageUrl?: string;
}

// ─── Software ─────────────────────────────────────────────────────────────────

export interface SoftwareItemDto {
  id?: string;
  softwareName?: string;
  customSoftwareName?: string;
  softwareType?: string;
}

export interface VskSoftwareDto {
  id?: string;
  stateCode?: string;
  starterPack?: number;
  serverType?: string;
  items?: SoftwareItemDto[];
}

// ─── PMU ──────────────────────────────────────────────────────────────────────

export interface PmuRoleDto {
  id?: string;
  roleName?: string;
  customRoleName?: string;
  noOfMembers?: number;
}

export interface VskPmuDto {
  id?: string;
  stateCode?: string;
  pmuTeamType?: string;
  totalTeamMembers?: number;
  roles?: PmuRoleDto[];
}

// ─── Wizard Flow ──────────────────────────────────────────────────────────────

export interface AutoSaveRequest {
  step: number;
  data: Record<string, unknown>;
}

export interface StepSaveRequest {
  step: number;
  data: Record<string, unknown>;
}

export interface StepSaveResponse {
  completedStep: number;
  nextStep: number;
  stepStatus: string;
}

// ─── Review & Submit ──────────────────────────────────────────────────────────

export interface ReviewSummaryDto {
  profile: VskProfileDto | null;
  officers: OfficerHistoryDto[];
  committeeMembers: CommitteeMemberDto[];
  infra: VskInfraDto | null;
  software: VskSoftwareDto | null;
  pmu: VskPmuDto | null;
  allStepsComplete: boolean;
}

// ─── Image Upload ─────────────────────────────────────────────────────────────

export interface ImageUploadResponse {
  imageUrl: string;
  imageType: string;
}

// ─── Admin DTOs (unchanged) ───────────────────────────────────────────────────

export interface DashboardKpiDto {
  totalStates: number;
  statesSubmitted: number;
  statesDraft: number;
  statesPending: number;
  completionPercentage: number;
  statesWithProfile: number;
  statesWithInfra: number;
  statesWithSoftware: number;
  statesWithPmu: number;
  statesWithOfficers: number;
}

export interface StateVskSummaryDto {
  stateCode: string;
  stateName: string;
  // New v2 fields
  step1Status?: string;
  step2Status?: string;
  step3Status?: string;
  step4Status?: string;
  submissionStatus?: string;
  completedSteps?: number;
  totalSteps?: number;
  // Legacy v1 fields (backward-compat — admin dashboard still uses these)
  hasProfile?: boolean;
  hasInfra?: boolean;
  hasSoftware?: boolean;
  hasPmu?: boolean;
  hasSecretary?: boolean;
  completedSections?: number;
  totalSections?: number;
}

export interface StateFullDetailsDto {
  stateCode: string;
  stateName: string;
  profile: VskProfileDto | null;
  officers?: OfficerHistoryDto[];
  committeeMembers?: CommitteeMemberDto[];
  infra: VskInfraDto | null;
  software: VskSoftwareDto | null;
  pmu: VskPmuDto | null;
  // Legacy v1 fields (backward-compat — admin dashboard still uses these)
  currentSecretary?: SecretaryDetailsDto | null;
  secretaryHistory?: SecretaryDetailsDto[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// API Functions — Profile
// ═══════════════════════════════════════════════════════════════════════════════

export async function fetchVskProfile(): Promise<VskProfileDto | null> {
  try {
    const res = await apiClient.get<VskProfileDto>('/vsk/profile');
    if (res.status === 204 || !res.data) return null;
    return res.data;
  } catch (err: unknown) {
    if (isAxios404(err)) return null;
    throw err;
  }
}

export async function createProfile(dto: VskProfileDto): Promise<VskProfileDto> {
  const res = await apiClient.post<VskProfileDto>('/vsk/profile', dto);
  return res.data;
}

export async function updateProfile(dto: VskProfileDto): Promise<VskProfileDto> {
  const res = await apiClient.put<VskProfileDto>('/vsk/profile', dto);
  return res.data;
}

// ═══════════════════════════════════════════════════════════════════════════════
// API Functions — Wizard Flow
// ═══════════════════════════════════════════════════════════════════════════════

export async function autoSave(request: AutoSaveRequest): Promise<void> {
  await apiClient.put('/vsk/auto-save', request);
}

export async function saveDraft(request: StepSaveRequest): Promise<void> {
  await apiClient.put('/vsk/save-draft', request);
}

export async function saveAndNext(request: StepSaveRequest): Promise<StepSaveResponse> {
  const res = await apiClient.put<StepSaveResponse>('/vsk/save-next', request);
  return res.data;
}

// ═══════════════════════════════════════════════════════════════════════════════
// API Functions — Officers
// ═══════════════════════════════════════════════════════════════════════════════

export async function fetchActiveOfficers(): Promise<OfficerHistoryDto[]> {
  const res = await apiClient.get<OfficerHistoryDto[]>('/vsk/officers');
  return res.data ?? [];
}

export async function fetchOfficerHistory(role: string): Promise<OfficerHistoryDto[]> {
  const res = await apiClient.get<OfficerHistoryDto[]>('/vsk/officers/history', {
    params: { role },
  });
  return res.data ?? [];
}

export async function createOfficer(dto: OfficerHistoryDto): Promise<OfficerHistoryDto> {
  const res = await apiClient.post<OfficerHistoryDto>('/vsk/officers', dto);
  return res.data;
}

export async function appointNewOfficer(dto: OfficerHistoryDto): Promise<OfficerHistoryDto> {
  const res = await apiClient.post<OfficerHistoryDto>('/vsk/officers/appoint-new', dto);
  return res.data;
}

export async function typoCorrection(id: string, dto: OfficerHistoryDto): Promise<OfficerHistoryDto> {
  const res = await apiClient.put<OfficerHistoryDto>(`/vsk/officers/${id}/typo-correction`, dto);
  return res.data;
}

// ═══════════════════════════════════════════════════════════════════════════════
// API Functions — Committee Members
// ═══════════════════════════════════════════════════════════════════════════════

export async function fetchCommitteeMembers(): Promise<CommitteeMemberDto[]> {
  const res = await apiClient.get<CommitteeMemberDto[]>('/vsk/committee-members');
  return res.data ?? [];
}

export async function addCommitteeMember(dto: CommitteeMemberDto): Promise<CommitteeMemberDto> {
  const res = await apiClient.post<CommitteeMemberDto>('/vsk/committee-members', dto);
  return res.data;
}

export async function updateCommitteeMember(id: string, dto: CommitteeMemberDto): Promise<CommitteeMemberDto> {
  const res = await apiClient.put<CommitteeMemberDto>(`/vsk/committee-members/${id}`, dto);
  return res.data;
}

export async function removeCommitteeMember(id: string): Promise<void> {
  await apiClient.delete(`/vsk/committee-members/${id}`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// API Functions — Infrastructure Hardware
// ═══════════════════════════════════════════════════════════════════════════════

export async function fetchInfra(): Promise<VskInfraDto | null> {
  try {
    const res = await apiClient.get<VskInfraDto>('/vsk/infra');
    if (res.status === 204 || !res.data) return null;
    return res.data;
  } catch (err: unknown) {
    if (isAxios404(err)) return null;
    throw err;
  }
}

export async function saveInfra(dto: VskInfraDto, isCreate: boolean): Promise<VskInfraDto> {
  const res = isCreate
    ? await apiClient.post<VskInfraDto>('/vsk/infra', dto)
    : await apiClient.put<VskInfraDto>('/vsk/infra', dto);
  return res.data;
}

export async function uploadInfraImage(imageType: string, file: File): Promise<ImageUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiClient.post<ImageUploadResponse>('/vsk/infra/upload-image', formData, {
    headers: { 'Content-Type': undefined },
    params: { imageType },
  });
  return res.data;
}

// ═══════════════════════════════════════════════════════════════════════════════
// API Functions — Software (Header + Items)
// ═══════════════════════════════════════════════════════════════════════════════

export async function fetchSoftware(): Promise<VskSoftwareDto | null> {
  try {
    const res = await apiClient.get<VskSoftwareDto>('/vsk/software');
    if (res.status === 204 || !res.data) return null;
    return res.data;
  } catch (err: unknown) {
    if (isAxios404(err)) return null;
    throw err;
  }
}

export async function saveSoftware(dto: VskSoftwareDto, isCreate: boolean): Promise<VskSoftwareDto> {
  const res = isCreate
    ? await apiClient.post<VskSoftwareDto>('/vsk/software', dto)
    : await apiClient.put<VskSoftwareDto>('/vsk/software', dto);
  return res.data;
}

// ═══════════════════════════════════════════════════════════════════════════════
// API Functions — PMU (Header + Roles)
// ═══════════════════════════════════════════════════════════════════════════════

export async function fetchPmu(): Promise<VskPmuDto | null> {
  try {
    const res = await apiClient.get<VskPmuDto>('/vsk/pmu');
    if (res.status === 204 || !res.data) return null;
    return res.data;
  } catch (err: unknown) {
    if (isAxios404(err)) return null;
    throw err;
  }
}

export async function savePmu(dto: VskPmuDto, isCreate: boolean): Promise<VskPmuDto> {
  const res = isCreate
    ? await apiClient.post<VskPmuDto>('/vsk/pmu', dto)
    : await apiClient.put<VskPmuDto>('/vsk/pmu', dto);
  return res.data;
}

// ═══════════════════════════════════════════════════════════════════════════════
// API Functions — Review & Submit (Step 5)
// ═══════════════════════════════════════════════════════════════════════════════

export async function fetchReviewSummary(): Promise<ReviewSummaryDto> {
  const res = await apiClient.get<ReviewSummaryDto>('/vsk/review-summary');
  return res.data;
}

export async function downloadReviewPdf(): Promise<Blob> {
  const res = await apiClient.get('/vsk/review-pdf', { responseType: 'blob' });
  return res.data as Blob;
}

export async function submitProfile(): Promise<void> {
  await apiClient.post('/vsk/submit');
}

// ═══════════════════════════════════════════════════════════════════════════════
// API Functions — Admin (unchanged endpoints, updated response shapes)
// ═══════════════════════════════════════════════════════════════════════════════

export async function fetchAdminDashboard(): Promise<DashboardKpiDto> {
  const res = await apiClient.get<DashboardKpiDto>('/vsk/admin/dashboard');
  return res.data;
}

export async function fetchAdminStates(
  page: number,
  size: number,
  filtersOrSearch?: string | {
    stateCode?: string;
    region?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
  },
): Promise<{ content: StateVskSummaryDto[]; totalElements: number }> {
  const params: Record<string, string | number> = { page, size };
  if (typeof filtersOrSearch === 'string') {
    // Backward-compat: single search string
    params.search = filtersOrSearch;
  } else if (filtersOrSearch) {
    if (filtersOrSearch.stateCode) params.stateCode = filtersOrSearch.stateCode;
    if (filtersOrSearch.region) params.region = filtersOrSearch.region;
    if (filtersOrSearch.status) params.status = filtersOrSearch.status;
    if (filtersOrSearch.fromDate) params.fromDate = filtersOrSearch.fromDate;
    if (filtersOrSearch.toDate) params.toDate = filtersOrSearch.toDate;
  }
  const res = await apiClient.get<{ content: StateVskSummaryDto[]; totalElements: number }>(
    '/vsk/admin/states',
    { params },
  );
  return res.data;
}

export async function fetchStateFullDetails(stateCode: string): Promise<StateFullDetailsDto> {
  const res = await apiClient.get<StateFullDetailsDto>(`/vsk/admin/states/${stateCode}`);
  return res.data;
}

export async function exportVskData(
  format: string = 'xlsx',
  filters?: { stateCode?: string; region?: string; status?: string },
): Promise<Blob> {
  const params: Record<string, string> = { format };
  if (filters?.stateCode) params.stateCode = filters.stateCode;
  if (filters?.region) params.region = filters.region;
  if (filters?.status) params.status = filters.status;
  const res = await apiClient.get('/vsk/admin/export', { params, responseType: 'blob' });
  return res.data as Blob;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Deprecated (v1 backward-compat — remove once SecretaryHistoryDialog is deleted)
// ═══════════════════════════════════════════════════════════════════════════════

/** @deprecated Use OfficerHistoryDto instead */
export interface SecretaryDetailsDto {
  id?: string;
  stateCode?: string;
  secretaryName: string;
  secretaryDesignation: string;
  secretaryEmail: string;
  secretaryMobile: string;
  versionNo?: number;
  isCurrent?: number;
  effectiveFrom?: string;
  effectiveTo?: string;
  remarks: string;
}

/** @deprecated Use fetchOfficerHistory('SECRETARY') instead */
export async function fetchSecretaryHistory(): Promise<SecretaryDetailsDto[]> {
  // Bridge to new API: fetch officer history for SECRETARY and map to legacy shape
  try {
    const officers = await fetchOfficerHistory('SECRETARY');
    return officers.map((o, idx) => ({
      id: o.id,
      stateCode: o.stateCode,
      secretaryName: o.name,
      secretaryDesignation: o.designation ?? '',
      secretaryEmail: o.email ?? '',
      secretaryMobile: o.phone ?? '',
      versionNo: officers.length - idx,
      isCurrent: o.isActive,
      effectiveFrom: o.startDate,
      effectiveTo: o.endDate,
      remarks: '',
    }));
  } catch {
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════════

function isAxios404(err: unknown): boolean {
  return !!(
    err &&
    typeof err === 'object' &&
    'response' in err &&
    (err as { response?: { status?: number } }).response?.status === 404
  );
}
