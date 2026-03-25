import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PortalLayout from '../layouts/PortalLayout';
import PageHeader from '../components/PageHeader';
import Icon from '../components/Icon';
import { addEntity, getEntities } from '../services/portalStore';

const emptyForm = { name: '', legalName: '', address: '', admin: '', email: '', phone: '', region: 'North America', notes: '', documentName: '', documentCategory: '', documentNote: '' };

export default function EntityDirectoryPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { setRows(getEntities()); }, [dialogOpen]);

  const filtered = useMemo(() => rows.filter((row) => `${row.name} ${row.legalName} ${row.admin} ${row.region}`.toLowerCase().includes(query.toLowerCase())), [rows, query]);
  const submit = () => {
    if (!form.name || !form.legalName) return;
    addEntity(form);
    setForm(emptyForm);
    setDialogOpen(false);
    setRows(getEntities());
  };

  return (
    <PortalLayout role="employer">
      <PageHeader
        eyebrow="Super admin workspace"
        title="Entities"
        description="Manage organizational entities, mapped admins, legal details, regional ownership, and activation through onboarding."
        actions={<button className="button" onClick={() => setDialogOpen(true)}>New Entity Onboarding</button>}
      />

      <div className="card toolbar-card filter-section">
        <div className="filter-header">
          <div className="search-bar">
            <div className="input-with-icon">
              <span className="icon"><Icon name="entity" /></span>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search entity, admin owner, region, or legal name" />
            </div>
          </div>
        </div>
      </div>

      <div className="table-wrap card">
        <table>
          <thead>
            <tr><th>Entity</th><th>Status</th><th>Legal Name</th><th>Admin</th><th>Email</th><th>Phone</th><th>Region</th><th>Employees</th><th>Clients</th><th>Action</th></tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id}>
                <td><strong>{row.name}</strong><div className="subtle">{row.address}</div></td>
                <td><span className={`status-pill ${row.status === 'Active' ? 'status-active' : row.status === 'Inactive' ? 'status-ended' : 'status-pending'}`}>{row.status}</span></td>
                <td>{row.legalName}</td><td>{row.admin}</td><td>{row.email}</td><td>{row.phone}</td><td>{row.region}</td><td>{row.employeeCount}</td><td>{row.clientCount}</td>
                <td><button className="button button-secondary slim-button" onClick={() => navigate(`/employer/entities/${row.id}`)}>Details</button></td>
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
                <span className="section-kicker">Entity onboarding workflow</span>
                <h3>New Entity Onboarding</h3>
                <p>Create a new organizational entity, assign its admin owner, and route it through onboarding before activation.</p>
              </div>
              <button className="dialog-close" onClick={() => setDialogOpen(false)} aria-label="Close entity dialog">×</button>
            </div>
            <div className="card onboarding-form-card dialog-form-surface">
              <div className="form-grid-2">
                <div><label>Entity Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ASH APAC" /></div>
                <div><label>Legal Name</label><input value={form.legalName} onChange={(e) => setForm({ ...form, legalName: e.target.value })} placeholder="Legal registered name" /></div>
                <div><label>Admin Owner</label><input value={form.admin} onChange={(e) => setForm({ ...form, admin: e.target.value })} placeholder="Entity administrator" /></div>
                <div><label>Region</label><select value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}><option>North America</option><option>EMEA</option><option>APAC</option><option>LATAM</option></select></div>
                <div><label>Email</label><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="entity-admin@ashconsulting.example" /></div>
                <div><label>Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 (555) 000-0000" /></div>
                <div className="grid-span-2"><label>Address</label><input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Registered address" /></div>
              </div>
              <div className="form-grid-2 top-gap"><div><label>Document Name</label><input value={form.documentName} onChange={(e) => setForm({ ...form, documentName: e.target.value })} placeholder="Entity Registration.pdf" /></div><div><label>Document Category / Note Tag</label><input value={form.documentCategory} onChange={(e) => setForm({ ...form, documentCategory: e.target.value })} placeholder="Registration / Compliance / Banking" /></div></div><div className="form-grid-1 top-gap"><div><label>Notes</label><textarea rows="4" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Registration notes, compliance comments, or onboarding requirements" /></div></div><div className="form-grid-1 top-gap"><div><label>Document Note</label><textarea rows="3" value={form.documentNote} onChange={(e) => setForm({ ...form, documentNote: e.target.value })} placeholder="Free-form note to describe the entity document metadata" /></div></div>
              <div className="dialog-actions top-gap"><button className="button button-secondary" onClick={() => setDialogOpen(false)}>Cancel</button><button className="button" onClick={submit}>Save & Track Onboarding</button></div>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
