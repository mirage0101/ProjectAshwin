import { useNavigate } from 'react-router-dom';
import PortalLayout from '../layouts/PortalLayout';
import PageHeader from '../components/PageHeader';
import { assignMarketingCase, getEmployees, getMarketingCases } from '../services/portalStore';
import { getEmployerRole, getSession } from '../services/session';

export default function MarketingPage() {
  const navigate = useNavigate();
  const employerRole = getEmployerRole();
  const session = getSession();
  const cases = getMarketingCases();
  const employees = getEmployees();

  const queueRows = employees.filter((emp) => String(emp.status).startsWith('BENCH')).map((emp) => {
    const caseRow = cases.find((row) => String(row.employeeId) === String(emp.id));
    return {
      employeeId: emp.id,
      name: emp.name,
      status: emp.status,
      recruiter: caseRow?.recruiter || emp.recruiter || '',
      caseId: caseRow?.id,
      queueStatus: caseRow?.queueStatus || 'Open',
      summary: caseRow?.summary || 'Bench employee visible in marketing queue.',
      benchStart: emp.benchStart,
      skills: (emp.skills || []).join(', '),
    };
  });

  const assignToSelf = (row) => {
    if (row.caseId) assignMarketingCase(row.caseId, session.name);
    navigate(row.caseId ? `/employer/marketing/${row.caseId}` : '/employer/marketing');
  };

  return (
    <PortalLayout role="employer">
      <PageHeader
        eyebrow="Recruiter phase"
        title="Marketing"
        description="Shared queue visible to recruiters inside the entity. No top-level create action here. Recruiters assign an employee to themselves, then create submissions inside the marketing detail page."
      />

      <div className="table-wrap card">
        <table>
          <thead>
            <tr>
              <th>Employee</th><th>Status</th><th>Assigned Recruiter</th><th>Bench Start</th><th>Skills</th><th>Queue Visibility</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {queueRows.map((row) => (
              <tr key={row.employeeId}>
                <td><strong>{row.name}</strong><div className="subtle">{row.summary}</div></td>
                <td><span className={`status-pill ${row.queueStatus === 'Assigned' ? 'status-pending' : 'status-active'}`}>{row.status}</span></td>
                <td>{row.recruiter || 'Open / Unassigned'}</td>
                <td>{row.benchStart || '—'}</td>
                <td>{row.skills || 'Pending profile'}</td>
                <td>{row.queueStatus === 'Assigned' ? 'Visible to all, details locked to owner + admin' : 'Visible to all recruiters'}</td>
                <td>
                  {row.caseId ? (
                    <div className="inline-actions">
                      {(!row.recruiter || row.recruiter === session.name || employerRole === 'admin' || employerRole === 'superadmin' || employerRole === 'lead_recruiter') && (
                        <button className="button button-secondary slim-button" onClick={() => navigate(`/employer/marketing/${row.caseId}`)}>
                          {row.recruiter ? 'Open Detail' : 'Assign & Open'}
                        </button>
                      )}
                      {!row.recruiter && <button className="button slim-button" onClick={() => assignToSelf(row)}>Assign to Me</button>}
                    </div>
                  ) : (
                    <span className="subtle">No case record yet</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PortalLayout>
  );
}
