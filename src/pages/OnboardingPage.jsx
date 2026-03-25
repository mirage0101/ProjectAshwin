import PortalLayout from '../layouts/PortalLayout';
import PageHeader from '../components/PageHeader';
import { employeeTasks } from '../services/mockData';
import { getOnboardingCases } from '../services/portalStore';

export default function OnboardingPage({ role }) {
  const isEmployer = role === 'employer';
  const rows = getOnboardingCases();

  return (
    <PortalLayout role={role}>
      <PageHeader
        eyebrow={isEmployer ? 'HR phase' : 'Employee task center'}
        title={isEmployer ? 'Onboarding' : 'Tasks'}
        description={isEmployer
          ? 'This page is for HR-owned post-marketing onboarding only: request employee documents, upload client docs, and issue offer letter acknowledgment.'
          : 'Structured tasks requested by HR and Admin, including onboarding documents and offer acknowledgment.'}
      />

      {isEmployer ? (
        <div className="approval-list">
          {rows.map((item) => (
            <div key={item.id} className="card approval-item">
              <div className="approval-item-head">
                <div>
                  <strong>{item.employee}</strong>
                  <p>{item.client} • {item.vendorPath}</p>
                </div>
                <div className="inline-actions">
                  <span className="badge">{item.state}</span>
                  <span className="badge">{item.hr}</span>
                </div>
              </div>
              <div className="simple-grid employee-detail-grid compact-tiles" style={{ marginTop: '1rem' }}>
                <div className="card info-card"><div className="subtle">Requested Docs</div><strong>{item.docsRequested.join(', ')}</strong></div>
                <div className="card info-card"><div className="subtle">Assignment End</div><strong>{item.assignmentEnd}</strong></div>
                <div className="card info-card"><div className="subtle">Task Count</div><strong>{item.taskCount}</strong></div>
              </div>
              <div className="inline-actions" style={{ marginTop: '.85rem' }}>
                <button className="button button-secondary">Request Docs</button>
                <button className="button button-secondary">Upload Client Docs</button>
                <button className="button">Generate Offer PDF</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="stack-list">
          {employeeTasks.map((item, index) => (
            <div key={index} className="card list-item">
              <strong>{item.title}</strong>
              <p>Due: {item.due}</p>
              <span>{item.status}</span>
            </div>
          ))}
        </div>
      )}
    </PortalLayout>
  );
}
