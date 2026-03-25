import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import PortalLayout from '../layouts/PortalLayout';
import PageHeader from '../components/PageHeader';
import DocumentsPanel from '../components/DocumentsPanel';
import { apiPlaceholders } from '../services/apiPlaceholders';
import {
  addDocument,
  getClients,
  getDocuments,
  getEmployees,
  getEntities,
  updateEmployeeAssignment,
  updateEmployeeRecord,
} from '../services/portalStore';
import { getEmployerRole } from '../services/session';

const departmentOptions = ['Engineering', 'QA', 'HR', 'Finance', 'Frontend', 'Data Engineering'];

function buildEmployeeForm(employee) {
  return {
    name: employee.name,
    email: employee.email ?? '',
    phone: employee.phone ?? '',
    location: employee.location ?? '',
    status: employee.status,
    manager: employee.reportingTo ?? employee.manager ?? '',
    reportingEmail: employee.reportingEmail ?? '',
    hr: employee.hr ?? '',
    entity: employee.entity ?? '',
    role: employee.role ?? 'Employee',
    department: employee.department ?? 'Engineering',
    employmentType: employee.employmentType ?? 'Full-time',
    joined: employee.joined ?? '',
    client: employee.client ?? 'Bench',
  };
}

const fallbackHistory = (employee) => ([
  { client: employee.client, project: employee.department, fromDate: employee.joined, toDate: '', status: employee.status === 'ONBOARDED' ? 'Active' : 'Completed' },
]);

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const role = getEmployerRole();
  const canManageEmployeeAssignments = role === 'admin' || role === 'superadmin' || role === 'hr';

  const employees = useMemo(() => getEmployees(), []);
  const initialEmployee = useMemo(() => employees.find((item) => String(item.id) === String(id)), [employees, id]);

  const [employee, setEmployee] = useState(initialEmployee);
  const [editMode, setEditMode] = useState(false);
  const [employeeForm, setEmployeeForm] = useState(() => initialEmployee ? buildEmployeeForm(initialEmployee) : null);
  const [assignmentOpen, setAssignmentOpen] = useState(searchParams.get('openAssignment') === '1');

  const managerOptions = useMemo(() => [...new Set(getEmployees().map((item) => item.manager).filter(Boolean))], []);
  const hrOptions = useMemo(() => [...new Set(getEmployees().map((item) => item.hr).filter(Boolean))], []);
  const entityOptions = getEntities().map((item) => item.name);
  const clientDirectory = getClients().map((item) => item.name);

  const activeAssignment = employee?.currentAssignments?.[0] || null;
  const [assignmentForm, setAssignmentForm] = useState({
    action: 'extend',
    client: activeAssignment?.client || '',
    project: activeAssignment?.project || employee?.department || '',
    startDate: activeAssignment?.startDate || '',
    endDate: activeAssignment?.endDate || '',
    previousEndDate: '',
    effectiveDate: '',
    allocation: activeAssignment?.allocation || '100%',
  });

  useEffect(() => {
    const open = searchParams.get('openAssignment') === '1';
    setAssignmentOpen(open);
  }, [searchParams]);

  useEffect(() => {
    if (!employee) return;
    setEmployeeForm(buildEmployeeForm(employee));
    const current = employee.currentAssignments?.[0];
    setAssignmentForm({
      action: current ? 'extend' : 'assign',
      client: current?.client || '',
      project: current?.project || employee.department || '',
      startDate: current?.startDate || '',
      endDate: current?.endDate || '',
      previousEndDate: '',
      effectiveDate: '',
      allocation: current?.allocation || '100%',
    });
  }, [employee]);

  if (!employee || !employeeForm) {
    return (
      <PortalLayout role="employer">
        <PageHeader title="Employee not found" description="The requested employee could not be located." actions={<button className="button button-secondary" onClick={() => navigate('/employer/employees')}>Back to All Employees</button>} />
      </PortalLayout>
    );
  }

  const personalInfo = [
    ['Employee Name', 'name', 'text'],
    ['Employee ID', 'employeeCode', 'text'],
    ['Email', 'email', 'text'],
    ['Phone', 'phone', 'text'],
    ['Location', 'location', 'text'],
    ['Status', 'status', 'select', ['BENCH-NEW', 'BENCH', 'ONBOARDED', 'EXIT']],
  ];

  const reportingInfo = [
    ['Manager', 'manager', 'select', managerOptions],
    ['Manager Email', 'reportingEmail', 'text'],
    ['HR Contact', 'hr', 'select', hrOptions],
    ['Entity', 'entity', 'select', entityOptions],
  ];

  const employmentInfo = [
    ['Role', 'role', 'text'],
    ['Department', 'department', 'select', departmentOptions],
    ['Employment Type', 'employmentType', 'select', ['Full-time', 'Part-time', 'Contractor']],
    ['Joined', 'joined', 'date'],
    ['Primary Client', 'client', 'select', ['Bench', ...clientDirectory]],
  ];

  const currentAssignments = employee.currentAssignments?.length ? employee.currentAssignments : [];
  const history = employee.assignmentHistory?.length ? employee.assignmentHistory : fallbackHistory(employee);
  const docs = getDocuments('employee', employee.id);

  const closeAssignmentModal = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('openAssignment');
    setSearchParams(next);
  };

  const renderEditableField = (label, key, type = 'text', options = []) => {
    const rawValue = key === 'employeeCode' ? (employee.employeeCode ?? `ASH-EMP-${String(employee.id).padStart(3, '0')}`) : employeeForm[key];
    if (!editMode || key === 'employeeCode') return <strong className="detail-strong">{rawValue || 'N/A'}</strong>;
    if (type === 'select') {
      return (
        <select value={rawValue} aria-label={label} onChange={(e) => setEmployeeForm((prev) => ({ ...prev, [key]: e.target.value }))}>
          {options.map((option) => <option key={option}>{option}</option>)}
        </select>
      );
    }
    return (
      <input
        value={rawValue}
        aria-label={label}
        type={type === 'date' ? 'date' : 'text'}
        onChange={(e) => setEmployeeForm((prev) => ({ ...prev, [key]: e.target.value }))}
      />
    );
  };

  const saveEmployeeDetails = () => {
    const updated = updateEmployeeRecord(employee.id, {
      name: employeeForm.name,
      email: employeeForm.email,
      phone: employeeForm.phone,
      location: employeeForm.location,
      status: employeeForm.status,
      manager: employeeForm.manager,
      reportingTo: employeeForm.manager,
      reportingEmail: employeeForm.reportingEmail,
      hr: employeeForm.hr,
      entity: employeeForm.entity,
      role: employeeForm.role,
      department: employeeForm.department,
      employmentType: employeeForm.employmentType,
      joined: employeeForm.joined,
      client: employeeForm.client,
    });
    if (!updated) return;
    setEmployee(updated);
    setEditMode(false);
  };

  const saveAssignmentChange = () => {
    const updated = updateEmployeeAssignment(employee.id, assignmentForm);
    if (!updated) return;
    setEmployee(updated);
    closeAssignmentModal();
  };

  const assignmentDescription = assignmentForm.action === 'bench'
    ? 'End the current client assignment and move the employee to Bench so they appear in Marketing.'
    : assignmentForm.action === 'extend'
      ? 'Extend the current client assignment with a new expiry date. The employee stays onboarded to the same client.'
      : 'Move the employee to a different client. The previous client assignment is end-dated and only one active client remains.';

  return (
    <PortalLayout role="employer">
      <PageHeader
        title={employee.name}
        description="Detailed employee view with personal information, reporting structure, active assignment control, and client history."
        actions={(
          <div className="page-actions-wrap">
            <button className={`button button-secondary ${editMode ? 'is-active-action' : ''}`} onClick={() => setEditMode((prev) => !prev)}>
              {editMode ? 'Stop Editing' : 'Edit Details'}
            </button>
            {editMode ? <button className="button" onClick={saveEmployeeDetails}>Save Details</button> : null}
            {canManageEmployeeAssignments ? <button className="button" onClick={() => setSearchParams(new URLSearchParams({ openAssignment: '1' }))}>Modify Assignment</button> : null}
            <button className="button button-secondary" onClick={() => navigate('/employer/employees')}>Back to All Employees</button>
          </div>
        )}
      />

      <div className="employee-section-stack">
        <section className="card section-card">
          <div className="section-head with-inline-action">
            <div>
              <span className="section-kicker">Employee Record</span>
              <h3>Personal Information</h3>
            </div>
            <span className="badge readable-badge">{editMode ? 'Edit mode on' : 'View mode'}</span>
          </div>
          <div className="simple-grid employee-detail-grid">
            {personalInfo.map(([label, key, type, options]) => (
              <div className="card info-card" key={label}>
                <div className="subtle">{label}</div>
                {renderEditableField(label, key, type, options)}
              </div>
            ))}
          </div>
        </section>

        <section className="card section-card">
          <div className="section-head">
            <span className="section-kicker">Who manages this employee</span>
            <h3>Reporting Details</h3>
          </div>
          <div className="simple-grid employee-detail-grid compact-tiles">
            {reportingInfo.map(([label, key, type, options]) => (
              <div className="card info-card" key={label}>
                <div className="subtle">{label}</div>
                {renderEditableField(label, key, type, options)}
              </div>
            ))}
          </div>
        </section>

        <section className="card section-card">
          <div className="section-head with-inline-action">
            <div>
              <span className="section-kicker">Current employment setup</span>
              <h3>Employment & Client Information</h3>
            </div>
            {canManageEmployeeAssignments ? <button className="button button-secondary slim-button" onClick={() => setSearchParams(new URLSearchParams({ openAssignment: '1' }))}>Modify Assignment</button> : null}
          </div>
          <div className="simple-grid employee-detail-grid compact-tiles">
            {employmentInfo.map(([label, key, type, options]) => (
              <div className="card info-card" key={label}>
                <div className="subtle">{label}</div>
                {renderEditableField(label, key, type, options)}
              </div>
            ))}
          </div>

          <div className="assignment-card-grid">
            {currentAssignments.length ? currentAssignments.map((assignment, index) => (
              <div className="assignment-card" key={`${assignment.client}-${index}`}>
                <div className="assignment-card-head">
                  <div>
                    <strong>{assignment.client}</strong>
                    <p>{assignment.project}</p>
                  </div>
                  <span className="status-pill status-active">{assignment.status}</span>
                </div>
                <div className="assignment-meta-grid">
                  <div><span>Start Date</span><strong>{assignment.startDate}</strong></div>
                  <div><span>End Date</span><strong>{assignment.endDate || 'Open'}</strong></div>
                  <div><span>Allocation</span><strong>{assignment.allocation}</strong></div>
                </div>
              </div>
            )) : (
              <div className="card info-card">
                <strong>No active client assignment</strong>
                <p className="subtle">Employee is currently on Bench and available for Marketing.</p>
              </div>
            )}
          </div>
        </section>

        <section className="card section-card">
          <div className="section-head">
            <span className="section-kicker">Client movement and previous assignments</span>
            <h3>Historical Assignment Data</h3>
          </div>
          <div className="table-wrap history-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Project / Function</th>
                  <th>From Date</th>
                  <th>To Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row, index) => (
                  <tr key={`${row.client}-${index}`}>
                    <td><strong>{row.client}</strong></td>
                    <td>{row.project}</td>
                    <td>{row.fromDate}</td>
                    <td>{row.toDate || 'Current'}</td>
                    <td><span className={`status-pill ${row.toDate ? 'status-ended' : 'status-active'}`}>{row.toDate ? 'Ended' : 'Active'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <DocumentsPanel
          title="Employee Documents"
          documents={docs}
          listEndpoint={apiPlaceholders.employer.employeeDocuments.replace(':id', employee.id)}
          uploadEndpoint={apiPlaceholders.employer.uploadEmployeeDocument.replace(':id', employee.id)}
          onAdd={(draft) => addDocument('employee', employee.id, { ...draft, uploadedBy: 'Employer Admin' })}
        />
      </div>

      {assignmentOpen && canManageEmployeeAssignments && (
        <div className="dialog-backdrop" onClick={closeAssignmentModal}>
          <div className="dialog-card assignment-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-head">
              <div>
                <span className="section-kicker">Assignment update</span>
                <h3>Modify Assignment</h3>
                <p>{assignmentDescription}</p>
              </div>
              <button className="dialog-close" onClick={closeAssignmentModal} aria-label="Close modify assignment dialog">&times;</button>
            </div>

            <div className="form-grid-2 dialog-form-grid">
              <div className="form-group">
                <label htmlFor="assign-action">Action</label>
                <select id="assign-action" value={assignmentForm.action} onChange={(e) => setAssignmentForm((prev) => ({ ...prev, action: e.target.value }))}>
                  {activeAssignment ? <option value="extend">Extend Current Assignment</option> : null}
                  {activeAssignment ? <option value="bench">Move Employee To Bench</option> : null}
                  <option value="assign">{activeAssignment ? 'Change Client Assignment' : 'Assign To Client'}</option>
                </select>
              </div>
              <div className="form-group form-group-note">
                <label>Rule</label>
                <div className="helper-note-box">
                  Employee can have only one active client assignment at a time. Changing client end-dates the old assignment automatically.
                </div>
              </div>

              {assignmentForm.action === 'extend' && activeAssignment ? (
                <>
                  <div className="form-group">
                    <label htmlFor="assign-client">Current Client</label>
                    <input id="assign-client" value={activeAssignment.client} readOnly />
                  </div>
                  <div className="form-group">
                    <label htmlFor="assign-project">Project / Function</label>
                    <input id="assign-project" value={activeAssignment.project} readOnly />
                  </div>
                  <div className="form-group">
                    <label htmlFor="assign-start">Start Date</label>
                    <input id="assign-start" type="date" value={activeAssignment.startDate} readOnly />
                  </div>
                  <div className="form-group">
                    <label htmlFor="assign-end">New Expiry Date</label>
                    <input id="assign-end" type="date" value={assignmentForm.endDate} onChange={(e) => setAssignmentForm((prev) => ({ ...prev, endDate: e.target.value }))} />
                  </div>
                </>
              ) : null}

              {assignmentForm.action === 'bench' && activeAssignment ? (
                <>
                  <div className="form-group">
                    <label htmlFor="assign-client">Ending Client</label>
                    <input id="assign-client" value={activeAssignment.client} readOnly />
                  </div>
                  <div className="form-group">
                    <label htmlFor="assign-project">Project / Function</label>
                    <input id="assign-project" value={activeAssignment.project} readOnly />
                  </div>
                  <div className="form-group">
                    <label htmlFor="assign-effective">Assignment End Date</label>
                    <input id="assign-effective" type="date" value={assignmentForm.effectiveDate} onChange={(e) => setAssignmentForm((prev) => ({ ...prev, effectiveDate: e.target.value }))} />
                  </div>
                  <div className="form-group form-group-note">
                    <label>Outcome</label>
                    <div className="helper-note-box">
                      Employee status will move to `BENCH` and the employee will appear in the Marketing dashboard queue.
                    </div>
                  </div>
                </>
              ) : null}

              {assignmentForm.action === 'assign' ? (
                <>
                  <div className="form-group">
                    <label htmlFor="assign-client">Client</label>
                    <select id="assign-client" value={assignmentForm.client} onChange={(e) => setAssignmentForm((prev) => ({ ...prev, client: e.target.value }))}>
                      <option value="">Select client</option>
                      {clientDirectory.map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="assign-project">Project / Function</label>
                    <input id="assign-project" value={assignmentForm.project} onChange={(e) => setAssignmentForm((prev) => ({ ...prev, project: e.target.value }))} placeholder="Example: Provider Portal Support" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="assign-start">Start Date</label>
                    <input id="assign-start" type="date" value={assignmentForm.startDate} onChange={(e) => setAssignmentForm((prev) => ({ ...prev, startDate: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="assign-end">Assignment Expiry Date</label>
                    <input id="assign-end" type="date" value={assignmentForm.endDate} onChange={(e) => setAssignmentForm((prev) => ({ ...prev, endDate: e.target.value }))} />
                  </div>
                  {activeAssignment ? (
                    <div className="form-group">
                      <label htmlFor="assign-prev-end">Previous Assignment End Date</label>
                      <input id="assign-prev-end" type="date" value={assignmentForm.previousEndDate} onChange={(e) => setAssignmentForm((prev) => ({ ...prev, previousEndDate: e.target.value }))} />
                    </div>
                  ) : null}
                  <div className="form-group">
                    <label htmlFor="assign-allocation">Allocation</label>
                    <select id="assign-allocation" value={assignmentForm.allocation} onChange={(e) => setAssignmentForm((prev) => ({ ...prev, allocation: e.target.value }))}>
                      <option>25%</option>
                      <option>50%</option>
                      <option>75%</option>
                      <option>100%</option>
                    </select>
                  </div>
                </>
              ) : null}
            </div>

            <div className="dialog-actions">
              <button className="button button-secondary" onClick={closeAssignmentModal}>Cancel</button>
              <button className="button" onClick={saveAssignmentChange}>Save Assignment</button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
