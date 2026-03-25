import PortalLayout from '../layouts/PortalLayout';
import PageHeader from '../components/PageHeader';
import { notifications } from '../services/mockData';

export default function NotificationsPage({ role }) {
  return (
    <PortalLayout role={role}>
      <PageHeader title="Notifications" description="Recent system alerts and reminders for the current user." />
      <div className="stack-list">
        {notifications.map((item) => <div key={item.title} className="card list-item"><strong>{item.title}</strong><p>{item.text}</p><span>{item.time}</span></div>)}
      </div>
    </PortalLayout>
  );
}
