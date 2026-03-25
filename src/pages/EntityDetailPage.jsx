import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PortalLayout from '../layouts/PortalLayout';
import PageHeader from '../components/PageHeader';
import DocumentsPanel from '../components/DocumentsPanel';
import { apiPlaceholders } from '../services/apiPlaceholders';
import { addDocument, getDocuments, getEntities, updateEntity } from '../services/portalStore';

export default function EntityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const entity = useMemo(() => getEntities().find((item) => String(item.id) === String(id)), [id, refreshKey]);

  if (!entity) {
    return (
      <PortalLayout role="employer">
        <PageHeader title="Entity not found" description="The requested entity could not be located." actions={<button className="button button-secondary" onClick={() => navigate('/employer/entities')}>Back to Entities</button>} />
      </PortalLayout>
    );
  }

  const [form, setForm] = useState({
    name: entity.name,
    legalName: entity.legalName,
    status: entity.status,
    region: entity.region,
    admin: entity.admin,
    email: entity.email,
    phone: entity.phone,
    address: entity.address,
    employeeCount: entity.employeeCount,
    clientCount: entity.clientCount,
    notes: entity.notes,
  });

  const save = () => {
    updateEntity(entity.id, form);
    setEditMode(false);
    setRefreshKey((v) => v + 1);
  };

  const renderField = (label, value, key, type = 'text', options = []) => (
    <div className="card info-card" key={label}>
      <div className="subtle">{label}</div>
      {editMode ? (
        type === 'select' ? (
          <select value={form[key]} onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}>{options.map((option) => <option key={option}>{option}</option>)}</select>
        ) : type === 'textarea' ? (
          <textarea rows="3" value={form[key]} onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))} />
        ) : (
          <input type={type} value={form[key]} onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))} />
        )
      ) : <strong className="detail-strong">{value}</strong>}
    </div>
  );

  const docs = getDocuments('entity', entity.id);

  return (
    <PortalLayout role="employer">
      <PageHeader eyebrow="Entity record" title={entity.name} description="Detailed entity view with editable admin ownership, legal details, region, document history, and activation status." actions={<div className="page-actions-wrap"><button className={`button button-secondary ${editMode ? 'is-active-action' : ''}`} onClick={() => setEditMode((v) => !v)}>{editMode ? 'Stop Editing' : 'Edit Details'}</button>{editMode && <button className="button" onClick={save}>Save Changes</button>}<button className="button button-secondary" onClick={() => navigate('/employer/entities')}>Back to Entities</button></div>} />
      <div className="employee-section-stack">
        <section className="card section-card">
          <div className="section-head"><div><span className="section-kicker">Organization setup</span><h3>Entity Details</h3></div></div>
          <div className="simple-grid employee-detail-grid compact-tiles">
            {renderField('Entity Name', entity.name, 'name')}
            {renderField('Legal Name', entity.legalName, 'legalName')}
            {renderField('Status', entity.status, 'status', 'select', ['Active', 'Inactive', 'Onboarding'])}
            {renderField('Region', entity.region, 'region', 'select', ['North America', 'EMEA', 'APAC', 'LATAM'])}
            {renderField('Admin Owner', entity.admin, 'admin')}
            {renderField('Email', entity.email, 'email', 'email')}
            {renderField('Phone', entity.phone, 'phone')}
            {renderField('Address', entity.address, 'address')}
            {renderField('Total Employees', entity.employeeCount, 'employeeCount', 'number')}
            {renderField('Total Clients', entity.clientCount, 'clientCount', 'number')}
            {renderField('Notes', entity.notes, 'notes', 'textarea')}
          </div>
        </section>

        <DocumentsPanel
          title="Entity Documents"
          documents={docs}
          listEndpoint={apiPlaceholders.employer.entityDocuments.replace(':id', entity.id)}
          uploadEndpoint={apiPlaceholders.employer.uploadEntityDocument.replace(':id', entity.id)}
          onAdd={(draft) => { addDocument('entity', entity.id, { ...draft, uploadedBy: 'Super Admin' }); setRefreshKey((v) => v + 1); }}
        />
      </div>
    </PortalLayout>
  );
}
