import PortalLayout from '../layouts/PortalLayout';
import PageHeader from '../components/PageHeader';
import { leaveBalances, leaveRequests } from '../services/mockData';

export default function LeavePage({ role }) {
  return (
    <PortalLayout role={role}>
      <PageHeader title="Leave" description="Review balances, apply for leave, and track request status." actions={<button className="button">Apply leave</button>} />
      <div className="simple-grid" style={{ marginBottom: '1rem' }}>
        {leaveBalances.map((item) => <div key={item.label} className="card info-card"><div className="subtle">{item.label}</div><div className="stat-value">{item.value}</div></div>)}
      </div>
      <div className="table-wrap card">
        <table>
          <thead><tr><th>Type</th><th>From</th><th>To</th><th>Status</th></tr></thead>
          <tbody>
            {leaveRequests.map((item, idx) => <tr key={idx}><td>{item.type}</td><td>{item.from}</td><td>{item.to}</td><td>{item.status}</td></tr>)}
          </tbody>
        </table>
      </div>
    </PortalLayout>
  );
}
