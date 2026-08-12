# RVSK Grievance Module — Route Wiring Guide

## Overview
This module provides a complete Grievance Management system for the RVSK Portal.
The following pages are available:

| Route | Component | Description |
|-------|-----------|-------------|
| `/grievances` | `GrievanceDashboard` | Dashboard with KPIs, charts |
| `/grievances/raise` | `RaiseGrievance` | Form to raise a new grievance |
| `/grievances/list` | `GrievanceList` | Paginated list with filters |
| `/grievances/:id` | `GrievanceDetail` | Full detail view with actions |

## How to Wire into App.tsx

Add the following route definitions inside your `<Routes>` block in `App.tsx`:

```tsx
import {
  GrievanceDashboard,
  RaiseGrievance,
  GrievanceList,
  GrievanceDetail,
} from './dashboards/grievance';

// Inside <Routes>:
<Route path="/grievances" element={<GrievanceDashboard />} />
<Route path="/grievances/raise" element={<RaiseGrievance />} />
<Route path="/grievances/list" element={<GrievanceList />} />
<Route path="/grievances/:id" element={<GrievanceDetail />} />
```

## Role-Based Access
- **State_Admin / District_Admin**: Can raise grievances, view own grievances, accept/reopen responses
- **RVSK_SPOC**: Can view assigned grievances, update status, provide responses, add internal notes
- **Super_Admin / RVSK_Admin**: Full access to all grievances, dashboard shows all data

## Sidebar Navigation Suggestion
Add a "Grievances" item to your sidebar navigation:

```tsx
{
  label: 'Grievances',
  icon: <FeedbackIcon />,
  path: '/grievances',
  roles: ['Super_Admin', 'RVSK_Admin', 'RVSK_SPOC', 'State_Admin', 'District_Admin'],
}
```

## Vite Proxy Configuration
The grievance API endpoints (`/api/v1/grievances/*`) run on the auth-service (port 8091).
See `PROXY_NOTE.md` in this directory for proxy configuration details.
