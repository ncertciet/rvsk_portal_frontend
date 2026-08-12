# Old Hardcoded Menu Reference (Removed from PortalLayout.tsx)

This file preserves the old hardcoded sidebar menu structure for reference.
It was replaced by the dynamic RBAC V2 menu system.

## Old rvskNav Array

```typescript
const attendanceChildren: NavChild[] = [
  { label: 'Summary', path: '/rvsk/dashboard/attendance/summary', module: 'A1' },
  { label: 'Detailed Data', path: '/rvsk/dashboard/attendance/detailed', module: 'A1' },
  { label: 'Trends', path: '/rvsk/dashboard/attendance/trends', module: 'A1' },
  { label: 'Report View', path: '/rvsk/dashboard/attendance/report', module: 'A1' },
  { label: 'Table View', path: '/rvsk/dashboard/attendance/table', module: 'A1' },
  { label: 'School Directory', path: '/rvsk/dashboard/attendance/school', module: 'A1' },
  { label: 'Teacher Registry', path: '/rvsk/dashboard/attendance/teacher', module: 'A1' },
  { label: 'Student Registry', path: '/rvsk/dashboard/attendance/student', module: 'A1' },
  { label: 'Monthly Details', path: '/rvsk/dashboard/attendance/monthly', module: 'A1' },
  { label: 'Attendance Analysis', path: '/rvsk/dashboard/attendance/analysis', module: 'A1' },
];

const assessmentChildren: NavChild[] = [
  { label: 'Executive Overview', path: '/rvsk/dashboard/assessment/overview', module: 'A2' },
  { label: 'Student Demographics', path: '/rvsk/dashboard/assessment/demographics', module: 'A2' },
  { label: 'Subject & Curriculum', path: '/rvsk/dashboard/assessment/subjects', module: 'A2' },
  { label: 'Trends & Progression', path: '/rvsk/dashboard/assessment/trends', module: 'A2' },
  { label: 'Rankings', path: '/rvsk/dashboard/assessment/rankings', module: 'A2' },
  { label: 'Data Quality', path: '/rvsk/dashboard/assessment/quality', module: 'A2' },
];

const rvskNav: NavItem[] = [
  { label: 'Home', path: '/rvsk/home' },
  { label: 'Dashboard', path: '/rvsk/dashboard' },
  { label: 'A1 - Attendance', path: '/rvsk/dashboard/attendance', module: 'A1', children: attendanceChildren },
  { label: 'A2 - Assessment', path: '/rvsk/dashboard/assessment', module: 'A2', children: assessmentChildren },
  { label: 'A3 - Administration', path: '/rvsk/dashboard/administration', module: 'A3' },
  { label: 'A4 - Accreditation', path: '/rvsk/dashboard/accreditation', module: 'A4' },
  { label: 'A5 - Adaptive Learning', path: '/rvsk/dashboard/adaptive-learning', module: 'A5' },
  { label: 'A6 - APAAR', path: '/rvsk/dashboard/apaar', module: 'A6' },
  --- divider ---
  { label: 'VSK Details', path: '/rvsk/vsk-details', visibleTo: ['Super_Admin', 'RVSK_Admin', 'State_Admin'] },
  { label: 'VSK Admin', path: '/rvsk/vsk-admin', visibleTo: ['Super_Admin', 'RVSK_Admin'] },
  { label: 'Form Builder', path: '/rvsk/form-builder', visibleTo: ['Super_Admin', 'RVSK_Admin'] },
  { label: 'My Forms', path: '/rvsk/my-forms', visibleTo: ['State_Admin'] },
  { label: 'User Permissions', path: '/rvsk/user-permissions', visibleTo: ['Super_Admin'] },
  { label: 'User Management', path: '/rvsk/admin/users', visibleTo: ['Super_Admin'] },
  { label: 'Module Admin', path: '/rvsk/admin/modules', visibleTo: ['Super_Admin'] },
  { label: 'Page Admin', path: '/rvsk/admin/pages', visibleTo: ['Super_Admin'] },
  { label: 'Permission Admin', path: '/rvsk/admin/permissions', visibleTo: ['Super_Admin'] },
  { label: 'Grievances', path: '/rvsk/grievances', visibleTo: ['Super_Admin', 'RVSK_Admin', 'RVSK_SPOC', 'State_Admin', 'District_Admin'] },
  { label: 'Grievance Categories', path: '/rvsk/grievances/categories', visibleTo: ['Super_Admin', 'RVSK_Admin'] },
];
```

## Role Visibility Rules (Old System)

- Super_Admin: sees everything
- RVSK_Admin: sees everything except User Permissions, User Mgmt, Module/Page/Permission Admin
- State_Admin: sees Home, Dashboard, Attendance, Assessment, Schemes, VSK Details, My Forms, Grievances
- District_Admin: sees Home, Dashboard, Attendance (limited), Assessment (limited), Grievances
- RVSK_SPOC: sees Grievances
- Viewer: sees dashboards only
