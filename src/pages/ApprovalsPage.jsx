import { useState } from 'react';
import PortalLayout from '../layouts/PortalLayout';
import PageHeader from '../components/PageHeader';
import { approvalItems } from '../services/mockData';
import { getEmployerRole } from '../services/session';

const tabs = [
  ['timesheets', 'Timesheet Approvals'],
  ['onboarding', 'Onboarding Docs'],
  ['payroll', 'Payroll Approvals'],
];

export default function ApprovalsPage() {
  const [tab, setTab] = useState('timesheets');
  const employerRole = getEmployerRole();
  const items = approvalItems[tab] || [];

  return (
    <PortalLayout role="employer">
      <PageHeader title="Approvals" description={`Approval inbox aligned to ${employerRole.replace('_', ' ')} responsibilities.`} />

      <div className="approval-tabs">
        {tabs.map(([key, label]) => <button key={key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>{label}</button>)}
      </div>

      <div className="approval-list">
        {items.map((item) => (
          <div key={item.id} className="card approval-item">
            <div className="approval-item-head">
              <div>
                <strong>{item.employee}</strong>
                <p>{item.detail}</p>
              </div>
              <div className="inline-actions">
                <span className="badge">{item.entity}</span>
                <span className="badge">{item.stage}</span>
              </div>
            </div>
            <div className="inline-actions" style={{ marginTop: '.85rem' }}>
              <button className="button button-secondary">Open details</button>
              <button className="button button-secondary">Reject</button>
              <button className="button">Approve</button>
            </div>
          </div>
        ))}
      </div>
    </PortalLayout>
  );
}
