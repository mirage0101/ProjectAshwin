import { Link } from 'react-router-dom';
import PortalLayout from '../layouts/PortalLayout';
import PageHeader from '../components/PageHeader';
import { notifications } from '../services/mockData';
import { getEmployerNotifications } from '../services/portalStore';
import { getEmployerRole } from '../services/session';

export default function NotificationsPage({ role }) {
  const employerRole = getEmployerRole();
  const items = role === 'employer' && ['admin', 'superadmin', 'hr'].includes(employerRole)
    ? getEmployerNotifications()
    : notifications.map((item) => ({ ...item, id: item.title }));

  return (
    <PortalLayout role={role}>
      <PageHeader
        title="Notifications"
        description={role === 'employer' && ['admin', 'superadmin', 'hr'].includes(employerRole)
          ? 'Assignment expiry and end-date alerts for HR/Admin follow-up. Open an item to extend the assignment or move the employee to Bench.'
          : 'Recent system alerts and reminders for the current user.'}
      />
      <div className="stack-list">
        {items.length ? items.map((item) => item.href ? (
          <Link key={item.id} to={item.href} className="card list-item">
            <strong>{item.title}</strong>
            <p>{item.text}</p>
            <span>{item.time}</span>
          </Link>
        ) : (
          <div key={item.id} className="card list-item">
            <strong>{item.title}</strong>
            <p>{item.text}</p>
            <span>{item.time}</span>
          </div>
        )) : (
          <div className="card list-item">
            <strong>No assignment alerts</strong>
            <p>There are no current employee assignment end-date actions for this role.</p>
            <span>Up to date</span>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
