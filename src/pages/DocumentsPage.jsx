import { useState } from 'react';
import PortalLayout from '../layouts/PortalLayout';
import PageHeader from '../components/PageHeader';
import { getDocumentCategories } from '../services/portalStore';
import { canManageDocumentsSetup, getEmployerRole } from '../services/session';

export default function DocumentsPage({ role }) {
  const isEmployer = role === 'employer';
  const [rows] = useState(getDocumentCategories());

  return (
    <PortalLayout role={role}>
      <PageHeader
        title={isEmployer ? 'Documents Setup' : 'Documents'}
        description={isEmployer
          ? 'Entity-owned document category configuration for onboarding tasks and client/vendor document storage.'
          : 'Employee-side document placeholders for future upload APIs.'}
        actions={isEmployer && canManageDocumentsSetup() ? <button className="button">New Document Category</button> : null}
      />
      {isEmployer ? (
        <div className="table-wrap card">
          <table>
            <thead><tr><th>Category</th><th>Scope</th><th>Entity</th><th>Action</th></tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td><strong>{row.name}</strong></td><td>{row.scope}</td><td>{row.entity}</td>
                  <td><button className="button button-secondary slim-button">Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="doc-grid">
          {['Passport', 'Visa', 'Offer Letter', 'ID Proof'].map((doc) => <div key={doc} className="card info-card"><strong>{doc}</strong><p className="subtle">Upload/download API placeholder</p><span className="badge">Pending</span></div>)}
        </div>
      )}
    </PortalLayout>
  );
}
