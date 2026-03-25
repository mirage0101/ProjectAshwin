import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PortalLayout from '../layouts/PortalLayout';
import PageHeader from '../components/PageHeader';
import { assignMarketingCase, getEmployees, getMarketingCases, getTeamMembers } from '../services/portalStore';
import { getEmployerRole, getSession } from '../services/session';

export default function MarketingPage() {
  const navigate = useNavigate();
  const employerRole = getEmployerRole();
  const session = getSession();
  const [refreshKey, setRefreshKey] = useState(0);
  const cases = useMemo(() => getMarketingCases(), [refreshKey]);
  const employees = useMemo(() => getEmployees(), [refreshKey]);
  const recruiters = getTeamMembers()
    .filter((member) => member.entity === session.entity && ['Recruiter', 'Lead Recruiter'].includes(member.role) && member.status !== 'Inactive')
    .map((member) => member.name);
  const [assignmentDrafts, setAssignmentDrafts] = useState({});

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

  const canManageAssignments = ['lead_recruiter', 'admin', 'superadmin'].includes(employerRole);

  const assignToRecruiter = (row, recruiterName) => {
    if (!row.caseId || !recruiterName) return;
    assignMarketingCase(row.caseId, recruiterName);
    setRefreshKey((value) => value + 1);
  };

  return (
    <PortalLayout role="employer">
      <PageHeader
        eyebrow="Recruiter phase"
        title="Marketing"
        description="Compact marketing queue for bench employees. Lead Recruiter can assign or reassign ownership, while recruiters work the tracker inside each employee marketing detail."
      />

      <div className="table-wrap card compact-table-card">
        <table className="tracker-table">
          <thead>
            <tr>
              <th>Employee</th><th>Status</th><th>Recruiter</th><th>Bench Start</th><th>Skills</th><th>Queue</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {queueRows.map((row) => (
              <tr key={row.employeeId}>
                <td><strong>{row.name}</strong><div className="subtle">{row.summary}</div></td>
                <td><span className={`status-pill ${row.queueStatus === 'Assigned' ? 'status-pending' : 'status-active'}`}>{row.status}</span></td>
                <td>
                  {canManageAssignments ? (
                    <div className="compact-inline-grid">
                      <select
                        className="compact-width"
                        value={assignmentDrafts[row.employeeId] ?? row.recruiter}
                        onChange={(e) => setAssignmentDrafts((prev) => ({ ...prev, [row.employeeId]: e.target.value }))}
                      >
                        <option value="">Open / Unassigned</option>
                        {recruiters.map((item) => <option key={item}>{item}</option>)}
                      </select>
                      <button className="button button-secondary slim-button" onClick={() => assignToRecruiter(row, assignmentDrafts[row.employeeId] ?? row.recruiter)}>
                        {row.recruiter ? 'Reassign' : 'Assign'}
                      </button>
                    </div>
                  ) : (
                    row.recruiter || 'Open / Unassigned'
                  )}
                </td>
                <td>{row.benchStart || 'N/A'}</td>
                <td>{row.skills || 'Pending profile'}</td>
                <td>{row.queueStatus === 'Assigned' ? 'Owned tracker' : 'Shared queue'}</td>
                <td>
                  {row.caseId ? (
                    <button className="button button-secondary slim-button" onClick={() => navigate(`/employer/marketing/${row.caseId}`)}>
                      Open Tracker
                    </button>
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
