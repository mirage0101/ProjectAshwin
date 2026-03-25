import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PortalLayout from '../layouts/PortalLayout';
import PageHeader from '../components/PageHeader';
import {
  addClient,
  addDocument,
  addSubmission,
  assignMarketingCase,
  getClients,
  getConflictHints,
  getDocuments,
  getEmployees,
  getMarketingCases,
  updateDocument,
  updateSubmission,
} from '../services/portalStore';
import { getEmployerRole, getSession } from '../services/session';

const newRecord = { name: '', type: 'Client', entity: 'GxP Consulting', contact: '', email: '', industry: 'Healthcare', notes: '' };
const emptySubmission = { clientId: '', vendorId: '', note: '', outcome: 'Submitted', status: 'Open' };

function buildSubmissionForm(submission) {
  return {
    clientId: submission?.clientId ? String(submission.clientId) : '',
    vendorId: submission?.vendorId ? String(submission.vendorId) : '',
    note: submission?.note || '',
    outcome: submission?.outcome || 'Submitted',
    status: submission?.status || 'Open',
  };
}

export default function MarketingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const session = getSession();
  const employerRole = getEmployerRole();
  const [refreshKey, setRefreshKey] = useState(0);
  const [submissionOpen, setSubmissionOpen] = useState(false);
  const [newClientOpen, setNewClientOpen] = useState(false);
  const [employeeOpen, setEmployeeOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState('');
  const [editSubmissionOpen, setEditSubmissionOpen] = useState(false);
  const [newRecordForm, setNewRecordForm] = useState(newRecord);
  const [createForm, setCreateForm] = useState(emptySubmission);
  const [editForm, setEditForm] = useState(emptySubmission);
  const [docRequest, setDocRequest] = useState({ name: '', category: '', note: '' });

  const caseRow = useMemo(() => getMarketingCases().find((row) => row.id === id), [id, refreshKey]);
  const employee = useMemo(() => getEmployees().find((row) => String(row.id) === String(caseRow?.employeeId)), [caseRow, refreshKey]);
  const clients = getClients();
  const clientOptions = clients.filter((item) => item.type.includes('Client'));
  const vendorOptions = clients.filter((item) => item.type.includes('Vendor'));
  const employeeDocs = employee ? getDocuments('employee', employee.id) : [];

  if (!caseRow) {
    return (
      <PortalLayout role="employer">
        <PageHeader title="Marketing detail not found" description="Return to the marketing queue." actions={<button className="button button-secondary" onClick={() => navigate('/employer/marketing')}>Back to Marketing</button>} />
      </PortalLayout>
    );
  }

  const canOpen = !caseRow.recruiter || caseRow.recruiter === session.name || ['admin', 'superadmin', 'lead_recruiter'].includes(employerRole);
  const selectedSubmission = (caseRow.submissions || []).find((sub) => sub.id === selectedSubmissionId) || null;
  const createConflictHints = getConflictHints(
    employee?.id,
    clients.find((c) => String(c.id) === String(createForm.clientId))?.name || '',
    clients.find((c) => String(c.id) === String(createForm.vendorId))?.name || '',
  );

  const refresh = () => setRefreshKey((value) => value + 1);

  const openSubmissionDetail = (submission) => {
    setSelectedSubmissionId(submission.id);
    setEditForm(buildSubmissionForm(submission));
    setEditSubmissionOpen(true);
  };

  const submissionRows = (caseRow.submissions || []).map((sub) => ({
    ...sub,
    status: sub.status || 'Open',
    owner: sub.owner || caseRow.recruiter || 'Recruiter',
    createdOn: sub.createdOn || caseRow.assignedAt || '2026-03-01',
    updatedOn: sub.updatedOn || caseRow.assignedAt || '2026-03-01',
    history: sub.history || [{
      date: caseRow.assignedAt || '2026-03-01',
      action: 'Submission seeded from mock data',
      by: sub.owner || caseRow.recruiter || 'System',
      note: sub.note || '',
      outcome: sub.outcome || 'Submitted',
    }],
  }));

  const saveNewSubmission = () => {
    const client = clients.find((item) => String(item.id) === String(createForm.clientId));
    const vendor = clients.find((item) => String(item.id) === String(createForm.vendorId));
    if (!client) return;
    addSubmission(caseRow.id, {
      clientId: client.id,
      vendorId: vendor?.id,
      client: client.name,
      vendor: vendor?.name || '',
      note: createForm.note,
      conflict: createConflictHints.join(' | '),
      outcome: createForm.outcome,
      status: createForm.status,
      owner: session.name,
    });
    setSubmissionOpen(false);
    setCreateForm(emptySubmission);
    refresh();
  };

  const saveNewRecord = () => {
    const row = addClient(newRecordForm);
    setNewClientOpen(false);
    setNewRecordForm(newRecord);
    if (row.type.includes('Client')) setCreateForm((prev) => ({ ...prev, clientId: String(row.id) }));
    if (row.type.includes('Vendor')) setCreateForm((prev) => ({ ...prev, vendorId: String(row.id) }));
  };

  const saveSubmissionEdit = (historyAction, forcePatch = {}) => {
    if (!selectedSubmission) return;
    const client = clients.find((item) => String(item.id) === String(editForm.clientId));
    const vendor = clients.find((item) => String(item.id) === String(editForm.vendorId));
    const updated = updateSubmission(caseRow.id, selectedSubmission.id, {
      clientId: client?.id || selectedSubmission.clientId,
      vendorId: vendor?.id || null,
      client: client?.name || selectedSubmission.client,
      vendor: vendor?.name || '',
      route: vendor?.name ? `${vendor.name} -> ${client?.name || selectedSubmission.client}` : `${client?.name || selectedSubmission.client} (Direct)`,
      note: editForm.note,
      outcome: forcePatch.outcome || editForm.outcome,
      status: forcePatch.status || editForm.status,
      historyAction,
    });
    if (!updated) return;
    setEditSubmissionOpen(false);
    refresh();
  };

  const updateDocReview = (doc, status) => {
    updateDocument(doc.id, {
      status,
      reviewedBy: session.name,
      reviewedOn: new Date().toISOString().slice(0, 10),
    });
    refresh();
  };

  const requestMoreDocs = () => {
    if (!employee || !docRequest.name) return;
    addDocument('employee', employee.id, {
      name: docRequest.name,
      category: docRequest.category || 'Requested Document',
      note: docRequest.note || 'Requested by recruiter from marketing detail.',
      uploadedBy: session.name,
      s3Key: `employee-requests/${employee.id}/${Date.now()}`,
    });
    setDocRequest({ name: '', category: '', note: '' });
    refresh();
  };

  return (
    <PortalLayout role="employer">
      <PageHeader
        eyebrow="Recruiter-owned marketing detail"
        title={`${caseRow.employee} - Marketing Tracker`}
        description="Compact submission tracker for multi-submission workflows. Recruiters can work the pipeline, view employee details, and review submitted candidate documents from the same screen."
        actions={(
          <div className="page-actions-wrap">
            <button className="button button-secondary slim-button" onClick={() => navigate('/employer/marketing')}>Back</button>
            {!caseRow.recruiter && <button className="button slim-button" onClick={() => { assignMarketingCase(caseRow.id, session.name); refresh(); }}>Assign to Me</button>}
            <button className="button button-secondary slim-button" onClick={() => setEmployeeOpen(true)}>View Employee</button>
            <button className="button button-secondary slim-button" onClick={() => setDocsOpen(true)}>View Submitted Docs</button>
            {canOpen && <button className="button slim-button" onClick={() => setSubmissionOpen(true)}>New Submission</button>}
          </div>
        )}
      />

      {!canOpen ? (
        <div className="card info-card"><strong>Locked</strong><p className="subtle">This marketing entry is assigned to {caseRow.recruiter}. Other recruiters can see it in queue but cannot open the internal submission history.</p></div>
      ) : (
        <div className="employee-section-stack">
          <section className="card section-card tracker-shell">
            <div className="section-head with-inline-action">
              <div>
                <span className="section-kicker">Tracker grid</span>
                <h3>Submission Pipeline</h3>
              </div>
              <div className="workflow-item-side">
                <span className="badge">{submissionRows.length} submissions</span>
                <span className="badge">{caseRow.recruiter || 'Unassigned'}</span>
              </div>
            </div>
            <div className="table-wrap tracker-table-wrap">
              <table className="tracker-table">
                <thead>
                  <tr>
                    <th>Route</th>
                    <th>Status</th>
                    <th>Outcome</th>
                    <th>Owner</th>
                    <th>Updated</th>
                    <th>Note</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {submissionRows.map((sub) => (
                    <tr key={sub.id}>
                      <td><strong>{sub.route}</strong>{sub.conflict ? <div className="subtle tracker-alert">{sub.conflict}</div> : null}</td>
                      <td><span className={`status-pill ${sub.status === 'Successful' ? 'status-active' : sub.status === 'Failed' ? 'status-ended' : 'status-pending'}`}>{sub.status}</span></td>
                      <td>{sub.outcome}</td>
                      <td>{sub.owner}</td>
                      <td>{sub.updatedOn}</td>
                      <td>{sub.note || 'No notes'}</td>
                      <td>
                        <div className="inline-actions compact-toolbar">
                          <button className="button button-secondary slim-button" onClick={() => openSubmissionDetail(sub)}>Open</button>
                          <button className="button button-secondary slim-button" onClick={() => { openSubmissionDetail(sub); setEditForm((prev) => ({ ...prev, status: 'Successful', outcome: 'Selected' })); }}>Success</button>
                          <button className="button slim-button" onClick={() => { openSubmissionDetail(sub); setEditForm((prev) => ({ ...prev, status: 'Failed', outcome: 'Rejected' })); }}>Fail</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card section-card">
            <div className="section-head"><div><span className="section-kicker">Case activity</span><h3>Owner Timeline</h3></div></div>
            <div className="table-wrap history-table-wrap">
              <table className="tracker-table">
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
                <p>Create a client submission and seed workflow status for the tracker.</p>
              </div>
              <button className="dialog-close" onClick={() => setSubmissionOpen(false)}>&times;</button>
            </div>
            <div className="card onboarding-form-card dialog-form-surface">
              <div className="form-grid-2">
                <div><label>Client</label><select value={createForm.clientId} onChange={(e) => setCreateForm((prev) => ({ ...prev, clientId: e.target.value }))}><option value="">Select client</option>{clientOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
                <div><label>Vendor</label><select value={createForm.vendorId} onChange={(e) => setCreateForm((prev) => ({ ...prev, vendorId: e.target.value }))}><option value="">Direct / None</option>{vendorOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
                <div><label>Outcome</label><select value={createForm.outcome} onChange={(e) => setCreateForm((prev) => ({ ...prev, outcome: e.target.value }))}><option>Submitted</option><option>In Review</option><option>Interview Scheduled</option><option>Selected</option><option>Rejected</option></select></div>
                <div><label>Status</label><select value={createForm.status} onChange={(e) => setCreateForm((prev) => ({ ...prev, status: e.target.value }))}><option>Open</option><option>Successful</option><option>Failed</option><option>On Hold</option></select></div>
                <div className="grid-span-2"><label>Recruiter Notes</label><textarea rows="4" value={createForm.note} onChange={(e) => setCreateForm((prev) => ({ ...prev, note: e.target.value }))} /></div>
              </div>
              {createConflictHints.length > 0 && (
                <div className="card info-card top-gap">
                  <strong>Conflict checks</strong>
                  <ul style={{ margin: '.6rem 0 0 1rem', color: 'var(--muted)' }}>
                    {createConflictHints.map((hint, idx) => <li key={idx}>{hint}</li>)}
                  </ul>
                </div>
              )}
              <div className="dialog-actions top-gap">
                <button className="button button-secondary slim-button" onClick={() => setNewClientOpen(true)}>Create Client/Vendor</button>
                <button className="button slim-button" onClick={saveNewSubmission}>Save Submission</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editSubmissionOpen && selectedSubmission && (
        <div className="dialog-backdrop" onClick={() => setEditSubmissionOpen(false)}>
          <div className="dialog-card onboarding-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-head">
              <div>
                <span className="section-kicker">Submission details</span>
                <h3>{selectedSubmission.route}</h3>
                <p>Update notes, route, outcome, and status with visible history for the tracker.</p>
              </div>
              <button className="dialog-close" onClick={() => setEditSubmissionOpen(false)}>&times;</button>
            </div>
            <div className="card onboarding-form-card dialog-form-surface">
              <div className="form-grid-2">
                <div><label>Client</label><select value={editForm.clientId} onChange={(e) => setEditForm((prev) => ({ ...prev, clientId: e.target.value }))}><option value="">Select client</option>{clientOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
                <div><label>Vendor</label><select value={editForm.vendorId} onChange={(e) => setEditForm((prev) => ({ ...prev, vendorId: e.target.value }))}><option value="">Direct / None</option>{vendorOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
                <div><label>Outcome</label><select value={editForm.outcome} onChange={(e) => setEditForm((prev) => ({ ...prev, outcome: e.target.value }))}><option>Submitted</option><option>In Review</option><option>Interview Scheduled</option><option>Selected</option><option>Rejected</option></select></div>
                <div><label>Status</label><select value={editForm.status} onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}><option>Open</option><option>Successful</option><option>Failed</option><option>On Hold</option></select></div>
                <div className="grid-span-2"><label>Notes</label><textarea rows="4" value={editForm.note} onChange={(e) => setEditForm((prev) => ({ ...prev, note: e.target.value }))} /></div>
              </div>
              <div className="table-wrap history-table-wrap top-gap">
                <table className="tracker-table">
                  <thead><tr><th>Date</th><th>Action</th><th>By</th><th>Outcome</th><th>Note</th></tr></thead>
                  <tbody>
                    {(selectedSubmission.history || []).map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.date}</td>
                        <td>{item.action}</td>
                        <td>{item.by}</td>
                        <td>{item.outcome || '-'}</td>
                        <td>{item.note || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="dialog-actions top-gap">
                <button className="button button-secondary slim-button" onClick={() => saveSubmissionEdit('Submission updated from detail view')}>Save</button>
                <button className="button button-secondary slim-button" onClick={() => saveSubmissionEdit('Submission marked successful', { status: 'Successful', outcome: 'Selected' })}>Mark Success</button>
                <button className="button slim-button" onClick={() => saveSubmissionEdit('Submission marked failed', { status: 'Failed', outcome: 'Rejected' })}>Mark Failed</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {employeeOpen && employee && (
        <div className="dialog-backdrop" onClick={() => setEmployeeOpen(false)}>
          <div className="dialog-card onboarding-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-head">
              <div>
                <span className="section-kicker">Employee snapshot</span>
                <h3>{employee.name}</h3>
                <p>Compact employee reference for recruiters inside marketing detail.</p>
              </div>
              <button className="dialog-close" onClick={() => setEmployeeOpen(false)}>&times;</button>
            </div>
            <div className="card onboarding-form-card dialog-form-surface">
              <div className="simple-grid employee-detail-grid compact-tiles">
                <div className="card info-card"><div className="subtle">Email</div><strong>{employee.email}</strong></div>
                <div className="card info-card"><div className="subtle">Phone</div><strong>{employee.phone}</strong></div>
                <div className="card info-card"><div className="subtle">Recruiter</div><strong>{employee.recruiter || 'Open'}</strong></div>
                <div className="card info-card"><div className="subtle">HR</div><strong>{employee.hr || 'Not set'}</strong></div>
                <div className="card info-card"><div className="subtle">Skills</div><strong>{(employee.skills || []).join(', ') || 'N/A'}</strong></div>
                <div className="card info-card"><div className="subtle">Resume</div><strong>{employee.resumeVersion || 'Pending'}</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {docsOpen && employee && (
        <div className="dialog-backdrop" onClick={() => setDocsOpen(false)}>
          <div className="dialog-card onboarding-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-head">
              <div>
                <span className="section-kicker">Candidate documents</span>
                <h3>{employee.name}</h3>
                <p>Recruiter-side document review for demo approval, rejection, or requesting additional documents.</p>
              </div>
              <button className="dialog-close" onClick={() => setDocsOpen(false)}>&times;</button>
            </div>
            <div className="card onboarding-form-card dialog-form-surface">
              <div className="table-wrap history-table-wrap">
                <table className="tracker-table">
                  <thead><tr><th>Document</th><th>Category</th><th>Status</th><th>Uploaded</th><th>Review</th></tr></thead>
                  <tbody>
                    {employeeDocs.length ? employeeDocs.map((doc) => (
                      <tr key={doc.id}>
                        <td><strong>{doc.name}</strong><div className="subtle">{doc.note || 'No note'}</div></td>
                        <td>{doc.category}</td>
                        <td>{doc.status}</td>
                        <td>{doc.uploadedOn}</td>
                        <td>
                          <div className="inline-actions compact-toolbar">
                            <button className="button button-secondary slim-button" onClick={() => updateDocReview(doc, 'APPROVED')}>Approve</button>
                            <button className="button slim-button" onClick={() => updateDocReview(doc, 'REJECTED')}>Reject</button>
                          </div>
                        </td>
                      </tr>
                    )) : <tr><td colSpan="5" className="empty-cell">No submitted docs yet.</td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="form-grid-2 top-gap">
                <div><label>Request Document</label><input value={docRequest.name} onChange={(e) => setDocRequest((prev) => ({ ...prev, name: e.target.value }))} placeholder="Updated resume / Passport / Visa" /></div>
                <div><label>Category</label><input value={docRequest.category} onChange={(e) => setDocRequest((prev) => ({ ...prev, category: e.target.value }))} placeholder="Requested Document" /></div>
                <div className="grid-span-2"><label>Request Note</label><textarea rows="3" value={docRequest.note} onChange={(e) => setDocRequest((prev) => ({ ...prev, note: e.target.value }))} placeholder="Mention missing or corrected document requirement" /></div>
              </div>
              <div className="dialog-actions top-gap">
                <button className="button button-secondary slim-button" onClick={requestMoreDocs}>Request Other Docs</button>
                <button className="button slim-button" onClick={() => setDocsOpen(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {newClientOpen && (
        <div className="dialog-backdrop" onClick={() => setNewClientOpen(false)}>
          <div className="dialog-card onboarding-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-head">
              <div><span className="section-kicker">On-the-go registry create</span><h3>New Client / Vendor</h3><p>Available from the submission workflow for live demo data entry.</p></div>
              <button className="dialog-close" onClick={() => setNewClientOpen(false)}>&times;</button>
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
              <div className="dialog-actions top-gap"><button className="button button-secondary slim-button" onClick={() => setNewClientOpen(false)}>Cancel</button><button className="button slim-button" onClick={saveNewRecord}>Save</button></div>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
