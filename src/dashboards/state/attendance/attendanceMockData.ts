/**
 * Mock Page-1 (Attendance) data — matches the design.md §7.3 response `data`
 * shape so the frontend can be built/tested before the backend/ADW exist
 * (Phase-1 frontend-first). Swap for the live API in one place (attendanceApi)
 * once the MVs land. Numbers mirror the Screen Inspection reference.
 */

export interface AttendancePageData {
  asOfDate: string;
  scopeLevel: 'national' | 'state' | 'district';
  integrationCoverage: {
    states: { reported: number; expected: number };
    districts: { reported: number; expected: number };
    blocks: { reported: number; expected: number };
  };
  integrationStatus: {
    udiseRef: { grain: 'NATIONAL' | 'STATE' | null; schools: number; teachers: number; students: number } | null;
    rvskMaster: { schools: number; teachers: number; students: number };
    onboarded: { schools: number; teachers: number; students: number };
    yetToOnboard: { schools: number; teachers: number; students: number };
  };
  schoolIntegration: { onboarded: number; reportingTeacher: number; reportingStudent: number };
  teacher: {
    totalInSchools: number; // headcount (RVSK master)
    totalReported: number; // attendance reported (marked)
    reportedPct: number; // reported / totalInSchools
    present: number;
    absent: number;
    onDuty: number; // "Outside the School" in the reference
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

/** Per-state attendance reporting (for the map + State/UT-wise bar chart). */
export interface StateAttendanceRow {
  state: string;
  reportedPct: number; // 0-100 reported coverage
}

export const mockStateAttendanceTeachers: StateAttendanceRow[] = [
  { state: 'Arunachal Pradesh', reportedPct: 99 },
  { state: 'Delhi', reportedPct: 98 },
  { state: 'Madhya Pradesh', reportedPct: 97 },
  { state: 'Uttarakhand', reportedPct: 96 },
  { state: 'Bihar', reportedPct: 95 },
  { state: 'Assam', reportedPct: 94 },
  { state: 'Andaman And Nicobar', reportedPct: 92 },
  { state: 'Puducherry', reportedPct: 85 },
  { state: 'Gujarat', reportedPct: 82 },
  { state: 'DNH & DD', reportedPct: 80 },
  { state: 'Himachal Pradesh', reportedPct: 78 },
  { state: 'Mizoram', reportedPct: 74 },
  { state: 'Andhra Pradesh', reportedPct: 70 },
  { state: 'Tripura', reportedPct: 62 },
  { state: 'Nagaland', reportedPct: 58 },
  { state: 'Tamil Nadu', reportedPct: 55 },
  { state: 'Chandigarh', reportedPct: 30 },
  { state: 'Punjab', reportedPct: 22 },
  { state: 'Ladakh', reportedPct: 18 },
  { state: 'Sikkim', reportedPct: 14 },
  { state: 'Odisha', reportedPct: 8 },
  { state: 'Maharashtra', reportedPct: 3 },
  { state: 'Chhattisgarh', reportedPct: 2 },
  { state: 'Haryana', reportedPct: 1 },
  { state: 'Goa', reportedPct: 1 },
  { state: 'Jammu & Kashmir', reportedPct: 0 },
  { state: 'Jharkhand', reportedPct: 0 },
  { state: 'Karnataka', reportedPct: 0 },
  { state: 'Kerala', reportedPct: 0 },
  { state: 'Lakshadweep', reportedPct: 0 },
  { state: 'Manipur', reportedPct: 0 },
];

export const mockStateAttendanceStudents: StateAttendanceRow[] = mockStateAttendanceTeachers.map((r) => ({
  state: r.state,
  reportedPct: Math.max(0, Math.min(100, Math.round(r.reportedPct * 0.85))),
}));

/** Daily trend point: date label + teacher/student %. */
export interface TrendPoint {
  date: string;
  teacher: number;
  student: number;
}

export interface TrendsData {
  /** Reported (participation) % trend — schools sending data. */
  reported: TrendPoint[];
  /** Present % trend — of those marked, how many present. */
  present: TrendPoint[];
}

// ~30 daily points ending 23 Sep, matching the reference shape.
const TREND_DATES = [
  '26 Aug', '27 Aug', '28 Aug', '29 Aug', '31 Aug', '01 Sep', '02 Sep', '03 Sep',
  '04 Sep', '05 Sep', '07 Sep', '08 Sep', '09 Sep', '10 Sep', '11 Sep', '12 Sep',
  '14 Sep', '15 Sep', '16 Sep', '17 Sep', '18 Sep', '19 Sep', '21 Sep', '22 Sep', '23 Sep',
];

const REPORTED_TEACHER = [25, 34, 28, 22, 40, 42, 43, 37, 37, 39, 48, 55, 40, 39, 47, 52, 53, 51, 46, 45, 46, 44, 43, 42, 40];
const REPORTED_STUDENT = [12, 26, 17, 27, 31, 31, 30, 21, 23, 22, 37, 36, 23, 21, 25, 31, 32, 25, 22, 24, 23, 22, 21, 21, 21];
const PRESENT_TEACHER = [7, 64, 32, 53, 65, 66, 67, 62, 41, 32, 67, 73, 69, 63, 69, 59, 43, 22, 54, 61, 60, 53, 63, 62, 55];
const PRESENT_STUDENT = [6, 62, 56, 56, 69, 70, 67, 60, 50, 55, 62, 66, 61, 61, 67, 61, 55, 28, 58, 60, 55, 61, 64, 62, 70];

export const mockTrends: TrendsData = {
  reported: TREND_DATES.map((date, i) => ({ date, teacher: REPORTED_TEACHER[i], student: REPORTED_STUDENT[i] })),
  present: TREND_DATES.map((date, i) => ({ date, teacher: PRESENT_TEACHER[i], student: PRESENT_STUDENT[i] })),
};

/** Dates shared by all dimensioned Present-trend series. */
export const TREND_DATE_LABELS = TREND_DATES;

/**
 * Dimensioned "Attendance Present" trends for the Class / Gender / Category tabs.
 * Each series is a daily % array aligned to TREND_DATE_LABELS. Mock: derived by
 * perturbing the overall student-present baseline so lines are visually distinct.
 */
function series(base: number[], seed: number): number[] {
  return base.map((v, i) => {
    const delta = ((Math.sin((i + seed) * 1.3) * 8) + (seed % 5) * 2);
    return Math.max(0, Math.min(100, Math.round(v + delta)));
  });
}

export const CLASS_KEYS = Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`);
export const GENDER_KEYS = ['Male', 'Female', 'Others'] as const;
export const CATEGORY_KEYS = ['General', 'SC', 'ST', 'OBC'] as const;

export const mockPresentByClass: Record<string, number[]> = Object.fromEntries(
  CLASS_KEYS.map((c, idx) => [c, series(PRESENT_STUDENT, idx + 1)]),
);
export const mockPresentByGender: Record<string, number[]> = {
  Male: series(PRESENT_STUDENT, 2),
  Female: series(PRESENT_STUDENT, 5),
  Others: series(PRESENT_STUDENT, 9),
};
export const mockPresentByCategory: Record<string, number[]> = {
  General: series(PRESENT_STUDENT, 1),
  SC: series(PRESENT_STUDENT, 4),
  ST: series(PRESENT_STUDENT, 7),
  OBC: series(PRESENT_STUDENT, 11),
};

export const mockAttendancePage: AttendancePageData = {
  asOfDate: '2026-09-23',
  scopeLevel: 'national',
  integrationCoverage: {
    states: { reported: 34, expected: 37 },
    districts: { reported: 740, expected: 742 },
    blocks: { reported: 6382, expected: 7100 },
  },
  integrationStatus: {
    udiseRef: { grain: 'NATIONAL', schools: 1466682, teachers: 10273020, students: 247219766 },
    rvskMaster: { schools: 1154278, teachers: 5134600, students: 140629302 },
    onboarded: { schools: 1154278, teachers: 5134600, students: 140629302 },
    yetToOnboard: { schools: 203473, teachers: 4261531, students: 82807343 },
  },
  schoolIntegration: {
    onboarded: 1154278,
    reportingTeacher: 394759,
    reportingStudent: 325319,
  },
  teacher: {
    totalInSchools: 5134600,
    totalReported: 2067600,
    reportedPct: 40.27,
    present: 1359361,
    onDuty: 254202,
    absent: 454037,
    presentPct: 65.75,
    absentPct: 21.96,
    onDutyPct: 12.29,
  },
  student: {
    totalInSchools: 140629302,
    totalReported: 29897036,
    reportedPct: 21.26,
    present: 22372784,
    absent: 7524252,
    presentPct: 74.83,
    absentPct: 25.17,
  },
};
