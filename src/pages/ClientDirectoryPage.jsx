import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PortalLayout from '../layouts/PortalLayout';
import PageHeader from '../components/PageHeader';
import Icon from '../components/Icon';
import { addClient, getClients, getEntities, getRelationshipMap } from '../services/portalStore';
import { canCreateClientsVendors } from '../services/session';

const emptyForm = {
  name: '', type: 'Client', entity: 'GxP Consulting', address: '', contact: '', email: '', phone: '', industry: 'Healthcare', startDate: '', accountOwner: '', billingContact: '', notes: '',
};

export default function ClientDirectoryPage() {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const [type, setType] = useState('All');
  const [entity, setEntity] = useState('All');
  const [form, setForm] = useState(emptyForm);

  const clients = getClients();
  const relations = getRelationshipMap();
  const rows = useMemo(() => clients.filter((row) => {
    const text = `${row.name} ${row.entity} ${row.contact} ${row.email} ${row.industry} ${row.type}`.toLowerCase();
    return text.includes(query.toLowerCase())
      && (status === 'All' || row.status === status)
      && (type === 'All' || row.type === type)
      && (entity === 'All' || row.entity === entity);
  }), [clients, query, status, type, entity]);

  const submit = () => {
    if (!form.name) return;
    addClient(form);
    setForm(emptyForm);
    setDialogOpen(false);
  };

  return (
    <PortalLayout role="employer">
      <PageHeader
        eyebrow="Client and vendor registry"
        title="Clients & Vendors"
        description="Combined registry for clients, vendors, and dual-role accounts with entity-level correlation mapping and future conflict checks."
        actions={canCreateClientsVendors() ? <button className="button" onClick={() => setDialogOpen(true)}>New Client / Vendor</button> : null}
      />

      <div className="card toolbar-card filter-section">
        <div className="filter-header">
          <div className="search-bar">
            <div className="input-with-icon">
              <span className="icon"><Icon name="clients" /></span>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search client, vendor, dual-role account, contact, or industry" />
            </div>
          </div>
          <div className="filter-actions">
            <button className="filter-toggle" onClick={() => setShowFilters((v) => !v)}>
              <Icon name="settings" /> Filters
            </button>
          </div>
        </div>
        {showFilters && (
          <div className="filter-grid advanced-filters">
            <div className="filter-group"><label>Status</label><select value={status} onChange={(e) => setStatus(e.target.value)}><option>All</option><option>Active</option><option>Onboarding</option><option>Inactive</option></select></div>
            <div className="filter-group"><label>Type</label><select value={type} onChange={(e) => setType(e.target.value)}><option>All</option><option>Client</option><option>Vendor</option><option>Client + Vendor</option></select></div>
            <div className="filter-group"><label>Entity</label><select value={entity} onChange={(e) => setEntity(e.target.value)}><option>All</option>{getEntities().map((item) => <option key={item.id}>{item.name}</option>)}</select></div>
          </div>
        )}
      </div>

      <div className="table-wrap card">
        <table>
          <thead>
            <tr>
              <th>Name</th><th>Type</th><th>Status</th><th>Entity</th><th>Contact</th><th>Mapped Paths</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const mapped = relations.filter((rel) => rel.client === row.name || rel.vendor === row.name).length;
              return (
                <tr key={row.id}>
                  <td><strong>{row.name}</strong><div className="subtle">{row.industry}</div></td>
                  <td><span className="badge readable-badge">{row.type}</span></td>
                  <td><span className={`status-pill ${row.status === 'Active' ? 'status-active' : row.status === 'Inactive' ? 'status-ended' : 'status-pending'}`}>{row.status}</span></td>
                  <td>{row.entity}</td>
                  <td>{row.contact}</td>
                  <td>{mapped} mapped route(s)</td>
                  <td><button className="button button-secondary slim-button" onClick={() => navigate(`/employer/clients/${row.id}`)}>Details</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <section className="card section-card" style={{ marginTop: '1rem' }}>
        <div className="section-head"><div><span className="section-kicker">Correlation visibility</span><h3>Client ↔ Vendor Map</h3></div></div>
        <div className="table-wrap history-table-wrap">
          <table>
            <thead><tr><th>Client</th><th>Vendor</th><th>Entity</th><th>Status</th><th>Note</th></tr></thead>
            <tbody>
              {relations.map((row) => (
                <tr key={row.id}>
                  <td>{row.client}</td><td>{row.vendor}</td><td>{row.entity}</td><td>{row.status}</td><td>{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {dialogOpen && (
        <div className="dialog-backdrop" onClick={() => setDialogOpen(false)}>
          <div className="dialog-card onboarding-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-head">
              <div>
                <span className="section-kicker">Registry create popup</span>
                <h3>New Client / Vendor</h3>
                <p>This direct create option exists on the main page for permitted employer roles and is also available from Marketing submission flow.</p>
              </div>
              <button className="dialog-close" onClick={() => setDialogOpen(false)}>×</button>
            </div>
            <div className="card onboarding-form-card dialog-form-surface">
              <div className="form-grid-2">
                <div><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><label>Type</label><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option>Client</option><option>Vendor</option><option>Client + Vendor</option></select></div>
                <div><label>Entity</label><select value={form.entity} onChange={(e) => setForm({ ...form, entity: e.target.value })}>{getEntities().map((item) => <option key={item.id}>{item.name}</option>)}</select></div>
                <div><label>Industry</label><input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} /></div>
                <div><label>Primary Contact</label><input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} /></div>
                <div><label>Email</label><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div><label>Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div><label>Account Owner</label><input value={form.accountOwner} onChange={(e) => setForm({ ...form, accountOwner: e.target.value })} /></div>
                <div className="grid-span-2"><label>Address</label><input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
                <div className="grid-span-2"><label>Notes</label><textarea rows="4" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              </div>
              <div className="dialog-actions top-gap">
                <button className="button button-secondary" onClick={() => setDialogOpen(false)}>Cancel</button>
                <button className="button" onClick={submit}>Save Record</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
