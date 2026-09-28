/**
 * Attendance Dashboard semantic colour tokens (design.md §7.7).
 * Each token carries ONE meaning across the whole dashboard — data colours
 * never double as UI chrome. "On-Duty" is a first-class teacher state with its
 * own token, distinct from the chrome purple.
 */
export const ATT_COLORS = {
  // Semantic data colours
  present: '#8AC53E', // green  — Present
  absent: '#F18F7A', // coral  — Absent
  onDuty: '#6C5CE7', // violet — On-Duty (teacher third state; NOT "Outside the School")
  school: '#14B8A6', // teal   — school integration/onboarding
  student: '#F59E0B', // orange — student reporting/onboarding
  teacher: '#0186B3', // blue   — teacher/reference
  reference: '#70BBFF', // light blue — baseline / yet-to-onboard
  neutral: '#ECF0F3', // grey   — remaining ring/donut segments

  // Chrome (UI furniture — never encodes data)
  chrome: '#A07AF0', // purple — headers, gauge arcs, active nav
  canvas: '#F0F7FF',
  surface: '#FFFFFF',
} as const;

/** Indian number formatting (e.g. 14,06,29,302). */
export function formatIndian(n: number): string {
  const s = Math.round(n).toString();
  if (s.length <= 3) return s;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3);
  return rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3;
}
