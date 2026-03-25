import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PortalLayout from '../layouts/PortalLayout';
import PageHeader from '../components/PageHeader';
import {
  addDocument,
  getClients,
  getDocuments,
  getEmployees,
  getOnboardingCases,
  updateEmployeeAssignment,
  updateOnboardingCase,
} from '../services/portalStore';
import { getSession } from '../services/session';

const requestDocsTemplate = ['Passport', 'Visa', 'ID Proof', 'Previous Employment', 'Offer Letter Ack'];

function buildHistory(caseRow) {
  return caseRow.history || [{
    date: caseRow.assignmentEnd,
    action: 'Onboarding case seeded',
    by: caseRow.hr,
  }];
}

export default function OnboardingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const session = getSession();
  const [refreshKey, setRefreshKey] = useState(0);
  const [dialogType, setDialogType] = useState('');
  const [closeForm, setCloseForm] = useState({ outcome: 'complete', expiryDate: '', note: '' });
  const [revertForm, setRevertForm] = useState({ effectiveDate: '', note: '' });

  const caseRow = useMemo(() => getOnboardingCases().find((item) => item.id === id), [id, refreshKey]);
  const employees = getEmployees();
  const clients = getClients();
  const employee = employees.find((item) => String(item.id) === String(caseRow?.employeeId));
  const client = clients.find((item) => item.name === caseRow?.client);
  const history = caseRow ? buildHistory(caseRow) : [];
  const clientDocs = client ? getDocuments('client', client.id) : [];
  const employeeDocs = employee ? getDocuments('employee', employee.id) : [];

  const [requestDocsForm, setRequestDocsForm] = useState((caseRow?.docsRequested || requestDocsTemplate).join(', '));
  const [requestNote, setRequestNote] = useState('');
  const [clientDocForm, setClientDocForm] = useState({ name: '', category: 'Client Onboarding Packet', note: '' });
  const [offerForm, setOfferForm] = useState({ version: 'v1', note: 'Generated mock offer letter for onboarding review.' });

  if (!caseRow) {
    return (
      <PortalLayout role="employer">
        <PageHeader title="Onboarding case not found" description="The requested onboarding case could not be located." actions={<button className="button button-secondary slim-button" onClick={() => navigate('/employer/onboarding')}>Back to Queue</button>} />
      </PortalLayout>
    );
  }

  const refresh = () => setRefreshKey((value) => value + 1);

  const openDialog = (type) => {
    setDialogType(type);
    setRequestDocsForm((caseRow.docsRequested || requestDocsTemplate).join(', '));
    setRequestNote('');
    setClientDocForm({ name: `${caseRow.client} Onboarding Packet.pdf`, category: 'Client Onboarding Packet', note: `Uploaded for ${caseRow.employee}` });
    setOfferForm({ version: 'v1', note: `Offer letter generated for ${caseRow.employee}` });
    setCloseForm({ outcome: 'complete', expiryDate: caseRow.assignmentEnd || '', note: '' });
    setRevertForm({
      effectiveDate: caseRow.assignmentEnd || new Date().toISOString().slice(0, 10),
      note: 'Client refused onboarding / onboarding issue. Employee returned to Marketing bench queue.',
    });
  };

  const closeDialog = () => setDialogType('');

  const saveRequestDocs = () => {
    const nextDocs = requestDocsForm.split(',').map((item) => item.trim()).filter(Boolean);
    updateOnboardingCase(caseRow.id, {
      docsRequested: nextDocs,
      taskCount: nextDocs.length,
      state: 'Document Collection',
      historyEntry: {
        date: new Date().toISOString().slice(0,10),
        action: `Requested docs: ${nextDocs.join(', ')}`,
        by: session.name,
        note: requestNote,
      },
    });
    closeDialog();
    refresh();
  };

  const saveClientDoc = () => {
    if (!client) return;
    addDocument('client', client.id, {
      name: clientDocForm.name,
      category: clientDocForm.category,
      note: clientDocForm.note,
      uploadedBy: session.name,
    });
    updateOnboardingCase(caseRow.id, {
      state: 'Client Docs Uploaded',
      historyEntry: {
        date: new Date().toISOString().slice(0,10),
        action: `Client doc uploaded: ${clientDocForm.name}`,
        by: session.name,
      },
    });
    closeDialog();
    refresh();
  };

  const saveOffer = () => {
    if (!employee) return;
    addDocument('employee', employee.id, {
      name: `${employee.name} Offer Letter ${offerForm.version}.pdf`,
      category: 'Offer Letter',
      note: offerForm.note,
      uploadedBy: session.name,
    });
    updateOnboardingCase(caseRow.id, {
      state: 'Offer Generated',
      historyEntry: {
        date: new Date().toISOString().slice(0,10),
        action: `Offer PDF generated (${offerForm.version})`,
        by: session.name,
      },
    });
    closeDialog();
    refresh();
  };

  const closeWorkflow = () => {
    const today = new Date().toISOString().slice(0,10);
    const effectiveExpiry = closeForm.expiryDate || caseRow.assignmentEnd || today;

    if (employee) {
      if (closeForm.outcome === 'cancelled') {
        updateEmployeeAssignment(employee.id, {
          action: 'bench',
          effectiveDate: effectiveExpiry,
        });
      } else {
        const currentAssignment = employee.currentAssignments?.[0];
        if (currentAssignment && currentAssignment.client === caseRow.client) {
          updateEmployeeAssignment(employee.id, {
            action: 'extend',
            endDate: effectiveExpiry,
            allocation: currentAssignment.allocation || '100%',
          });
        } else {
          updateEmployeeAssignment(employee.id, {
            action: 'assign',
            client: caseRow.client,
            project: employee.department || 'Project Assignment',
            startDate: today,
            endDate: effectiveExpiry,
            allocation: '100%',
            previousEndDate: today,
          });
        }
      }
    }

    updateOnboardingCase(caseRow.id, {
      assignmentEnd: effectiveExpiry,
      taskCount: closeForm.outcome === 'cancelled' ? caseRow.taskCount : 0,
      state: closeForm.outcome === 'cancelled' ? 'Cancelled' : 'Completed',
      closedOn: today,
      historyEntry: {
        date: today,
        action: closeForm.outcome === 'cancelled'
          ? `Workflow cancelled and employee moved to Bench (expiry ${effectiveExpiry})`
          : `Workflow completed with assignment expiry ${effectiveExpiry}`,
        by: session.name,
        note: closeForm.note,
      },
    });

    closeDialog();
    refresh();
  };

  const revertToMarketing = () => {
    const today = new Date().toISOString().slice(0,10);
    const effectiveDate = revertForm.effectiveDate || caseRow.assignmentEnd || today;

    if (employee) {
      updateEmployeeAssignment(employee.id, {
        action: 'bench',
        effectiveDate,
      });
    }

    updateOnboardingCase(caseRow.id, {
      state: 'Reverted To Marketing',
      closedOn: today,
      historyEntry: {
        date: today,
        action: `Case reverted to Marketing queue and employee moved to Bench`,
        by: session.name,
        note: revertForm.note,
      },
    });

    closeDialog();
    refresh();
  };

  return (
    <PortalLayout role="employer">
      <PageHeader
        eyebrow="HR onboarding case"
        title={`${caseRow.employee} - Onboarding`}
        description="Dedicated HR case view for requesting documents, uploading client artifacts, generating offer files, and reviewing onboarding history."
        actions={(
          <div className="page-actions-wrap">
            <button className="button button-secondary slim-button" onClick={() => navigate('/employer/onboarding')}>Back to Queue</button>
            <button className="button button-secondary slim-button" onClick={() => openDialog('requestDocs')}>Request Docs</button>
            <button className="button button-secondary slim-button" onClick={() => openDialog('clientDocs')}>Upload Client Docs</button>
            <button className="button slim-button" onClick={() => openDialog('offer')}>Generate Offer PDF</button>
            <button className="button button-secondary slim-button" onClick={() => openDialog('closeWorkflow')}>Close Workflow</button>
            <button className="button button-secondary slim-button" onClick={() => openDialog('revertWorkflow')}>Revert To Marketing</button>
          </div>
        )}
      />

      <div className="employee-section-stack">
        <section className="card section-card tracker-shell">
          <div className="section-head">
            <div>
              <span className="section-kicker">Case snapshot</span>
              <h3>Base Details</h3>
            </div>
          </div>
          <div className="simple-grid employee-detail-grid compact-tiles">
            <div className="card info-card"><div className="subtle">Employee</div><strong>{caseRow.employee}</strong></div>
            <div className="card info-card"><div className="subtle">Client</div><strong>{caseRow.client}</strong></div>
            <div className="card info-card"><div className="subtle">Vendor Path</div><strong>{caseRow.vendorPath}</strong></div>
            <div className="card info-card"><div className="subtle">HR Owner</div><strong>{caseRow.hr}</strong></div>
            <div className="card info-card"><div className="subtle">State</div><strong>{caseRow.state}</strong></div>
            <div className="card info-card"><div className="subtle">Assignment End</div><strong>{caseRow.assignmentEnd}</strong></div>
            <div className="card info-card"><div className="subtle">Requested Docs</div><strong>{caseRow.docsRequested.join(', ')}</strong></div>
            <div className="card info-card"><div className="subtle">Task Count</div><strong>{caseRow.taskCount}</strong></div>
            <div className="card info-card"><div className="subtle">Client Docs</div><strong>{clientDocs.length}</strong></div>
          </div>
        </section>

        <section className="card section-card">
          <div className="section-head">
            <div>
              <span className="section-kicker">Employee documents</span>
              <h3>Candidate Files</h3>
            </div>
          </div>
          <div className="table-wrap history-table-wrap">
            <table className="tracker-table">
              <thead>
                <tr><th>Document</th><th>Category</th><th>Status</th><th>Uploaded By</th><th>Date</th></tr>
              </thead>
              <tbody>
                {employeeDocs.length ? employeeDocs.map((doc) => (
                  <tr key={doc.id}>
                    <td><strong>{doc.name}</strong><div className="subtle">{doc.note || '-'}</div></td>
                    <td>{doc.category}</td>
                    <td>{doc.status}</td>
                    <td>{doc.uploadedBy}</td>
                    <td>{doc.uploadedOn}</td>
                  </tr>
                )) : <tr><td colSpan="5" className="empty-cell">No employee documents yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card section-card">
          <div className="section-head">
            <div>
              <span className="section-kicker">Onboarding audit</span>
              <h3>Case History</h3>
            </div>
          </div>
          <div className="table-wrap history-table-wrap">
            <table className="tracker-table">
              <thead>
                <tr><th>Date</th><th>Action</th><th>By</th><th>Note</th></tr>
              </thead>
              <tbody>
                {history.map((entry, idx) => (
                  <tr key={idx}>
                    <td>{entry.date}</td>
                    <td>{entry.action}</td>
                    <td>{entry.by}</td>
                    <td>{entry.note || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {dialogType === 'requestDocs' && (
        <div className="dialog-backdrop" onClick={closeDialog}>
          <div className="dialog-card onboarding-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-head">
              <div>
                <span className="section-kicker">Request employee docs</span>
                <h3>{caseRow.employee}</h3>
                <p>Update the requested document checklist and log the request in onboarding history.</p>
              </div>
              <button className="dialog-close" onClick={closeDialog}>&times;</button>
            </div>
            <div className="card onboarding-form-card dialog-form-surface">
              <div className="form-grid-2">
                <div className="grid-span-2"><label>Requested Documents</label><textarea rows="4" value={requestDocsForm} onChange={(e) => setRequestDocsForm(e.target.value)} placeholder="Comma-separated document list" /></div>
                <div className="grid-span-2"><label>Request Note</label><textarea rows="4" value={requestNote} onChange={(e) => setRequestNote(e.target.value)} placeholder="HR note for the employee or internal tracker" /></div>
              </div>
              <div className="dialog-actions top-gap">
                <button className="button button-secondary slim-button" onClick={closeDialog}>Cancel</button>
                <button className="button slim-button" onClick={saveRequestDocs}>Save Request</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {dialogType === 'clientDocs' && (
        <div className="dialog-backdrop" onClick={closeDialog}>
          <div className="dialog-card onboarding-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-head">
              <div>
                <span className="section-kicker">Upload client docs</span>
                <h3>{caseRow.client}</h3>
                <p>Attach mock client-side onboarding documents and log the activity in case history.</p>
              </div>
              <button className="dialog-close" onClick={closeDialog}>&times;</button>
            </div>
            <div className="card onboarding-form-card dialog-form-surface">
              <div className="form-grid-2">
                <div><label>Document Name</label><input value={clientDocForm.name} onChange={(e) => setClientDocForm((prev) => ({ ...prev, name: e.target.value }))} /></div>
                <div><label>Category</label><input value={clientDocForm.category} onChange={(e) => setClientDocForm((prev) => ({ ...prev, category: e.target.value }))} /></div>
                <div className="grid-span-2"><label>Note</label><textarea rows="4" value={clientDocForm.note} onChange={(e) => setClientDocForm((prev) => ({ ...prev, note: e.target.value }))} /></div>
              </div>
              <div className="dialog-actions top-gap">
                <button className="button button-secondary slim-button" onClick={closeDialog}>Cancel</button>
                <button className="button slim-button" onClick={saveClientDoc}>Upload Metadata</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {dialogType === 'offer' && (
        <div className="dialog-backdrop" onClick={closeDialog}>
          <div className="dialog-card onboarding-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-head">
              <div>
                <span className="section-kicker">Generate offer PDF</span>
                <h3>{caseRow.employee}</h3>
                <p>Create a mock offer letter artifact and capture it in employee documents for the demo.</p>
              </div>
              <button className="dialog-close" onClick={closeDialog}>&times;</button>
            </div>
            <div className="card onboarding-form-card dialog-form-surface">
              <div className="form-grid-2">
                <div><label>Offer Version</label><input value={offerForm.version} onChange={(e) => setOfferForm((prev) => ({ ...prev, version: e.target.value }))} /></div>
                <div className="grid-span-2"><label>Offer Note</label><textarea rows="4" value={offerForm.note} onChange={(e) => setOfferForm((prev) => ({ ...prev, note: e.target.value }))} /></div>
              </div>
              <div className="dialog-actions top-gap">
                <button className="button button-secondary slim-button" onClick={closeDialog}>Cancel</button>
                <button className="button slim-button" onClick={saveOffer}>Generate PDF Metadata</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {dialogType === 'closeWorkflow' && (
        <div className="dialog-backdrop" onClick={closeDialog}>
          <div className="dialog-card onboarding-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-head">
              <div>
                <span className="section-kicker">Close onboarding workflow</span>
                <h3>{caseRow.employee}</h3>
                <p>Set the assignment expiry date, then either complete the onboarding workflow or cancel it and return the employee to the Marketing bench queue.</p>
              </div>
              <button className="dialog-close" onClick={closeDialog}>&times;</button>
            </div>
            <div className="card onboarding-form-card dialog-form-surface">
              <div className="form-grid-2">
                <div>
                  <label>Outcome</label>
                  <select value={closeForm.outcome} onChange={(e) => setCloseForm((prev) => ({ ...prev, outcome: e.target.value }))}>
                    <option value="complete">Mark Complete</option>
                    <option value="cancelled">Mark Cancelled</option>
                  </select>
                </div>
                <div>
                  <label>Assignment Expiry Date</label>
                  <input type="date" value={closeForm.expiryDate} onChange={(e) => setCloseForm((prev) => ({ ...prev, expiryDate: e.target.value }))} />
                </div>
                <div className="grid-span-2">
                  <label>Closure Note</label>
                  <textarea rows="4" value={closeForm.note} onChange={(e) => setCloseForm((prev) => ({ ...prev, note: e.target.value }))} placeholder="Reason for completion or cancellation" />
                </div>
              </div>
              <div className="dialog-actions top-gap">
                <button className="button button-secondary slim-button" onClick={closeDialog}>Cancel</button>
                <button className="button slim-button" onClick={closeWorkflow}>
                  {closeForm.outcome === 'cancelled' ? 'Cancel Workflow' : 'Complete Workflow'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {dialogType === 'revertWorkflow' && (
        <div className="dialog-backdrop" onClick={closeDialog}>
          <div className="dialog-card onboarding-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-head">
              <div>
                <span className="section-kicker">Revert to marketing</span>
                <h3>{caseRow.employee}</h3>
                <p>Move this onboarding case back to Marketing, put the employee on Bench again, and capture the reason for the rollback.</p>
              </div>
              <button className="dialog-close" onClick={closeDialog}>&times;</button>
            </div>
            <div className="card onboarding-form-card dialog-form-surface">
              <div className="form-grid-2">
                <div>
                  <label>Effective Date</label>
                  <input type="date" value={revertForm.effectiveDate} onChange={(e) => setRevertForm((prev) => ({ ...prev, effectiveDate: e.target.value }))} />
                </div>
                <div className="grid-span-2">
                  <label>Reason</label>
                  <textarea rows="4" value={revertForm.note} onChange={(e) => setRevertForm((prev) => ({ ...prev, note: e.target.value }))} placeholder="Explain why onboarding is being sent back to Marketing" />
                </div>
              </div>
              <div className="dialog-actions top-gap">
                <button className="button button-secondary slim-button" onClick={closeDialog}>Cancel</button>
                <button className="button slim-button" onClick={revertToMarketing}>Revert Case</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
