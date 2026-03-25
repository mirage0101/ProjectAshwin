import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PortalLayout from '../layouts/PortalLayout';
import PageHeader from '../components/PageHeader';
import { employeeTasks } from '../services/mockData';
import { getClients, getDocuments, getOnboardingCases } from '../services/portalStore';

export default function OnboardingPage({ role }) {
  const navigate = useNavigate();
  const isEmployer = role === 'employer';
  const rows = useMemo(() => getOnboardingCases(), []);
  const clients = getClients();

  return (
    <PortalLayout role={role}>
      <PageHeader
        eyebrow={isEmployer ? 'HR phase' : 'Employee task center'}
        title={isEmployer ? 'Onboarding' : 'Tasks'}
        description={isEmployer
          ? 'HR-owned onboarding queue in compact table form. Open a case to request docs, upload client artifacts, generate offer files, and review history.'
          : 'Structured tasks requested by HR and Admin, including onboarding documents and offer acknowledgment.'}
      />

      {isEmployer ? (
        <div className="table-wrap card compact-table-card">
          <table className="tracker-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Client</th>
                <th>State</th>
                <th>HR</th>
                <th>Requested Docs</th>
                <th>Assignment End</th>
                <th>Client Docs</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => {
                const client = clients.find((entry) => entry.name === item.client);
                const clientDocCount = client ? getDocuments('client', client.id).length : 0;
                return (
                  <tr key={item.id}>
                    <td><strong>{item.employee}</strong><div className="subtle">{item.vendorPath}</div></td>
                    <td>{item.client}</td>
                    <td><span className={`status-pill ${item.state.includes('Pending') ? 'status-pending' : item.state.includes('Generated') ? 'status-active' : 'status-active'}`}>{item.state}</span></td>
                    <td>{item.hr}</td>
                    <td>{item.docsRequested.length}</td>
                    <td>{item.assignmentEnd}</td>
                    <td>{clientDocCount}</td>
                    <td><button className="button button-secondary slim-button" onClick={() => navigate(`/employer/onboarding/${item.id}`)}>Open Case</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
