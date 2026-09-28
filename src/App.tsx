import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './components/layout/PublicLayout';
import PortalLayout from './components/layout/PortalLayout';
import HomePage from './portals/public/HomePage';
import AboutPage from './portals/public/AboutPage';
import SchemesPage from './portals/public/SchemesPage';
import GalleryPage from './portals/public/GalleryPage';
import ContactPage from './portals/public/ContactPage';
import LoginPage from './portals/public/LoginPage';
import VskDetails from './portals/rvsk/VskDetails';
import { VskAdminDashboard } from './portals/rvsk/vsk';
import RvskDashboard from './portals/rvsk/RvskDashboard';
import { RoleHomePage, VskImageUpload } from './portals/rvsk/home';
import {
  FormManagement, FormCreate, FormPreview, FormResponses, FormResponseDetail,
  MyForms, FormFill, FormSubmissionView,
} from './portals/rvsk/forms';
import UserPermissions from './portals/rvsk/UserPermissions';
import ProfileSetup from './portals/rvsk/ProfileSetup';
import MyProfile from './portals/rvsk/MyProfile';
import ChangePassword from './portals/rvsk/ChangePassword';
import AdminUserList from './portals/rvsk/AdminUserList';
import AdminCreateUser from './portals/rvsk/AdminCreateUser';
import AdminEditUser from './portals/rvsk/AdminEditUser';
import ModuleManagement from './portals/rvsk/admin/ModuleManagement';
import PageManagement from './portals/rvsk/admin/PageManagement';
import PermissionManagement from './portals/rvsk/admin/PermissionManagement';
import NotificationConfig from './portals/rvsk/admin/NotificationConfig';
import NotificationBranding from './portals/rvsk/admin/NotificationBranding';
import NotificationLogs from './portals/rvsk/admin/NotificationLogs';
import StateSpocAssignment from './portals/rvsk/admin/StateSpocAssignment';
import VskHome from './portals/vsk/VskHome';
import VskDashboard from './portals/vsk/VskDashboard';
import VskFormSubmissions from './portals/vsk/VskFormSubmissions';
import PmShriDashboard from './dashboards/schemes/PmShriDashboard';
import PgiDashboard from './dashboards/schemes/PgiDashboard';
import NasDashboard from './dashboards/schemes/NasDashboard';
import UdiseDashboard from './dashboards/schemes/UdiseDashboard';
import NipunDashboard from './dashboards/schemes/NipunDashboard';
import NcertQuizDashboard from './dashboards/schemes/NcertQuizDashboard';
import NcfDashboard from './dashboards/schemes/NcfDashboard';
import PrashastDashboard from './dashboards/schemes/PrashastDashboard';
import NishthaDashboard from './dashboards/schemes/NishthaDashboard';
import PmPoshanDashboard from './dashboards/schemes/PmPoshanDashboard';
import MicroImprovementDashboard from './dashboards/schemes/MicroImprovementDashboard';
import DikshaEtbDashboard from './dashboards/schemes/DikshaEtbDashboard';
import DashboardFilterLayout from './dashboards/shared/DashboardFilterLayout';
import AttendanceSummary from './dashboards/state/attendance/AttendanceSummary';
import AttendanceTrends from './dashboards/state/attendance/AttendanceTrends';
import AccreditationDashboard from './dashboards/state/accreditation/AccreditationDashboard';
import ProgrammeFramework from './dashboards/state/accreditation/sections/ProgrammeFramework';
import CoverageReach from './dashboards/state/accreditation/sections/CoverageReach';
import ProcessOperations from './dashboards/state/accreditation/sections/ProcessOperations';
import DataQuality from './dashboards/state/accreditation/sections/DataQuality';
import ImpactOutcomes from './dashboards/state/accreditation/sections/ImpactOutcomes';
import PlaceholderDashboard from './dashboards/state/PlaceholderDashboard';
import { AssessmentOverview, AssessmentDemographics, AssessmentSubjects, AssessmentTrends, AssessmentRankings, AssessmentQuality } from './dashboards/assessment';
import { GrievanceDashboard, RaiseGrievance, GrievanceList, GrievanceDetail } from './dashboards/grievance';
import GrievanceCategoryAdmin from './dashboards/grievance/GrievanceCategoryAdmin';
import ProtectedRoute from './components/shared/ProtectedRoute';
import ComingSoon from './portals/rvsk/ComingSoon';

