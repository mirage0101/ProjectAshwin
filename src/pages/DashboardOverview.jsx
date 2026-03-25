import PortalLayout from '../layouts/PortalLayout';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { employeeStats, employeeTasks, reportingContacts } from '../services/mockData';
import { getClients, getEmployees, getMarketingCases, getOnboardingCases } from '../services/portalStore';
import { getEmployerRole } from '../services/session';

function employerStatsByRole(role) {
  const employees = getEmployees();
  const marketing = getMarketingCases();
  const onboarding = getOnboardingCases();
  const clients = getClients();
  const activeAssignments = employees.filter((e) => e.status === 'ONBOARDED').length;
  return [
    { label: role === 'recruiter' || role === 'lead_recruiter' ? 'Open marketing queue' : 'Active employees', value: String(employees.length), detail: `${activeAssignments} currently onboarded` },
    { label: 'Bench employees', value: String(employees.filter((e) => String(e.status).startsWith('BENCH')).length), detail: 'Visible to marketing queue' },
    { label: 'Marketing cases', value: String(marketing.length), detail: 'Submissions tracked per employee' },
    { label: 'Onboarding cases', value: String(onboarding.length), detail: `${clients.length} client/vendor records in system` },
  ];
}

export default function DashboardOverview({ role }) {
  const isEmployer = role === 'employer';
  const employerRole = getEmployerRole();
  const stats = isEmployer ? employerStatsByRole(employerRole) : employeeStats;
  const leftItems = isEmployer
    ? getMarketingCases().slice(0, 3).map((item) => ({ title: item.employee, detail: item.summary, status: item.state }))
    : employeeTasks;
  const rightItems = isEmployer
    ? getOnboardingCases().slice(0, 3).map((item) => ({ name: item.employee, role: item.client, detail: item.state }))
    : reportingContacts;

  return (
    <PortalLayout role={role}>
      <PageHeader
        title="Overview"
        description={isEmployer
          ? 'Updated dashboard aligned to the new blueprint: recruiter-owned marketing, HR-owned onboarding, entity-scoped access, and assignment lifecycle tracking.'
          : 'Track your own tasks, documents, offer acknowledgement, weekly timesheets, and assignment history from one employee workspace.'}
      />

      <div className="stats-grid">
        {stats.map((item) => <StatCard key={item.label} label={item.label} value={item.value} detail={item.detail} />)}
      </div>

      <div className="two-col">
        <div>
          <div className="section-head"><h3>{isEmployer ? 'Marketing / queue highlights' : 'Pending tasks'}</h3></div>
          <div className="stack-list">
            {leftItems.map((item, index) => (
              <div key={index} className="card list-item">
                <strong>{item.title}</strong>
                <p>{item.detail || item.due}</p>
                <span>{item.status}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="section-head"><h3>{isEmployer ? 'Onboarding handoff summary' : 'Reporting contacts'}</h3></div>
          <div className="stack-list">
            {rightItems.map((item, index) => (
              <div key={index} className="card list-item">
                <strong>{item.name}</strong>
                <p>{item.role}</p>
                <span>{item.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
