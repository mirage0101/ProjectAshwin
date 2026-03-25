import { useMemo, useState } from 'react';
import PortalLayout from '../layouts/PortalLayout';
import PageHeader from '../components/PageHeader';
import { addTeamMember, getEntities, getTeamMembers, updateTeamMember } from '../services/portalStore';
import { getEmployerRole, getSession } from '../services/session';

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  role: 'Recruiter',
  entity: '',
  status: 'Active',
  department: 'Operations',
  manager: '',
  location: '',
  startDate: '',
  notes: '',
};

function buildDetailForm(row) {
  return {
    name: row?.name || '',
    role: row?.role || 'Recruiter',
    entity: row?.entity || '',
    status: row?.status || 'Active',
    email: row?.email || '',
    phone: row?.phone || '',
    department: row?.department || (row?.role === 'HR' ? 'Human Resources' : row?.role?.includes('Recruiter') ? 'Recruitment' : 'Operations'),
    manager: row?.manager || (row?.role === 'Super Admin' ? 'Executive Leadership' : 'Ava Reynolds'),
    location: row?.location || '',
    startDate: row?.startDate || '2026-01-01',
    endDate: row?.endDate || '',
    notes: row?.notes || `${row?.role || 'Team member'} profile for ${row?.entity || 'current entity'}.`,
  };
}

