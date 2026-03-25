import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PortalLayout from '../layouts/PortalLayout';
import PageHeader from '../components/PageHeader';
import Icon from '../components/Icon';
import { addEmployee, getEmployees, getEntities } from '../services/portalStore';
import { canCreateEmployees, getEmployerRole } from '../services/session';

const emptyForm = {
  name: '', email: '', phone: '', joiningDate: '', department: 'Engineering', entity: 'GxP Consulting', manager: '', hr: '', recruiter: '', priority: 'Medium', skills: '', resumeVersion: '', employmentType: 'Contractor', location: '',
};

export default function EmployeeDirectoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const employees = getEmployees();
  const role = getEmployerRole();

  const query = searchParams.get('q') ?? '';
  const status = searchParams.get('status') ?? 'All';
  const entity = searchParams.get('entity') ?? 'All';
  const recruiter = searchParams.get('recruiter') ?? 'All';
  const hr = searchParams.get('hr') ?? 'All';
  const priority = searchParams.get('priority') ?? 'All';
  const showAdvanced = searchParams.get('filters') === 'open';

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'All') next.delete(key); else next.set(key, value);
    setSearchParams(next);
  };

  const rows = useMemo(() => employees.filter((row) => {
    const text = `${row.name} ${row.email} ${row.department} ${row.entity} ${row.recruiter} ${row.hr} ${row.status}`.toLowerCase();
    return text.includes(query.toLowerCase())
      && (status === 'All' || row.status === status)
      && (entity === 'All' || row.entity === entity)
      && (recruiter === 'All' || (row.recruiter || 'Unassigned') === recruiter)
      && (hr === 'All' || row.hr === hr)
      && (priority === 'All' || row.priority === priority);
  }), [employees, query, status, entity, recruiter, hr, priority]);

  const recruiters = ['All', ...new Set(employees.map((e) => e.recruiter || 'Unassigned'))];
  const hrs = ['All', ...new Set(employees.map((e) => e.hr || 'Unassigned'))];
  const activeFiltersCount = [status !== 'All', entity !== 'All', recruiter !== 'All', hr !== 'All', priority !== 'All', query !== ''].filter(Boolean).length;

  const submitEmployee = () => {
    if (!form.name || !form.email) return;
    addEmployee(form);
    setDialogOpen(false);
    setForm(emptyForm);
  };

  return (
    <PortalLayout role="employer">
      <PageHeader
        eyebrow="Entity workforce"
        title="Employee"
        description="Entity-scoped employee directory with multi-field search, recruiter/HR ownership visibility, and role-based creation controls."
        actions={canCreateEmployees() ? <button className="button" onClick={() => setDialogOpen(true)}>New Employee</button> : null}
      />

      <div className="card toolbar-card filter-section">
        <div className="filter-header">
          <div className="search-bar">
            <div className="input-with-icon">
              <span className="icon"><Icon name="employees" /></span>
              <input value={query} onChange={(e) => updateParam('q', e.target.value)} placeholder="Search employee, skill owner, recruiter, HR, or status" />
            </div>
          </div>
          <div className="filter-actions">
            <button className="filter-toggle" onClick={() => updateParam('filters', showAdvanced ? '' : 'open')}>
              <Icon name="settings" /> Filters {activeFiltersCount > 0 && <span className="filter-badge">{activeFiltersCount}</span>}
            </button>
            {activeFiltersCount > 0 && <button className="clear-filters" onClick={() => setSearchParams({})}>Clear all</button>}
          </div>
        </div>

        {showAdvanced && (
          <div className="filter-grid advanced-filters">
            <div className="filter-group"><label>Status</label><select value={status} onChange={(e) => updateParam('status', e.target.value)}><option>All</option><option>BENCH-NEW</option><option>BENCH</option><option>ONBOARDED</option><option>EXIT</option></select></div>
            <div className="filter-group"><label>Entity</label><select value={entity} onChange={(e) => updateParam('entity', e.target.value)}><option>All</option>{getEntities().map((item) => <option key={item.id}>{item.name}</option>)}</select></div>
            <div className="filter-group"><label>Recruiter</label><select value={recruiter} onChange={(e) => updateParam('recruiter', e.target.value)}>{recruiters.map((item) => <option key={item}>{item}</option>)}</select></div>
            <div className="filter-group"><label>HR</label><select value={hr} onChange={(e) => updateParam('hr', e.target.value)}>{hrs.map((item) => <option key={item}>{item}</option>)}</select></div>
            <div className="filter-group"><label>Priority</label><select value={priority} onChange={(e) => updateParam('priority', e.target.value)}><option>All</option><option>High</option><option>Medium</option><option>Low</option></select></div>
          </div>
        )}
      </div>

      <div className="table-wrap card">
        <table>
          <thead>
            <tr>
              <th>Employee</th><th>Status</th><th>Entity</th><th>Recruiter</th><th>HR</th><th>Priority</th><th>Bench Start</th><th>Resume</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td><strong>{row.name}</strong><div className="subtle">{row.email}</div></td>
                <td><span className={`status-pill ${row.status === 'ONBOARDED' ? 'status-active' : row.status === 'EXIT' ? 'status-ended' : 'status-pending'}`}>{row.status}</span></td>
                <td><span className="badge readable-badge">{row.entity}</span></td>
                <td>{row.recruiter || 'Unassigned'}</td>
                <td>{row.hr || 'Unassigned'}</td>
                <td>{row.priority}</td>
                <td>{row.benchStart || '—'}</td>
                <td>{row.resumeVersion}</td>
                <td><button className="button button-secondary slim-button" onClick={() => navigate(`/employer/employees/${row.id}`)}>Details</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {dialogOpen && (
        <div className="dialog-backdrop" onClick={() => setDialogOpen(false)}>
          <div className="dialog-card onboarding-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-head">
              <div>
                <span className="section-kicker">Employee creation</span>
                <h3>New Employee</h3>
                <p>Available only to Super Admin, Admin, and HR. Recruiters cannot create employees from this page.</p>
              </div>
              <button className="dialog-close" onClick={() => setDialogOpen(false)}>×</button>
            </div>
            <div className="card onboarding-form-card dialog-form-surface">
              <div className="form-grid-2">
                <div><label>Full Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><label>Email</label><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div><label>Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div><label>Joining Date</label><input type="date" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} /></div>
                <div><label>Department</label><input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
                <div><label>Entity</label><select value={form.entity} onChange={(e) => setForm({ ...form, entity: e.target.value })}>{getEntities().map((item) => <option key={item.id}>{item.name}</option>)}</select></div>
                <div><label>HR Owner</label><input value={form.hr} onChange={(e) => setForm({ ...form, hr: e.target.value })} /></div>
                <div><label>Recruiter</label><input value={form.recruiter} onChange={(e) => setForm({ ...form, recruiter: e.target.value })} /></div>
                <div><label>Priority</label><select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}><option>High</option><option>Medium</option><option>Low</option></select></div>
                <div><label>Skills</label><input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="Java, Spring Boot, Kafka" /></div>
                <div><label>Resume File</label><input value={form.resumeVersion} onChange={(e) => setForm({ ...form, resumeVersion: e.target.value })} placeholder="Resume_v1.pdf" /></div>
                <div><label>Location</label><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
              </div>
              <div className="dialog-actions top-gap">
                <button className="button button-secondary" onClick={() => setDialogOpen(false)}>Cancel</button>
                <button className="button" onClick={submitEmployee}>Save Employee</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
