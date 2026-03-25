import PortalLayout from '../layouts/PortalLayout';
import PageHeader from '../components/PageHeader';

export default function HelpPage({ role }) {
  return (
    <PortalLayout role={role}>
      <PageHeader title="Help" description="Reference help content, support channels, and FAQ placeholders for the portal." />
      <div className="stack-list">
        {['How to submit timesheets', 'How approvals flow works', 'How to update profile documents'].map((item) => <div key={item} className="card list-item"><strong>{item}</strong><p>Support article placeholder.</p></div>)}
      </div>
    </PortalLayout>
  );
}
