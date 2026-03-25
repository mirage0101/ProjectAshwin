import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PortalLayout from '../layouts/PortalLayout';
import PageHeader from '../components/PageHeader';
import {
  getOnboardingApprovals,
  getTimesheets,
  updateOnboardingApproval,
  updateTimesheet,
} from '../services/portalStore';
import { getEmployerRole } from '../services/session';

const tabs = [
  ['timesheets', 'Timesheet Approvals'],
  ['onboarding', 'Onboarding Docs'],
];

export default function ApprovalsPage() {
  const [tab, setTab] = useState('timesheets');
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();
  const employerRole = getEmployerRole();

  const timesheetItems = useMemo(
    () => getTimesheets()
      .filter((item) => item.status === 'Submitted')
      .map((item) => ({
        id: item.id,
        type: 'timesheet',
        employee: item.employee,
        entity: item.entity,
        detail: `${item.weekLabel} - ${item.totalHours} hours - ${item.client}`,
        stage: 'HR Review',
        priority: 'High',
      })),
    [refreshKey]
  );

  const onboardingItems = useMemo(
    () => getOnboardingApprovals().filter((item) => item.status !== 'Approved' && item.status !== 'Rejected'),
    [refreshKey]
  );

  const items = tab === 'timesheets' ? timesheetItems : onboardingItems;

  const approveItem = (item) => {
    if (item.type === 'timesheet') {
      updateTimesheet(item.id, { status: 'Approved', reviewNote: 'Approved from approvals inbox.' });
    } else {
      updateOnboardingApproval(item.id, { status: 'Approved' });
    }
    setRefreshKey((value) => value + 1);
  };

  const rejectItem = (item) => {
    if (item.type === 'timesheet') {
      updateTimesheet(item.id, { status: 'Rejected', reviewNote: 'Rejected from approvals inbox.' });
    } else {
      updateOnboardingApproval(item.id, { status: 'Rejected' });
    }
    setRefreshKey((value) => value + 1);
  };

  const openDetails = (item) => {
    if (item.type === 'timesheet') {
      navigate(`/employer/timesheets/${item.id}`);
      return;
    }
    navigate(`/employer/onboarding/${item.caseId}`);
  };

  return (
    <PortalLayout role="employer">
      <PageHeader title="Approvals" description={`Approval inbox aligned to ${employerRole.replace('_', ' ')} responsibilities.`} />

      <div className="approval-tabs">
        {tabs.map(([key, label]) => <button key={key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>{label}</button>)}
      </div>

      <div className="approval-list">
        {items.length ? items.map((item) => (
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
              <button className="button button-secondary slim-button" onClick={() => openDetails(item)}>Open Details</button>
              <button className="button button-secondary slim-button" onClick={() => rejectItem(item)}>Reject</button>
              <button className="button slim-button" onClick={() => approveItem(item)}>Approve</button>
            </div>
          </div>
        )) : (
          <div className="card approval-item">
            <div className="approval-item-head">
              <div>
                <strong>No pending items</strong>
                <p>{tab === 'timesheets' ? 'Submitted weekly timesheets will appear here until HR/Admin reviews them.' : 'Pending onboarding document approvals will appear here until they are reviewed.'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
