import PortalLayout from '../layouts/PortalLayout';
import PageHeader from '../components/PageHeader';

export default function SettingsPage({ role }) {
  return (
    <PortalLayout role={role}>
      <PageHeader title="Settings" description="Sample settings panel for notification preferences, account controls, and future integrations." />
      <div className="simple-grid">
        {['Notification preferences', 'Security options', 'Approval delegation'].map((item) => <div key={item} className="card info-card"><strong>{item}</strong><p className="subtle">Backend save APIs will be connected later.</p></div>)}
      </div>
    </PortalLayout>
  );
}
