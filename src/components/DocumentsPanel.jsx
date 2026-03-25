import { useEffect, useMemo, useState } from 'react';
import ApiTag from './ApiTag';
import { markDocumentDeleted } from '../services/portalStore';

export default function DocumentsPanel({ title = 'Documents', documents = [], uploadEndpoint, listEndpoint, onAdd, canUpload = true }) {
  const [draft, setDraft] = useState({ name: '', category: '', note: '' });
  const [localDocs, setLocalDocs] = useState(documents);

  useEffect(() => {
    setLocalDocs(documents);
  }, [documents]);

  const activeDocs = useMemo(() => localDocs.filter((doc) => doc.status !== 'DELETED'), [localDocs]);
  const historyDocs = useMemo(() => localDocs.filter((doc) => doc.status === 'DELETED'), [localDocs]);

  const submit = () => {
    if (!draft.name) return;
    const created = onAdd?.(draft);
    if (created) setLocalDocs((prev) => [...prev, created]);
    setDraft({ name: '', category: '', note: '' });
  };

  const deleteRow = (doc) => {
    markDocumentDeleted(doc.id);
    setLocalDocs((prev) => prev.map((row) => row.id === doc.id ? { ...row, status: 'DELETED', deletedBy: 'Admin User', deletedOn: new Date().toISOString().slice(0, 10) } : row));
  };

  return (
    <section className="card section-card">
      <div className="section-head with-inline-action">
        <div>
          <span className="section-kicker">Secure file metadata and retrieval mapping</span>
          <h3>{title}</h3>
        </div>
        <ApiTag endpoint={listEndpoint} />
      </div>

      {canUpload && (
        <div className="card info-card document-upload-card">
          <div className="simple-grid" style={{ gridTemplateColumns: '1.2fr 1fr 1.5fr auto', gap: '0.85rem', alignItems: 'end' }}>
            <div>
              <label>Document Name</label>
              <input value={draft.name} onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))} placeholder="Document display name" />
            </div>
            <div>
              <label>Category / Note Tag</label>
              <input value={draft.category} onChange={(e) => setDraft((prev) => ({ ...prev, category: e.target.value }))} placeholder="Offer Letter / Contract / Registration" />
            </div>
            <div>
              <label>Document Note</label>
              <input value={draft.note} onChange={(e) => setDraft((prev) => ({ ...prev, note: e.target.value }))} placeholder="Free-form category note for metadata" />
            </div>
            <div className="inline-actions">
              <button className="button button-secondary slim-button" onClick={() => window.alert(`Backend API placeholder:\n${uploadEndpoint}`)}>API</button>
              <button className="button slim-button" onClick={submit}>Add Metadata</button>
            </div>
          </div>
          <p className="subtle" style={{ marginTop: '0.65rem' }}>
            This UI tracks metadata and intended S3 references. Files can later be uploaded to S3 and served through signed API calls.
          </p>
        </div>
      )}

      <div className="table-wrap history-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Document</th>
              <th>Category</th>
              <th>Uploaded By</th>
              <th>Uploaded On</th>
              <th>S3 / Metadata Reference</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {activeDocs.length ? activeDocs.map((doc) => (
              <tr key={doc.id}>
                <td><strong>{doc.name}</strong><div className="subtle">{doc.note || 'No extra note'}</div></td>
                <td>{doc.category}</td>
                <td>{doc.uploadedBy}</td>
                <td>{doc.uploadedOn}</td>
                <td><code className="api-inline">{doc.s3Key}</code></td>
                <td>
                  <div className="row-action-stack compact-actions">
                    <button className="button button-secondary slim-button" onClick={() => window.alert(`Open via signed URL endpoint\n\n${uploadEndpoint}`)}>Open</button>
                    <button className="button slim-button" onClick={() => deleteRow(doc)}>Delete</button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="6" className="empty-cell">No active documents yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-wrap history-table-wrap top-gap">
        <table>
          <thead>
            <tr>
              <th>Deleted Document</th>
              <th>Category</th>
              <th>Deleted By</th>
              <th>Deleted On</th>
              <th>Metadata Reference</th>
            </tr>
          </thead>
          <tbody>
            {historyDocs.length ? historyDocs.map((doc) => (
              <tr key={doc.id}>
                <td><strong>{doc.name}</strong><div className="subtle">{doc.note || 'Historical record'}</div></td>
                <td>{doc.category}</td>
                <td>{doc.deletedBy || 'System / Admin'}</td>
                <td>{doc.deletedOn || '—'}</td>
                <td><code className="api-inline">{doc.s3Key}</code></td>
              </tr>
            )) : (
              <tr><td colSpan="5" className="empty-cell">No deleted documents in history.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
