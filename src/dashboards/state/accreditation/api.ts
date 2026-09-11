import apiClient from '../../../services/apiClient';

const BASE = '/accreditation/dashboard';

/**
 * API client for the Accreditation KPI Dashboard.
 * All endpoints target the rvsk6a NestJS app at /api/v1/accreditation/dashboard.
 * Parameters:
 *  - year: Academic year in "YYYY-YY" format (e.g. "2025-26")
 *  - state: Optional state code; defaults to 'ALL' for national-level aggregation
 */
export const accreditationApi = {
  /** Section 01: Programme & Framework — KPI 1, 2, 3 */
  getProgrammeFramework: (year: string, state?: string) =>
    apiClient.get(`${BASE}/programme-framework`, {
      params: { academicYear: year, stateCode: state || 'ALL' },
    }),

  /** Section 02: Coverage & Reach — KPI 4, 5, 6 */
  getCoverageReach: (year: string, state?: string) =>
    apiClient.get(`${BASE}/coverage-reach`, {
      params: { academicYear: year, stateCode: state || 'ALL' },
    }),

  /** Section 03: Process Quality & Operations — KPI 7, 8, 9, 10 */
  getProcessOperations: (year: string, state?: string) =>
    apiClient.get(`${BASE}/process-operations`, {
      params: { academicYear: year, stateCode: state || 'ALL' },
    }),

  /** Section 03 (sub): Domain Components — KPI 11, 12 */
  getDomainComponents: (year: string, state?: string) =>
    apiClient.get(`${BASE}/process-operations/domain-components`, {
      params: { academicYear: year, stateCode: state || 'ALL' },
    }),

  /** Section 04: Data Quality & Compliance — KPI 13, 14 */
  getDataQuality: (year: string, state?: string) =>
    apiClient.get(`${BASE}/data-quality`, {
      params: { academicYear: year, stateCode: state || 'ALL' },
    }),

  /** Section 05: Impact & Outcomes — KPI 15, 16, 17 */
  getImpactOutcomes: (year: string, state?: string) =>
    apiClient.get(`${BASE}/impact-outcomes`, {
      params: { academicYear: year, stateCode: state || 'ALL' },
    }),

  /** Single KPI lookup by number (1–17) */
  getKpiByNumber: (kpiNo: number, year: string, state?: string) =>
    apiClient.get(`${BASE}/kpi/${kpiNo}`, {
      params: { academicYear: year, stateCode: state || 'ALL' },
    }),

  /** Metadata: list of available states/UTs */
  getMetaStates: () => apiClient.get(`${BASE}/meta/states`),

  /** Metadata: list of academic years with current flag */
  getMetaYears: () => apiClient.get(`${BASE}/meta/academic-years`),

  /** Admin: trigger materialized view refresh (POST) */
  refreshViews: () => apiClient.post(`${BASE}/refresh`),
};
