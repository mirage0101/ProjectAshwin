import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PortalLayout from '../layouts/PortalLayout';
import PageHeader from '../components/PageHeader';
import { getTimesheets, updateTimesheet } from '../services/portalStore';

export default function TimesheetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [reviewNote, setReviewNote] = useState('');

  const timesheet = useMemo(
    () => getTimesheets().find((row) => row.id === id),
    [id, refreshKey]
  );

  if (!timesheet) {
    return (
      <PortalLayout role="employer">
        <PageHeader
          title="Timesheet not found"
          description="The selected weekly submission could not be located."
          actions={<button className="button button-secondary slim-button" onClick={() => navigate('/employer/timesheets')}>Back to Timesheets</button>}
        />
      </PortalLayout>
    );
  }

  const reviewTimesheet = (status) => {
    updateTimesheet(timesheet.id, {
      status,
      reviewNote,
    });
    setRefreshKey((value) => value + 1);
  };

  return (
    <PortalLayout role="employer">
      <PageHeader
        eyebrow="Timesheet review"
        title={`${timesheet.employee} - ${timesheet.weekLabel}`}
        description="Review submitted weekly hours and supporting documents before approving or rejecting the submission."
        actions={(
          <div className="inline-actions">
            <button className="button button-secondary slim-button" onClick={() => navigate('/employer/timesheets')}>Back to Timesheets</button>
            <button className="button button-secondary slim-button" onClick={() => navigate('/employer/approvals')}>Approvals Inbox</button>
          </div>
        )}
      />

      <div className="employee-section-stack">
        <section className="card section-card tracker-shell">
          <div className="section-head">
            <div>
              <span className="section-kicker">Submission overview</span>
              <h3>Basic Details</h3>
            </div>
          </div>
          <div className="simple-grid employee-detail-grid compact-tiles">
            <div className="card info-card"><div className="subtle">Employee</div><strong>{timesheet.employee}</strong></div>
            <div className="card info-card"><div className="subtle">Entity</div><strong>{timesheet.entity}</strong></div>
            <div className="card info-card"><div className="subtle">Department</div><strong>{timesheet.department}</strong></div>
            <div className="card info-card"><div className="subtle">Client</div><strong>{timesheet.client}</strong></div>
            <div className="card info-card"><div className="subtle">Week</div><strong>{timesheet.weekLabel}</strong></div>
            <div className="card info-card"><div className="subtle">Total Hours</div><strong>{timesheet.totalHours}</strong></div>
            <div className="card info-card"><div className="subtle">Status</div><strong>{timesheet.status}</strong></div>
            <div className="card info-card"><div className="subtle">Submitted On</div><strong>{timesheet.submittedOn || '-'}</strong></div>
            <div className="card info-card"><div className="subtle">Reviewed By</div><strong>{timesheet.reviewedBy || '-'}</strong></div>
          </div>
        </section>

        <section className="card section-card">
          <div className="section-head">
            <div>
              <span className="section-kicker">Week entries</span>
              <h3>Daily Hours</h3>
            </div>
          </div>
          <div className="table-wrap history-table-wrap">
            <table className="tracker-table">
              <thead>
                <tr><th>Day</th><th>Date</th><th>Hours</th><th>Status</th></tr>
              </thead>
              <tbody>
                {timesheet.dailyEntries.map((entry) => (
                  <tr key={entry.date}>
                    <td>{entry.day}</td>
                    <td>{entry.date}</td>
                    <td>{entry.hours}</td>
                    <td>{entry.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card section-card">
          <div className="section-head">
            <div>
              <span className="section-kicker">Supporting evidence</span>
              <h3>Submitted Documents</h3>
            </div>
          </div>
          <div className="table-wrap history-table-wrap">
            <table className="tracker-table">
              <thead>
                <tr><th>Document</th><th>Note</th><th>Uploaded On</th></tr>
              </thead>
              <tbody>
                {timesheet.supportingDocs.length ? timesheet.supportingDocs.map((doc) => (
                  <tr key={doc.id}>
                    <td><strong>{doc.name}</strong></td>
                    <td>{doc.note || '-'}</td>
                    <td>{doc.uploadedOn}</td>
                  </tr>
                )) : <tr><td colSpan="3" className="empty-cell">No supporting documents were attached.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card section-card">
          <div className="section-head">
            <div>
              <span className="section-kicker">Review action</span>
              <h3>Approve Or Reject</h3>
            </div>
          </div>
          <div className="form-grid-2">
            <div className="grid-span-2">
              <label>Review Note</label>
              <textarea rows="4" value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} placeholder="Add an HR/Admin review note" />
            </div>
          </div>
          <div className="dialog-actions top-gap">
            <button className="button button-secondary slim-button" onClick={() => reviewTimesheet('Rejected')}>Reject</button>
            <button className="button slim-button" onClick={() => reviewTimesheet('Approved')}>Approve</button>
          </div>
        </section>

        <section className="card section-card">
          <div className="section-head">
            <div>
              <span className="section-kicker">Audit trail</span>
              <h3>Review History</h3>
            </div>
          </div>
          <div className="table-wrap history-table-wrap">
            <table className="tracker-table">
              <thead>
                <tr><th>Date</th><th>Action</th><th>By</th><th>Note</th></tr>
              </thead>
              <tbody>
                {(timesheet.reviewHistory || []).map((entry, index) => (
                  <tr key={`${entry.date}-${index}`}>
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
    </PortalLayout>
  );
}
