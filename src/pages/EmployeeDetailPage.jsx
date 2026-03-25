import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import PortalLayout from '../layouts/PortalLayout';
import PageHeader from '../components/PageHeader';
import DocumentsPanel from '../components/DocumentsPanel';
import { apiPlaceholders } from '../services/apiPlaceholders';
import { addDocument, getDocuments, getEmployees, getClients, getEntities } from '../services/portalStore';

const departmentOptions = ['Engineering', 'QA', 'HR', 'Finance'];

const fallbackHistory = (employee) => ([
  { client: employee.client, project: employee.department, fromDate: employee.joined, toDate: '', status: employee.status === 'Active' ? 'Active' : 'Completed' },
]);

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [editMode, setEditMode] = useState(false);
  const [assignmentOpen, setAssignmentOpen] = useState(searchParams.get('openAssignment') === '1');
  const employees = useMemo(() => getEmployees(), []);
  const employee = useMemo(() => employees.find((item) => String(item.id) === String(id)), [employees, id]);

  const managerOptions = useMemo(() => [...new Set(employees.map((item) => item.manager))], [employees]);
  const hrOptions = useMemo(() => [...new Set(employees.map((item) => item.hr))], [employees]);
  const entityOptions = getEntities().map((item) => item.name);
  const clientDirectory = getClients().map((item) => item.name);

  const [assignmentForm, setAssignmentForm] = useState({
    client: employee?.client ?? '',
    project: employee?.department ?? '',
    startDate: '',
    endDate: '',
    allocation: '100%',
  });

  useEffect(() => {
    const open = searchParams.get('openAssignment') === '1';
    setAssignmentOpen(open);
  }, [searchParams]);

  if (!employee) {
    return (
      <PortalLayout role="employer">
        <PageHeader title="Employee not found" description="The requested employee could not be located." actions={<button className="button button-secondary" onClick={() => navigate('/employer/employees')}>Back to All Employees</button>} />
      </PortalLayout>
    );
  }

  const personalInfo = [
    ['Employee Name', employee.name, 'text'],
    ['Employee ID', employee.employeeCode ?? `ASH-EMP-${String(employee.id).padStart(3, '0')}`, 'text'],
    ['Email', employee.email ?? `${employee.name.toLowerCase().replace(/\s+/g, '.')}@ashconsulting.example`, 'text'],
    ['Phone', employee.phone ?? '+1 (555) 010-2400', 'text'],
    ['Location', employee.location ?? 'Tampa, FL', 'text'],
    ['Status', employee.status, 'select', ['Active', 'Inactive']],
  ];

  const reportingInfo = [
    ['Manager', employee.reportingTo ?? employee.manager, 'select', managerOptions],
    ['Manager Email', employee.reportingEmail ?? `${employee.manager.toLowerCase().replace(/\s+/g, '.')}@ashconsulting.example`, 'text'],
    ['HR Contact', employee.hr, 'select', hrOptions],
    ['Entity', employee.entity, 'select', entityOptions],
  ];

  const employmentInfo = [
    ['Role', employee.role, 'text'],
    ['Department', employee.department, 'select', departmentOptions],
    ['Employment Type', employee.employmentType ?? 'Full-time', 'select', ['Full-time', 'Part-time', 'Contractor']],
    ['Joined', employee.joined, 'date'],
    ['Primary Client', employee.client, 'select', clientDirectory],
  ];

  const activeAssignments = employee.currentAssignments?.length ? employee.currentAssignments : [{ client: employee.client, project: employee.department, startDate: employee.joined, endDate: '', allocation: '100%', status: employee.status }];
  const history = employee.assignmentHistory?.length ? employee.assignmentHistory : fallbackHistory(employee);


  const docs = getDocuments('employee', employee.id);

  const closeAssignmentModal = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('openAssignment');
    setSearchParams(next);
  };

  const renderEditableField = (label, value, type = 'text', options = []) => {
    if (!editMode) return <strong className="detail-strong">{value}</strong>;
    if (type === 'select') {
      return (
        <select defaultValue={value} aria-label={label}>
          {options.map((option) => <option key={option}>{option}</option>)}
        </select>
      );
    }
    return <input defaultValue={value} aria-label={label} type={type === 'date' ? 'date' : 'text'} />;
  };

  return (
    <PortalLayout role="employer">
      <PageHeader
        title={employee.name}
        description="Detailed employee view with personal information, reporting structure, active assignments, and client history."
        actions={(
          <div className="page-actions-wrap">
            <button className={`button button-secondary ${editMode ? 'is-active-action' : ''}`} onClick={() => setEditMode((prev) => !prev)}>
              {editMode ? 'Stop Editing' : 'Edit Details'}
            </button>
            <button className="button" onClick={() => setSearchParams(new URLSearchParams({ openAssignment: '1' }))}>Modify Assignment</button>
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
            {personalInfo.map(([label, value, type, options]) => (
              <div className="card info-card" key={label}>
                <div className="subtle">{label}</div>
                {renderEditableField(label, value, type, options)}
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
            {reportingInfo.map(([label, value, type, options]) => (
              <div className="card info-card" key={label}>
                <div className="subtle">{label}</div>
                {renderEditableField(label, value, type, options)}
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
            <button className="button button-secondary slim-button" onClick={() => setSearchParams(new URLSearchParams({ openAssignment: '1' }))}>Modify Assignment</button>
          </div>
          <div className="simple-grid employee-detail-grid compact-tiles">
            {employmentInfo.map(([label, value, type, options]) => (
              <div className="card info-card" key={label}>
                <div className="subtle">{label}</div>
                {renderEditableField(label, value, type, options)}
              </div>
            ))}
          </div>

          <div className="assignment-card-grid">
            {activeAssignments.map((assignment, index) => (
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
            ))}
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

      {assignmentOpen && (
        <div className="dialog-backdrop" onClick={closeAssignmentModal}>
          <div className="dialog-card assignment-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-head">
              <div>
                <span className="section-kicker">Assignment update</span>
                <h3>Modify Assignment</h3>
                <p>Select a new client, define dates, and keep old assignments end-dated in history.</p>
              </div>
              <button className="dialog-close" onClick={closeAssignmentModal} aria-label="Close modify assignment dialog">×</button>
            </div>

            <div className="form-grid-2 dialog-form-grid">
              <div className="form-group">
                <label htmlFor="assign-client">Client</label>
                <select id="assign-client" value={assignmentForm.client} onChange={(e) => setAssignmentForm((prev) => ({ ...prev, client: e.target.value }))}>
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
                <label htmlFor="assign-end">End Date for previous assignment</label>
                <input id="assign-end" type="date" value={assignmentForm.endDate} onChange={(e) => setAssignmentForm((prev) => ({ ...prev, endDate: e.target.value }))} />
              </div>
              <div className="form-group">
                <label htmlFor="assign-allocation">Allocation</label>
                <select id="assign-allocation" value={assignmentForm.allocation} onChange={(e) => setAssignmentForm((prev) => ({ ...prev, allocation: e.target.value }))}>
                  <option>25%</option>
                  <option>50%</option>
                  <option>75%</option>
                  <option>100%</option>
                </select>
              </div>
              <div className="form-group form-group-note">
                <label>Behavior</label>
                <div className="helper-note-box">
                  Employee can be assigned to multiple clients at the same time. Previous assignment can be end-dated while the new one starts.
                </div>
              </div>
            </div>

            <div className="dialog-actions">
              <button className="button button-secondary" onClick={closeAssignmentModal}>Cancel</button>
              <button className="button" onClick={closeAssignmentModal}>Save Assignment</button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
