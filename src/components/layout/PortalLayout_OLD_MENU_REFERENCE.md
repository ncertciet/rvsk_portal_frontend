# Old Hardcoded Menu Reference (Saved for future reference)

This file preserves the old hardcoded navigation structure from PortalLayout.tsx
before it was replaced with the dynamic RBAC V2 menu system.

## Old rvskNav Array

```typescript
const attendanceChildren: NavChild[] = [
  { label: 'Summary', icon: <SummarizeIcon fontSize="small" />, path: '/rvsk/dashboard/attendance/summary', pageId: 'summary', module: 'A1' },
  { label: 'Detailed Data', icon: <TableChartIcon fontSize="small" />, path: '/rvsk/dashboard/attendance/detailed', pageId: 'detailed', module: 'A1' },
  { label: 'Trends', icon: <TrendingUpIcon fontSize="small" />, path: '/rvsk/dashboard/attendance/trends', pageId: 'trends', module: 'A1' },
  { label: 'Report View', icon: <DescriptionIcon fontSize="small" />, path: '/rvsk/dashboard/attendance/report', pageId: 'report', module: 'A1' },
  { label: 'Table View', icon: <ViewListIcon fontSize="small" />, path: '/rvsk/dashboard/attendance/table', pageId: 'table', module: 'A1' },
  { label: 'School Directory', icon: <LocationCityIcon fontSize="small" />, path: '/rvsk/dashboard/attendance/school', pageId: 'school', module: 'A1' },
  { label: 'Teacher Registry', icon: <GroupIcon fontSize="small" />, path: '/rvsk/dashboard/attendance/teacher', pageId: 'teacher', module: 'A1' },
  { label: 'Student Registry', icon: <PeopleIcon fontSize="small" />, path: '/rvsk/dashboard/attendance/student', pageId: 'student', module: 'A1' },
  { label: 'Monthly Details', icon: <CalendarMonthIcon fontSize="small" />, path: '/rvsk/dashboard/attendance/monthly', pageId: 'monthly', module: 'A1' },
  { label: 'Attendance Analysis', icon: <AnalyticsIcon fontSize="small" />, path: '/rvsk/dashboard/attendance/analysis', pageId: 'analysis', module: 'A1' },
];

const assessmentChildren: NavChild[] = [
  { label: 'Executive Overview', icon: <SummarizeIcon fontSize="small" />, path: '/rvsk/dashboard/assessment/overview', pageId: 'overview', module: 'A2' },
  { label: 'Student Demographics', icon: <PeopleIcon fontSize="small" />, path: '/rvsk/dashboard/assessment/demographics', pageId: 'demographics', module: 'A2' },
  { label: 'Subject & Curriculum', icon: <SchoolIcon fontSize="small" />, path: '/rvsk/dashboard/assessment/subjects', pageId: 'subjects', module: 'A2' },
  { label: 'Trends & Progression', icon: <TrendingUpIcon fontSize="small" />, path: '/rvsk/dashboard/assessment/trends', pageId: 'trends', module: 'A2' },
  { label: 'Rankings', icon: <AnalyticsIcon fontSize="small" />, path: '/rvsk/dashboard/assessment/rankings', pageId: 'rankings', module: 'A2' },
  { label: 'Data Quality', icon: <VerifiedIcon fontSize="small" />, path: '/rvsk/dashboard/assessment/quality', pageId: 'quality', module: 'A2' },
];

const rvskNav: NavItem[] = [
  { label: 'Home', icon: <HomeIcon />, path: '/rvsk/home' },
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/rvsk/dashboard' },
  { label: 'A1 - Attendance', icon: <SchoolIcon />, path: '/rvsk/dashboard/attendance', module: 'A1', children: attendanceChildren },
  { label: 'A2 - Assessment', icon: <AssessmentIcon />, path: '/rvsk/dashboard/assessment', module: 'A2', children: assessmentChildren },
  { label: 'A3 - Administration', icon: <AdminPanelSettingsIcon />, path: '/rvsk/dashboard/administration', module: 'A3' },
  { label: 'A4 - Accreditation', icon: <VerifiedIcon />, path: '/rvsk/dashboard/accreditation', module: 'A4' },
  { label: 'A5 - Adaptive Learning', icon: <PsychologyIcon />, path: '/rvsk/dashboard/adaptive-learning', module: 'A5' },
  { label: 'A6 - APAAR', icon: <BadgeIcon />, path: '/rvsk/dashboard/apaar', module: 'A6' },
  { label: '', icon: null, path: '', divider: true },
  { label: 'VSK Details', icon: <ApartmentIcon />, path: '/rvsk/vsk-details', visibleTo: ['Super_Admin', 'RVSK_Admin', 'State_Admin'] },
  { label: 'VSK Admin', icon: <ApartmentIcon />, path: '/rvsk/vsk-admin', visibleTo: ['Super_Admin', 'RVSK_Admin'] },
  { label: 'Form Builder', icon: <DynamicFormIcon />, path: '/rvsk/form-builder', visibleTo: ['Super_Admin', 'RVSK_Admin'] },
  { label: 'My Forms', icon: <DynamicFormIcon />, path: '/rvsk/my-forms', visibleTo: ['State_Admin'] },
  { label: 'User Permissions', icon: <AdminPanelSettingsIcon />, path: '/rvsk/user-permissions', visibleTo: ['Super_Admin'] },
  { label: 'User Management', icon: <PeopleIcon />, path: '/rvsk/admin/users', visibleTo: ['Super_Admin'] },
  { label: 'Module Admin', icon: <ViewModuleIcon />, path: '/rvsk/admin/modules', visibleTo: ['Super_Admin'] },
  { label: 'Page Admin', icon: <WebIcon />, path: '/rvsk/admin/pages', visibleTo: ['Super_Admin'] },
  { label: 'Permission Admin', icon: <SecurityIcon />, path: '/rvsk/admin/permissions', visibleTo: ['Super_Admin'] },
  { label: 'Grievances', icon: <DescriptionIcon />, path: '/rvsk/grievances', visibleTo: ['Super_Admin', 'RVSK_Admin', 'RVSK_SPOC', 'State_Admin', 'District_Admin'] },
  { label: 'Grievance Categories', icon: <ViewListIcon />, path: '/rvsk/grievances/categories', visibleTo: ['Super_Admin', 'RVSK_Admin'] },
];
```

## Old Filtering Logic

```typescript
const filteredNavItems = navItems.filter((item) => {
  if (item.divider) return true;
  if (item.visibleTo && item.visibleTo.length > 0) {
    if (!user?.role || !item.visibleTo.includes(user.role)) return false;
  }
  if (!item.module) return true;
  if (user?.role === 'Super_Admin' || user?.role === 'RVSK_Admin') return true;
  if (!user?.access) return true;
  const pages = user.access[item.module] || [];
  return pages.length > 0;
});
```
