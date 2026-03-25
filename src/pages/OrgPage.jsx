import PortalLayout from '../layouts/PortalLayout';
import PageHeader from '../components/PageHeader';
import { reportingContacts } from '../services/mockData';

export default function OrgPage() {
  return (
    <PortalLayout role="employee">
      <PageHeader title="Org Structure" description="See your manager, HR, entity, and payroll support contacts." />
      <div className="contact-grid">
        {reportingContacts.map((item) => <div key={item.name} className="card info-card"><strong>{item.name}</strong><p>{item.role}</p><span className="subtle">{item.detail}</span></div>)}
      </div>
    </PortalLayout>
  );
}
