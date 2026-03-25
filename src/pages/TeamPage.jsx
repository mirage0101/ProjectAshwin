import PortalLayout from '../layouts/PortalLayout';
import PageHeader from '../components/PageHeader';
import { getTeamMembers } from '../services/portalStore';
import { getEmployerRole } from '../services/session';

export default function TeamPage() {
  const rows = getTeamMembers();
  return (
    <PortalLayout role="employer">
      <PageHeader title="Team" description="Employer tree across Admin, Lead Recruiter, Recruiter, and HR roles within the current entity." />
      <div className="table-wrap card">
        <table>
          <thead><tr><th>Name</th><th>Role</th><th>Entity</th><th>Status</th><th>Email</th></tr></thead>
          <tbody>
            {rows.map((row) => <tr key={row.id}><td><strong>{row.name}</strong></td><td>{row.role}</td><td>{row.entity}</td><td>{row.status}</td><td>{row.email}</td></tr>)}
          </tbody>
        </table>
      </div>
    </PortalLayout>
  );
}