function App() {
  return (
    <Routes>
      {/* Public Portal */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/schemes" element={<SchemesPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard/pm-shri" element={<PmShriDashboard />} />
        <Route path="/dashboard/pgi" element={<PgiDashboard />} />
        <Route path="/dashboard/nas" element={<NasDashboard />} />
        <Route path="/dashboard/udise" element={<UdiseDashboard />} />
        <Route path="/dashboard/nipun-bharat" element={<NipunDashboard />} />
        <Route path="/dashboard/ncert-quiz" element={<NcertQuizDashboard />} />
        <Route path="/dashboard/ncf" element={<NcfDashboard />} />
        <Route path="/dashboard/prashast" element={<PrashastDashboard />} />
        <Route path="/dashboard/nishtha" element={<NishthaDashboard />} />
        <Route path="/dashboard/pm-poshan" element={<PmPoshanDashboard />} />
        <Route path="/dashboard/micro-improvement" element={<MicroImprovementDashboard />} />
        <Route path="/dashboard/diksha-etb" element={<DikshaEtbDashboard />} />
      </Route>

      {/* RVSK Portal (Protected) */}
      <Route element={<ProtectedRoute allowedRoles={['Super_Admin', 'Ministry_Admin', 'RVSK_Admin', 'RVSK_SPOC', 'State_Admin', 'District_Admin', 'Block_Admin', 'Viewer']} />}>
        {/* Profile Setup — full screen, no sidebar (first-login only) */}
        <Route path="/rvsk/profile-setup" element={<ProfileSetup />} />

        <Route element={<PortalLayout portalType="rvsk" />}>
          <Route path="/rvsk/home" element={<RoleHomePage />} />
          <Route path="/rvsk/gallery/upload" element={<VskImageUpload />} />
          <Route path="/rvsk/vsk-details" element={<VskDetails />} />
          <Route path="/rvsk/vsk-admin" element={<VskAdminDashboard />} />

          {/* Form Builder (Admin) */}
          <Route path="/rvsk/form-builder" element={<FormManagement />} />
          <Route path="/rvsk/form-builder/new" element={<FormCreate />} />
          <Route path="/rvsk/form-builder/:id/edit" element={<FormCreate />} />
          <Route path="/rvsk/form-builder/:id/preview" element={<FormPreview />} />
          <Route path="/rvsk/form-builder/:id/responses" element={<FormResponses />} />
          <Route path="/rvsk/form-builder/:id/responses/:stateCode" element={<FormResponseDetail />} />

          {/* State User Forms */}
          <Route path="/rvsk/my-forms" element={<MyForms />} />
          <Route path="/rvsk/my-forms/:id/fill" element={<FormFill />} />
          <Route path="/rvsk/my-forms/:id/view" element={<FormSubmissionView />} />

          <Route path="/rvsk/user-permissions" element={<UserPermissions />} />
          <Route path="/rvsk/profile" element={<MyProfile />} />
          <Route path="/rvsk/change-password" element={<ChangePassword />} />
          <Route path="/rvsk/admin/users" element={<AdminUserList />} />
          <Route path="/rvsk/admin/users/new" element={<AdminCreateUser />} />
          <Route path="/rvsk/admin/users/:id/edit" element={<AdminEditUser />} />
          <Route path="/rvsk/admin/modules" element={<ModuleManagement />} />
          <Route path="/rvsk/admin/pages" element={<PageManagement />} />
          <Route path="/rvsk/admin/permissions" element={<PermissionManagement />} />
          <Route path="/rvsk/admin/notifications" element={<NotificationConfig />} />
          <Route path="/rvsk/admin/notifications/branding" element={<NotificationBranding />} />
          <Route path="/rvsk/admin/notifications/logs" element={<NotificationLogs />} />
          <Route path="/rvsk/admin/spoc-assignment" element={<StateSpocAssignment />} />
          <Route path="/rvsk/dashboard" element={<RvskDashboard />} />

          {/* A1 - Attendance: 5-page target, shared filter bar. Page 1 (summary)
              is the redesigned Attendance page; Pages 2-5 arrive in Phase 2. */}
          <Route
            path="/rvsk/dashboard/attendance"
            element={<Navigate to="/rvsk/dashboard/attendance/summary" replace />}
          />
          {/* Summary → single Date leading filter. */}
          <Route
            path="/rvsk/dashboard/attendance/summary"
            element={<DashboardFilterLayout leading={[{ type: 'date', label: 'Date' }]} />}
          >
            <Route index element={<AttendanceSummary />} />
          </Route>
          {/* Trends → Date Range leading filter (bounded to last 6 months). */}
          <Route
            path="/rvsk/dashboard/attendance/trends"
            element={<DashboardFilterLayout leading={[{ type: 'dateRange', maxMonths: 6 }]} />}
          >
            <Route index element={<AttendanceTrends />} />
          </Route>

          {/* A2 - Assessment Dashboard */}
          <Route path="/rvsk/dashboard/assessment/overview" element={<AssessmentOverview />} />
          <Route path="/rvsk/dashboard/assessment/demographics" element={<AssessmentDemographics />} />
          <Route path="/rvsk/dashboard/assessment/subjects" element={<AssessmentSubjects />} />
          <Route path="/rvsk/dashboard/assessment/trends" element={<AssessmentTrends />} />
          <Route path="/rvsk/dashboard/assessment/rankings" element={<AssessmentRankings />} />
          <Route path="/rvsk/dashboard/assessment/quality" element={<AssessmentQuality />} />
          <Route path="/rvsk/dashboard/administration" element={<PlaceholderDashboard title="Administration" badge="A3" badgeColor="#92400E" description="School administration, district management, and operational metrics" />} />
          {/* A4 - Accreditation KPI Dashboard: sections with shared filter bar */}
          <Route path="/rvsk/dashboard/accreditation" element={<AccreditationDashboard />}>
            <Route index element={<Navigate to="programme" replace />} />
            <Route path="programme" element={<ProgrammeFramework />} />
            <Route path="coverage" element={<CoverageReach />} />
            <Route path="process" element={<ProcessOperations />} />
            <Route path="data-quality" element={<DataQuality />} />
            <Route path="impact" element={<ImpactOutcomes />} />
          </Route>
          <Route path="/rvsk/dashboard/adaptive-learning" element={<PlaceholderDashboard title="Adaptive Learning" badge="A5" badgeColor="#059669" description="AI-powered learning recommendations, engagement analytics, and progress tracking" />} />
          <Route path="/rvsk/dashboard/apaar" element={<PlaceholderDashboard title="APAAR" badge="A6" badgeColor="#0E7490" description="Academic Bank of Credits, student ID registry, and Aadhaar integration" />} />

          {/* Grievance Management */}
          <Route path="/rvsk/grievances" element={<GrievanceDashboard />} />
          <Route path="/rvsk/grievances/raise" element={<RaiseGrievance />} />
          <Route path="/rvsk/grievances/list" element={<GrievanceList />} />
          <Route path="/rvsk/grievances/categories" element={<GrievanceCategoryAdmin />} />
          <Route path="/rvsk/grievances/:id" element={<GrievanceDetail />} />

          {/* Catch-all for any unimplemented pages in the menu */}
          <Route path="/rvsk/*" element={<ComingSoon />} />
        </Route>
      </Route>

      {/* VSK Portal (Protected) */}
      <Route element={<ProtectedRoute allowedRoles={['State_Admin']} />}>
        <Route element={<PortalLayout portalType="vsk" />}>
          <Route path="/vsk/home" element={<VskHome />} />
          <Route path="/vsk/forms" element={<VskFormSubmissions />} />
          <Route path="/vsk/dashboard" element={<VskDashboard />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
