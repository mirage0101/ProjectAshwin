import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PortalLayout from '../layouts/PortalLayout';
import PageHeader from '../components/PageHeader';
import { addClient, addSubmission, assignMarketingCase, getClients, getConflictHints, getEmployees, getMarketingCases } from '../services/portalStore';
import { getEmployerRole, getSession } from '../services/session';

const newRecord = { name: '', type: 'Client', entity: 'GxP Consulting', contact: '', email: '', industry: 'Healthcare', notes: '' };

export default function MarketingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const session = getSession();
  const employerRole = getEmployerRole();
  const caseRow = useMemo(() => getMarketingCases().find((row) => row.id === id), [id]);
  const employee = useMemo(() => getEmployees().find((row) => String(row.id) === String(caseRow?.employeeId)), [caseRow]);
  const [submissionOpen, setSubmissionOpen] = useState(false);
  const [newClientOpen, setNewClientOpen] = useState(false);
  const [clientId, setClientId] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [note, setNote] = useState('');
  const [newRecordForm, setNewRecordForm] = useState(newRecord);

  if (!caseRow) {
    return (
      <PortalLayout role="employer">
        <PageHeader title="Marketing detail not found" description="Return to the marketing queue." actions={<button className="button button-secondary" onClick={() => navigate('/employer/marketing')}>Back to Marketing</button>} />
      </PortalLayout>
    );
  }

  const canOpen = !caseRow.recruiter || caseRow.recruiter === session.name || ['admin', 'superadmin', 'lead_recruiter'].includes(employerRole);

  const clients = getClients();
  const clientOptions = clients.filter((item) => item.type.includes('Client'));
  const vendorOptions = clients.filter((item) => item.type.includes('Vendor'));

  const conflictHints = getConflictHints(employee?.id, clients.find((c) => String(c.id) === String(clientId))?.name || '', clients.find((c) => String(c.id) === String(vendorId))?.name || '');

  const submit = () => {
    const client = clients.find((item) => String(item.id) === String(clientId));
    const vendor = clients.find((item) => String(item.id) === String(vendorId));
    if (!client) return;
    addSubmission(caseRow.id, {
      clientId: client.id,
      vendorId: vendor?.id,
      client: client.name,
      vendor: vendor?.name || '',
      note,
      conflict: conflictHints.join(' | '),
      outcome: 'Submitted',
    });
    setSubmissionOpen(false);
    setClientId('');
    setVendorId('');
    setNote('');
  };

  const saveNewRecord = () => {
    const row = addClient(newRecordForm);
    setNewClientOpen(false);
    setNewRecordForm(newRecord);
    if (row.type.includes('Client')) setClientId(String(row.id));
    if (row.type.includes('Vendor')) setVendorId(String(row.id));
  };

  return (
    <PortalLayout role="employer">
      <PageHeader
        eyebrow="Recruiter-owned marketing detail"
        title={`${caseRow.employee} • Marketing Case`}
        description="This is where new submissions are created. Top-level Marketing page does not allow create; it only allows queue assignment and opening the detail."
        actions={<div className="page-actions-wrap"><button className="button button-secondary" onClick={() => navigate('/employer/marketing')}>Back to Queue</button>{!caseRow.recruiter && <button className="button" onClick={() => assignMarketingCase(caseRow.id, session.name)}>Assign to Me</button>}{canOpen && <button className="button" onClick={() => setSubmissionOpen(true)}>New Submission</button>}</div>}
      />

      {!canOpen ? (
        <div className="card info-card"><strong>Locked</strong><p className="subtle">This marketing entry is assigned to {caseRow.recruiter}. Other recruiters can see it in queue but cannot open the internal submission history.</p></div>
      ) : (
        <div className="employee-section-stack">
          <section className="card section-card">
            <div className="section-head"><div><span className="section-kicker">Employee snapshot</span><h3>Conflict-aware marketing context</h3></div></div>
            <div className="simple-grid employee-detail-grid compact-tiles">
              <div className="card info-card"><div className="subtle">Employee</div><strong>{employee?.name}</strong></div>
              <div className="card info-card"><div className="subtle">Skills</div><strong>{(employee?.skills || []).join(', ') || '—'}</strong></div>
              <div className="card info-card"><div className="subtle">Resume</div><strong>{employee?.resumeVersion || 'Pending'}</strong></div>
              <div className="card info-card"><div className="subtle">Past Assignments</div><strong>{employee?.assignmentHistory?.map((h) => h.client).join(', ') || '—'}</strong></div>
            </div>
          </section>

          <section className="card section-card">
            <div className="section-head"><div><span className="section-kicker">Submission history</span><h3>Current routes</h3></div></div>
            <div className="approval-list">
              {(caseRow.submissions || []).map((sub) => (
                <div key={sub.id} className="card approval-item">
                  <div className="approval-item-head">
                    <div>
                      <strong>{sub.route}</strong>
                      <p>{sub.note || 'No notes added.'}</p>
                    </div>
                    <div className="inline-actions">
                      <span className="badge">{sub.outcome}</span>
                      {sub.conflict ? <span className="badge readable-badge">Conflict Flag</span> : null}
                    </div>
                  </div>
                  {sub.conflict ? <div className="subtle" style={{ marginTop: '.65rem', color: 'var(--warning)' }}>{sub.conflict}</div> : null}
                </div>
              ))}
            </div>
          </section>

          <section className="card section-card">
            <div className="section-head"><div><span className="section-kicker">Owner history</span><h3>Case Activity</h3></div></div>
            <div className="table-wrap history-table-wrap">
              <table>
                <thead><tr><th>Date</th><th>Action</th><th>By</th></tr></thead>
                <tbody>
                  {(caseRow.history || []).map((item, idx) => <tr key={idx}><td>{item.date}</td><td>{item.action}</td><td>{item.by}</td></tr>)}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {submissionOpen && (
        <div className="dialog-backdrop" onClick={() => setSubmissionOpen(false)}>
          <div className="dialog-card onboarding-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-head">
              <div>
                <span className="section-kicker">New submission</span>
                <h3>Create Submission</h3>
                <p>Recruiter creates new submissions only inside this page. New client/vendor records can also be created here when needed.</p>
              </div>
              <button className="dialog-close" onClick={() => setSubmissionOpen(false)}>×</button>
            </div>
            <div className="card onboarding-form-card dialog-form-surface">
              <div className="form-grid-2">
                <div><label>Client</label><select value={clientId} onChange={(e) => setClientId(e.target.value)}><option value="">Select client</option>{clientOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
                <div><label>Vendor (optional)</label><select value={vendorId} onChange={(e) => setVendorId(e.target.value)}><option value="">Direct / None</option>{vendorOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
                <div className="grid-span-2"><label>Recruiter Notes</label><textarea rows="4" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Submission notes, contact updates, next step, etc." /></div>
              </div>
              {conflictHints.length > 0 && (
                <div className="card info-card" style={{ marginTop: '1rem', borderColor: 'rgba(243,165,52,.35)' }}>
                  <strong>Conflict / repetition checks</strong>
                  <ul style={{ margin: '.6rem 0 0 1rem', color: 'var(--muted)' }}>
                    {conflictHints.map((hint, idx) => <li key={idx}>{hint}</li>)}
                  </ul>
                </div>
              )}
              <div className="dialog-actions top-gap">
                <button className="button button-secondary" onClick={() => setNewClientOpen(true)}>Create Client/Vendor</button>
                <button className="button" onClick={submit}>Save Submission</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {newClientOpen && (
        <div className="dialog-backdrop" onClick={() => setNewClientOpen(false)}>
          <div className="dialog-card onboarding-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-head">
              <div><span className="section-kicker">On-the-go registry create</span><h3>New Client / Vendor</h3><p>Available from submission workflow as requested.</p></div>
              <button className="dialog-close" onClick={() => setNewClientOpen(false)}>×</button>
            </div>
            <div className="card onboarding-form-card dialog-form-surface">
              <div className="form-grid-2">
                <div><label>Name</label><input value={newRecordForm.name} onChange={(e) => setNewRecordForm({ ...newRecordForm, name: e.target.value })} /></div>
                <div><label>Type</label><select value={newRecordForm.type} onChange={(e) => setNewRecordForm({ ...newRecordForm, type: e.target.value })}><option>Client</option><option>Vendor</option><option>Client + Vendor</option></select></div>
                <div><label>Contact</label><input value={newRecordForm.contact} onChange={(e) => setNewRecordForm({ ...newRecordForm, contact: e.target.value })} /></div>
                <div><label>Email</label><input value={newRecordForm.email} onChange={(e) => setNewRecordForm({ ...newRecordForm, email: e.target.value })} /></div>
                <div><label>Industry</label><input value={newRecordForm.industry} onChange={(e) => setNewRecordForm({ ...newRecordForm, industry: e.target.value })} /></div>
                <div className="grid-span-2"><label>Notes</label><textarea rows="4" value={newRecordForm.notes} onChange={(e) => setNewRecordForm({ ...newRecordForm, notes: e.target.value })} /></div>
              </div>
              <div className="dialog-actions top-gap"><button className="button button-secondary" onClick={() => setNewClientOpen(false)}>Cancel</button><button className="button" onClick={saveNewRecord}>Save Record</button></div>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
