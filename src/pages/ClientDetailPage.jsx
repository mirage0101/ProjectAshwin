import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PortalLayout from '../layouts/PortalLayout';
import PageHeader from '../components/PageHeader';
import DocumentsPanel from '../components/DocumentsPanel';
import { apiPlaceholders } from '../services/apiPlaceholders';
import { addDocument, getClients, getDocuments, updateClient } from '../services/portalStore';

export default function ClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const client = useMemo(() => getClients().find((item) => String(item.id) === String(id)), [id, refreshKey]);

  if (!client) {
    return (
      <PortalLayout role="employer">
        <PageHeader title="Client not found" description="The requested client could not be located." actions={<button className="button button-secondary" onClick={() => navigate('/employer/clients')}>Back to Clients</button>} />
      </PortalLayout>
    );
  }

  const [form, setForm] = useState({
    name: client.name,
    status: client.status,
    entity: client.entity,
    address: client.address,
    contact: client.contact,
    email: client.email,
    phone: client.phone,
    employees: client.employees,
    industry: client.industry,
    activeSince: client.activeSince,
    accountOwner: client.accountOwner,
    billingContact: client.billingContact,
    notes: client.notes,
  });

  const save = () => {
    updateClient(client.id, form);
    setEditMode(false);
    setRefreshKey((v) => v + 1);
  };

  const renderField = (label, value, key, type = 'text', options = []) => (
    <div className="card info-card" key={label}>
      <div className="subtle">{label}</div>
      {editMode ? (
        type === 'select' ? (
          <select value={form[key]} onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}>
            {options.map((option) => <option key={option}>{option}</option>)}
          </select>
        ) : type === 'textarea' ? (
          <textarea rows="3" value={form[key]} onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))} />
        ) : (
          <input type={type} value={form[key]} onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))} />
        )
      ) : <strong className="detail-strong">{value}</strong>}
    </div>
  );

  const docs = getDocuments('client', client.id);

  return (
    <PortalLayout role="employer">
      <PageHeader
        eyebrow="Client record"
        title={client.name}
        description="Detailed client profile with editable business details, document tracking, history, and backend-ready API placeholders."
        actions={<div className="page-actions-wrap"><button className={`button button-secondary ${editMode ? 'is-active-action' : ''}`} onClick={() => setEditMode((v) => !v)}>{editMode ? 'Stop Editing' : 'Edit Details'}</button>{editMode && <button className="button" onClick={save}>Save Changes</button>}<button className="button button-secondary" onClick={() => navigate('/employer/clients')}>Back to Clients</button></div>}
      />

      <div className="employee-section-stack">
        <section className="card section-card">
          <div className="section-head"><div><span className="section-kicker">Client summary</span><h3>Core Information</h3></div></div>
          <div className="simple-grid employee-detail-grid compact-tiles">
            {renderField('Client Name', client.name, 'name')}
            {renderField('Status', client.status, 'status', 'select', ['Active', 'Inactive', 'Onboarding'])}
            {renderField('Entity', client.entity, 'entity')}
            {renderField('Industry', client.industry, 'industry')}
            {renderField('Employees from ASH', client.employees, 'employees', 'number')}
            {renderField('Active Since', client.activeSince, 'activeSince', 'date')}
          </div>
        </section>

        <section className="card section-card">
          <div className="section-head"><div><span className="section-kicker">Who owns the relationship</span><h3>Contact Details</h3></div></div>
          <div className="simple-grid employee-detail-grid compact-tiles">
            {renderField('Primary Contact', client.contact, 'contact')}
            {renderField('Email', client.email, 'email', 'email')}
            {renderField('Phone', client.phone, 'phone')}
            {renderField('Address', client.address, 'address')}
          </div>
        </section>

        <section className="card section-card">
          <div className="section-head"><div><span className="section-kicker">Delivery and business mapping</span><h3>Operational Details</h3></div></div>
          <div className="simple-grid employee-detail-grid compact-tiles">
            {renderField('Account Owner', client.accountOwner, 'accountOwner')}
            {renderField('Billing Contact', client.billingContact, 'billingContact')}
            {renderField('Notes', client.notes, 'notes', 'textarea')}
          </div>
        </section>

        <DocumentsPanel
          title="Client Documents"
          documents={docs}
          listEndpoint={apiPlaceholders.employer.clientDocuments.replace(':id', client.id)}
          uploadEndpoint={apiPlaceholders.employer.uploadClientDocument.replace(':id', client.id)}
          onAdd={(draft) => { addDocument('client', client.id, { ...draft, uploadedBy: 'Employer Admin' }); setRefreshKey((v) => v + 1); }}
        />

        <section className="card section-card">
          <div className="section-head"><div><span className="section-kicker">Historical lifecycle</span><h3>Client Status History</h3></div></div>
          <div className="table-wrap history-table-wrap"><table><thead><tr><th>From</th><th>To</th><th>Status</th><th>Notes</th></tr></thead><tbody>{client.history.map((row, index) => <tr key={index}><td>{row.fromDate}</td><td>{row.toDate || 'Current'}</td><td><span className={`status-pill ${row.status === 'Active' ? 'status-active' : row.status === 'Inactive' ? 'status-ended' : 'status-pending'}`}>{row.status}</span></td><td>{row.note}</td></tr>)}</tbody></table></div>
        </section>
      </div>
    </PortalLayout>
  );
}
