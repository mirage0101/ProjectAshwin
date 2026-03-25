import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardOverview from './pages/DashboardOverview';
import OnboardingPage from './pages/OnboardingPage';
import TimesheetPage from './pages/TimesheetPage';
import TimesheetDetailPage from './pages/TimesheetDetailPage';
import DocumentsPage from './pages/DocumentsPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import EmployeeDirectoryPage from './pages/EmployeeDirectoryPage';
import EmployeeDetailPage from './pages/EmployeeDetailPage';
import ApprovalsPage from './pages/ApprovalsPage';
import ClientDirectoryPage from './pages/ClientDirectoryPage';
import ClientDetailPage from './pages/ClientDetailPage';
import EntityDirectoryPage from './pages/EntityDirectoryPage';
import EntityDetailPage from './pages/EntityDetailPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import HelpPage from './pages/HelpPage';
import NotFoundPage from './pages/NotFoundPage';
import PayPage from './pages/PayPage';
import OrgPage from './pages/OrgPage';
import MarketingPage from './pages/MarketingPage';
import MarketingDetailPage from './pages/MarketingDetailPage';
import OnboardingDetailPage from './pages/OnboardingDetailPage';
import TeamPage from './pages/TeamPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />

      <Route path="/employee" element={<DashboardOverview role="employee" />} />
      <Route path="/employee/onboarding" element={<OnboardingPage role="employee" />} />
      <Route path="/employee/timesheets" element={<TimesheetPage role="employee" />} />
      <Route path="/employee/documents" element={<DocumentsPage role="employee" />} />
      <Route path="/employee/profile" element={<ProfilePage role="employee" />} />
      <Route path="/employee/notifications" element={<NotificationsPage role="employee" />} />
      <Route path="/employee/help" element={<HelpPage role="employee" />} />
      <Route path="/employee/settings" element={<SettingsPage role="employee" />} />
      <Route path="/employee/pay" element={<PayPage />} />
      <Route path="/employee/org" element={<OrgPage />} />

      <Route path="/employer" element={<DashboardOverview role="employer" />} />
      <Route path="/employer/team" element={<TeamPage />} />
      <Route path="/employer/onboarding" element={<OnboardingPage role="employer" />} />
      <Route path="/employer/onboarding/:id" element={<OnboardingDetailPage />} />
      <Route path="/employer/timesheets" element={<TimesheetPage role="employer" />} />
      <Route path="/employer/timesheets/:id" element={<TimesheetDetailPage />} />
      <Route path="/employer/documents" element={<DocumentsPage role="employer" />} />
      <Route path="/employer/profile" element={<ProfilePage role="employer" />} />
      <Route path="/employer/notifications" element={<NotificationsPage role="employer" />} />
      <Route path="/employer/employees" element={<EmployeeDirectoryPage />} />
      <Route path="/employer/employees/:id" element={<EmployeeDetailPage />} />
      <Route path="/employer/clients" element={<ClientDirectoryPage />} />
      <Route path="/employer/clients/:id" element={<ClientDetailPage />} />
      <Route path="/employer/entities" element={<EntityDirectoryPage />} />
      <Route path="/employer/entities/:id" element={<EntityDetailPage />} />
      <Route path="/employer/marketing" element={<MarketingPage />} />
      <Route path="/employer/marketing/:id" element={<MarketingDetailPage />} />
      <Route path="/employer/approvals" element={<ApprovalsPage />} />
      <Route path="/employer/reports" element={<ReportsPage />} />
      <Route path="/employer/help" element={<HelpPage role="employer" />} />
      <Route path="/employer/settings" element={<SettingsPage role="employer" />} />

      <Route path="/home" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
