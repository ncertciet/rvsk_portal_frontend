import apiClient from '../../../services/apiClient';

/**
 * Typed API layer for the Attendance Dashboard, matching the redesigned rvsk6a
 * backend contract:
 *   - Filter cascade keyed on numeric ..._KEY (aligned with JWT scope claims).
 *   - camelCase response fields ({ stateKey, stateId, stateName }, ...).
 *   - Standardized envelope: { success, timestamp, meta?, data }.
 *   - Config-driven scope locking via GET /attendance/filters/config.
 */

// ── Envelope ────────────────────────────────────────────────────────────────
export interface ResponseMeta {
  asOfDate?: string;
  scopeLevel?: 'national' | 'state' | 'district';
  cached?: boolean;
  reportingCoverage?: { expected: number; reported: number };
  empty?: boolean;
}
export interface SuccessEnvelope<T> {
  success: true;
  timestamp: string;
  meta?: ResponseMeta;
  data: T;
}

// ── Master option rows ────────────────────────────────────────────────────────
export interface StateOption {
  stateKey: string;
  stateId: string;
  stateName: string;
}
export interface DistrictOption {
  districtKey: string;
  districtId: string;
  districtName: string;
}
export interface BlockOption {
  blockKey: string;
  blockId: string;
  blockName: string;
}
export interface ClusterOption {
  clusterKey: string;
  clusterId: string;
  clusterName: string;
}
export interface SchoolOption {
  udiseCode: string;
  schoolName: string;
}

export interface FilterConfig {
  dashboardId: string;
  levels: string[];
  required: string[];
  searchable: string[];
  defaultScope: { level: string; value: string | null };
  /** Hierarchy levels hidden/locked for this user (e.g. ['state'] for a State admin). */
  lockedLevels: string[];
}

// ── Filter endpoints ──────────────────────────────────────────────────────────
const unwrap = <T>(p: Promise<{ data: SuccessEnvelope<T> }>): Promise<T> =>
  p.then((res) => res.data.data);

export const attendanceApi = {
  getConfig: (): Promise<FilterConfig> =>
    unwrap<FilterConfig>(apiClient.get('/attendance/filters/config')),

  getStates: (): Promise<StateOption[]> =>
    unwrap<StateOption[]>(apiClient.get('/attendance/filters/states')),

  getDistricts: (stateKey: string): Promise<DistrictOption[]> =>
    unwrap<DistrictOption[]>(
      apiClient.get('/attendance/filters/districts', { params: { stateKey } }),
    ),

  getBlocks: (districtKey: string): Promise<BlockOption[]> =>
    unwrap<BlockOption[]>(
      apiClient.get('/attendance/filters/blocks', { params: { districtKey } }),
    ),

  getClusters: (blockKey: string): Promise<ClusterOption[]> =>
    unwrap<ClusterOption[]>(
      apiClient.get('/attendance/filters/clusters', { params: { blockKey } }),
    ),

  /** Schools filterable by any provided level key; `search` optional (server-side). */
  getSchools: (params: {
    clusterKey?: string;
    blockKey?: string;
    districtKey?: string;
    stateKey?: string;
    search?: string;
  }): Promise<SchoolOption[]> =>
    unwrap<SchoolOption[]>(apiClient.get('/attendance/filters/schools', { params })),

  // ── Page 1 — Attendance summary (design §15.1) ──────────────────────────────
  getAttendancePage: (params: AttendancePageParams): Promise<AttendancePageEnvelope> =>
    apiClient
      .get<SuccessEnvelope<AttendancePageData | null>>('/attendance/page/attendance', { params })
      .then((res) => res.data),

  // ── Page 2 — Trends (design §15.2) ──────────────────────────────────────────
  getTrend: (params: TrendParams): Promise<TrendEnvelope> =>
    apiClient
      .get<SuccessEnvelope<TrendData | null>>('/attendance/trend', { params })
      .then((res) => res.data),
};

// ── Page 1 request + response types (mirror backend interfaces/dashboard.ts) ────
export interface AttendancePageParams {
  date?: string;
  stateKey?: string;
  districtKey?: string;
  blockKey?: string;
  clusterKey?: string;
  udiseCode?: string;
}

export interface CoveragePair {
  reported: number;
  expected: number;
}
export interface HeadcountTriple {
  schools: number;
  teachers: number;
  students: number;
}
export interface AttendancePageData {
  asOfDate: string;
  scopeLevel: 'national' | 'state' | 'district';
  integrationCoverage: {
    states: CoveragePair;
    districts: CoveragePair;
    blocks: CoveragePair;
  };
  integrationStatus: {
    udiseRef: ({ grain: 'NATIONAL' | 'STATE' | null } & HeadcountTriple) | null;
    rvskMaster: HeadcountTriple;
    onboarded: HeadcountTriple;
    yetToOnboard: HeadcountTriple;
  };
  schoolIntegration: { onboarded: number; reportingTeacher: number; reportingStudent: number };
  teacher: {
    totalInSchools: number;
    totalReported: number;
    reportedPct: number;
    present: number;
    absent: number;
    onDuty: number;
    presentPct: number;
    absentPct: number;
    onDutyPct: number;
  };
  student: {
    totalInSchools: number;
    totalReported: number;
    reportedPct: number;
    present: number;
    absent: number;
    presentPct: number;
    absentPct: number;
  };
}
export type AttendancePageEnvelope = SuccessEnvelope<AttendancePageData | null>;

// ── Page 2 request + response types ─────────────────────────────────────────────
export type TrendRange = '30D' | '3M' | '6M';
export type TrendDimension = 'overall' | 'class' | 'gender' | 'category';

export interface TrendParams {
  range?: TrendRange;
  fromDate?: string;
  toDate?: string;
  dimension?: TrendDimension;
  stateKey?: string;
  districtKey?: string;
  blockKey?: string;
  clusterKey?: string;
  udiseCode?: string;
}

/** One reported (participation %) point: teacher & student on the same period. */
export interface ReportedPoint {
  period: string;
  teacher: number;
  student: number;
}
export interface OverallPresentPoint {
  period: string;
  teacher: number;
  student: number;
}
export interface ValuePoint {
  period: string;
  value: number;
}
export interface TrendData {
  granularity: 'daily' | 'weekly';
  range: string;
  reported: ReportedPoint[];
  present: {
    overall?: OverallPresentPoint[];
    byClass?: Record<string, ValuePoint[]>;
    byGender?: Record<'male' | 'female' | 'others', ValuePoint[]>;
    byCategory?: Record<'general' | 'sc' | 'st' | 'obc', ValuePoint[]>;
  };
}
export type TrendEnvelope = SuccessEnvelope<TrendData | null>;
