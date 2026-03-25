import PortalLayout from '../layouts/PortalLayout';
import PageHeader from '../components/PageHeader';
import { canSeeReports } from '../services/session';

export default function ReportsPage() {
  const allowed = canSeeReports();
  return (
    <PortalLayout role="employer">
      <PageHeader title="Reports" description="Monthly, weekly, and yearly reporting placeholders for recruiter performance, work hours, and entity operations." />
      {!allowed ? (
        <div className="card info-card"><strong>Restricted</strong><p className="subtle">Reports are available to Admin and Super Admin only.</p></div>
      ) : (
        <div className="simple-grid" style={{ gridTemplateColumns: 'repeat(2,minmax(0,1fr))' }}>
          {['Recruiter performance', 'Employee by client', 'Hours by project', 'Assignment expiry watchlist'].map((item) => <div key={item} className="card info-card"><strong>{item}</strong><p className="subtle">Chart / API placeholder</p></div>)}
        </div>
      )}
    </PortalLayout>
  );
}