export default function TeamPage() {
  const role = getEmployerRole();
  const session = getSession();
  const canManageTeam = role === 'superadmin' || role === 'admin';
  const entities = getEntities();
  const defaultEntity = entities.some((item) => item.name === session.entity)
    ? session.entity
    : entities[0]?.name || 'GxP Consulting';
  const [rows, setRows] = useState(() => getTeamMembers());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailRow, setDetailRow] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [detailForm, setDetailForm] = useState(() => buildDetailForm(null));
  const [form, setForm] = useState(() => ({ ...emptyForm, entity: defaultEntity }));

  const visibleRows = useMemo(() => {
    if (role === 'superadmin') return rows;
    return rows.filter((row) => row.entity === session.entity);
  }, [role, rows, session.entity]);

  const submitTeamMember = () => {
    if (!form.name || !form.email) return;
    const created = addTeamMember(form);
    setRows((prev) => [...prev, created]);
    setDialogOpen(false);
    setForm({ ...emptyForm, entity: defaultEntity });
  };

  const openCreateDialog = () => {
    setForm({ ...emptyForm, entity: defaultEntity });
    setDialogOpen(true);
  };

  const openDetailDialog = (row) => {
    setDetailRow(row);
    setDetailForm(buildDetailForm(row));
    setEditMode(false);
  };

  const closeDetailDialog = () => {
    setDetailRow(null);
    setEditMode(false);
    setDetailForm(buildDetailForm(null));
  };

  const renderStatusClass = (status) => {
    if (status === 'Active') return 'status-active';
    if (status === 'Inactive') return 'status-ended';
    return 'status-pending';
  };

  const markMemberInactive = () => {
    if (!detailRow) return;
    const today = new Date().toISOString().slice(0, 10);
    const updated = updateTeamMember(detailRow.id, {
      status: 'Inactive',
      endDate: today,
      notes: detailRow.notes
        ? `${detailRow.notes} Soft-ended on ${today}.`
        : `Soft-ended on ${today}.`,
    });
    if (!updated) return;
    setRows((prev) => prev.map((row) => String(row.id) === String(detailRow.id) ? updated : row));
    setDetailRow(updated);
    setDetailForm(buildDetailForm(updated));
  };

  const saveTeamMember = () => {
    if (!detailRow || !detailForm.name || !detailForm.email) return;
    const patch = {
      name: detailForm.name,
      role: detailForm.role,
      entity: detailForm.entity,
      status: detailForm.status,
      email: detailForm.email,
      phone: detailForm.phone,
      department: detailForm.department,
      manager: detailForm.manager,
      location: detailForm.location,
      startDate: detailForm.startDate,
      endDate: detailForm.endDate,
      notes: detailForm.notes,
    };
    const updated = updateTeamMember(detailRow.id, patch);
    if (!updated) return;
    setRows((prev) => prev.map((row) => String(row.id) === String(detailRow.id) ? updated : row));
    setDetailRow(updated);
    setDetailForm(buildDetailForm(updated));
    setEditMode(false);
  };

  const selectedMember = detailRow ? buildDetailForm(detailRow) : null;

  return (
    <PortalLayout role="employer">
      <PageHeader
        title="Team"
        description={canManageTeam
          ? 'Manage Admin, HR, and recruiting users for the current employer structure. Admin and Super Admin can review team-member details and create new users from this screen.'
          : 'Employer tree across Admin, Lead Recruiter, Recruiter, and HR roles within the current entity.'}
        actions={canManageTeam ? <button className="button" onClick={openCreateDialog}>New Team Member</button> : null}
      />
      <div className="table-wrap card">
        <table>
          <thead><tr><th>Name</th><th>Role</th><th>Entity</th><th>Status</th><th>Email</th>{canManageTeam ? <th>Action</th> : null}</tr></thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.id}>
                <td><strong>{row.name}</strong></td>
                <td>{row.role}</td>
                <td>{row.entity}</td>
                <td><span className={`status-pill ${renderStatusClass(row.status)}`}>{row.status}</span></td>
                <td>{row.email}</td>
                {canManageTeam ? <td><button className="button button-secondary slim-button" onClick={() => openDetailDialog(row)}>Details</button></td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedMember && (
        <div className="dialog-backdrop" onClick={closeDetailDialog}>
          <div className="dialog-card onboarding-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-head">
              <div>
                <span className="section-kicker">Team member profile</span>
                <h3>{selectedMember.name}</h3>
                <p>Review role assignment and contact details for this employer-side team member.</p>
              </div>
              <button className="dialog-close" onClick={closeDetailDialog}>&times;</button>
            </div>
            <div className="card onboarding-form-card dialog-form-surface">
              <div className="form-grid-2">
                <div><label>Full Name</label><input value={editMode ? detailForm.name : selectedMember.name} onChange={(e) => setDetailForm({ ...detailForm, name: e.target.value })} readOnly={!editMode} /></div>
                <div><label>Role</label>{editMode ? <select value={detailForm.role} onChange={(e) => setDetailForm({ ...detailForm, role: e.target.value })}><option>Super Admin</option><option>Admin</option><option>Lead Recruiter</option><option>Recruiter</option><option>HR</option></select> : <input value={selectedMember.role} readOnly />}</div>
                <div><label>Status</label>{editMode ? <select value={detailForm.status} onChange={(e) => setDetailForm({ ...detailForm, status: e.target.value })}><option>Active</option><option>Inactive</option><option>Pending</option></select> : <input value={selectedMember.status} readOnly />}</div>
                <div><label>Entity</label>{editMode ? <select value={detailForm.entity} onChange={(e) => setDetailForm({ ...detailForm, entity: e.target.value })} disabled={role !== 'superadmin'}>{entities.map((item) => <option key={item.id}>{item.name}</option>)}</select> : <input value={selectedMember.entity} readOnly />}</div>
                <div><label>Department</label><input value={editMode ? detailForm.department : selectedMember.department} onChange={(e) => setDetailForm({ ...detailForm, department: e.target.value })} readOnly={!editMode} /></div>
                <div><label>Email</label><input value={editMode ? detailForm.email : selectedMember.email} onChange={(e) => setDetailForm({ ...detailForm, email: e.target.value })} readOnly={!editMode} /></div>
                <div><label>Phone</label><input value={editMode ? detailForm.phone : selectedMember.phone} onChange={(e) => setDetailForm({ ...detailForm, phone: e.target.value })} readOnly={!editMode} /></div>
                <div><label>Manager</label><input value={editMode ? detailForm.manager : selectedMember.manager} onChange={(e) => setDetailForm({ ...detailForm, manager: e.target.value })} readOnly={!editMode} /></div>
                <div><label>Location</label><input value={editMode ? detailForm.location : selectedMember.location} onChange={(e) => setDetailForm({ ...detailForm, location: e.target.value })} readOnly={!editMode} /></div>
                <div><label>Start Date</label><input type={editMode ? 'date' : 'text'} value={editMode ? detailForm.startDate : selectedMember.startDate} onChange={(e) => setDetailForm({ ...detailForm, startDate: e.target.value })} readOnly={!editMode} /></div>
                <div><label>End Date</label><input type={editMode ? 'date' : 'text'} value={editMode ? detailForm.endDate : (selectedMember.endDate || 'Still active')} onChange={(e) => setDetailForm({ ...detailForm, endDate: e.target.value })} readOnly={!editMode} /></div>
                <div className="grid-span-2"><label>Notes</label><textarea rows="4" value={editMode ? detailForm.notes : selectedMember.notes} onChange={(e) => setDetailForm({ ...detailForm, notes: e.target.value })} readOnly={!editMode} /></div>
              </div>
              <div className="dialog-actions top-gap">
                {canManageTeam && !editMode ? <button className="button button-secondary" onClick={() => setEditMode(true)}>Edit Details</button> : null}
                {canManageTeam && editMode ? <button className="button" onClick={saveTeamMember}>Save Changes</button> : null}
                {canManageTeam && editMode ? <button className="button button-secondary" onClick={() => { setDetailForm(buildDetailForm(detailRow)); setEditMode(false); }}>Cancel Edit</button> : null}
                {canManageTeam && selectedMember.status !== 'Inactive' ? <button className="button" onClick={markMemberInactive}>Mark Inactive</button> : null}
                <button className="button button-secondary" onClick={closeDetailDialog}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {dialogOpen && (
        <div className="dialog-backdrop" onClick={() => setDialogOpen(false)}>
          <div className="dialog-card onboarding-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-head">
              <div>
                <span className="section-kicker">Team management</span>
                <h3>New Team Member</h3>
                <p>Create HR, Recruiter, Lead Recruiter, Admin, or Super Admin users from the Team screen.</p>
              </div>
              <button className="dialog-close" onClick={() => setDialogOpen(false)}>&times;</button>
            </div>
            <div className="card onboarding-form-card dialog-form-surface">
              <div className="form-grid-2">
                <div><label>Full Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><label>Email</label><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div><label>Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div><label>Role</label><select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option>Super Admin</option><option>Admin</option><option>Lead Recruiter</option><option>Recruiter</option><option>HR</option></select></div>
                <div><label>Entity</label><select value={form.entity} onChange={(e) => setForm({ ...form, entity: e.target.value })} disabled={role !== 'superadmin'}>{entities.map((item) => <option key={item.id}>{item.name}</option>)}</select></div>
                <div><label>Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>Active</option><option>Inactive</option><option>Pending</option></select></div>
                <div><label>Department</label><input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
                <div><label>Manager</label><input value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })} /></div>
                <div><label>Location</label><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
                <div><label>Start Date</label><input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
                <div className="grid-span-2"><label>Notes</label><textarea rows="4" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Responsibilities, coverage, or onboarding notes" /></div>
              </div>
              <div className="dialog-actions top-gap">
                <button className="button button-secondary" onClick={() => setDialogOpen(false)}>Cancel</button>
                <button className="button" onClick={submitTeamMember}>Save Team Member</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
