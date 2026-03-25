import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PortalLayout from '../layouts/PortalLayout';
import PageHeader from '../components/PageHeader';
import { apiPlaceholders, showApiPlaceholder } from '../services/apiPlaceholders';
import { getSession } from '../services/session';
import { getEmployees, getTimesheets, saveTimesheet, updateTimesheet } from '../services/portalStore';

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const copyWeekOptions = ['Last week'];
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function startOfWeek(input) {
  const date = new Date(input);
  const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  normalized.setDate(normalized.getDate() - normalized.getDay());
  return normalized;
}

function toIso(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString().slice(0, 10);
}

function formatShort(date) {
  return `${monthNames[date.getMonth()].slice(0, 3)} ${String(date.getDate()).padStart(2, '0')}`;
}

function buildWeekRows(anchorDate, sourceWeek = 'Week 3') {
  const weekStart = startOfWeek(anchorDate);
  const hourSets = {
    'Week 1': ['9', '8', '8.5', '9', '7.5', '0', '0'],
    'Week 2': ['8', '8', '8', '7.5', '8.5', '0', '0'],
    'Week 3': ['8', '8', '6', '8', '6', '0', '0'],
    'Week 4': ['10', '9', '8', '8.5', '7', '0', '0'],
    'Week 5': ['8', '9', '9', '8', '8', '0', '0'],
    'Last week': ['8', '8', '7.5', '8', '7.5', '0', '0'],
  };
  const hoursForWeek = hourSets[sourceWeek] || hourSets['Week 3'];
  return dayNames.map((day, idx) => {
    const current = new Date(weekStart);
    current.setDate(weekStart.getDate() + idx);
    return {
      id: idx + 1,
      day,
      date: toIso(current),
      hours: hoursForWeek[idx],
      status: idx < 2 ? 'Approved' : idx < 5 ? 'Submitted' : 'Draft',
    };
  });
}

function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function TimesheetPage({ role }) {
  const isEmployer = role === 'employer';
  const navigate = useNavigate();
  const session = getSession();
  const employeeProfile = !isEmployer ? getEmployees().find((item) => item.email === session.email) : null;
  const assignedClient = employeeProfile?.currentAssignments?.[0]?.client || employeeProfile?.client || 'Bench';
  const initialAnchor = new Date('2026-03-11');
  const [year, setYear] = useState(isEmployer ? 'All' : '2026');
  const [month, setMonth] = useState(isEmployer ? 'All' : 'March');
  const [week, setWeek] = useState('Week 3');
  const [refreshKey, setRefreshKey] = useState(0);
  const [rows, setRows] = useState(buildWeekRows(initialAnchor, 'Week 3'));
  const [anchorDate, setAnchorDate] = useState(toIso(initialAnchor));
  const [selectedTimesheets, setSelectedTimesheets] = useState([]);
  const [copySourceWeek, setCopySourceWeek] = useState('Last week');
  const [saveState, setSaveState] = useState('Saved just now');
  const [lastSavedAt, setLastSavedAt] = useState(new Date());
  const [supportingDocs, setSupportingDocs] = useState([]);
  const [docDraft, setDocDraft] = useState({ name: '', note: '' });
  const [statusFilter, setStatusFilter] = useState('Submitted');
  const [searchTerm, setSearchTerm] = useState('');

  const total = useMemo(() => rows.reduce((sum, row) => sum + Number(row.hours || 0), 0), [rows]);
  const weekStatus = useMemo(() => {
    if (rows.every((row) => row.status === 'Approved')) return 'Approved';
    if (rows.some((row) => row.status === 'Submitted')) return 'Submitted';
    return 'Draft';
  }, [rows]);

  const weekStart = useMemo(() => startOfWeek(anchorDate), [anchorDate]);
  const weekRangeLabel = `${formatShort(weekStart)} - ${formatShort(new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6))}`;

  const moveWeek = (direction) => {
    const next = new Date(weekStart);
    next.setDate(weekStart.getDate() + (direction * 7));
    setAnchorDate(toIso(next));
    setRows(buildWeekRows(next, week));
    setSaveState('Saved just now');
  };

  const selectWeekByDate = (value) => {
    setAnchorDate(value);
    setRows(buildWeekRows(value, week));
  };

  const updateHours = (id, value) => {
    setRows((old) => old.map((row) => row.id === id ? { ...row, hours: value, status: 'Draft' } : row));
    setSaveState('Saving...');
  };

  const copyWeekValues = () => {
    const sourceRows = buildWeekRows(anchorDate, copySourceWeek);
    setRows((old) => old.map((row, index) => ({
      ...row,
      hours: sourceRows[index]?.hours ?? row.hours,
      status: 'Draft',
    })));
    setSaveState(`Copied from ${copySourceWeek}`);
    setLastSavedAt(new Date());
  };

  const addSupportingDoc = () => {
    if (!docDraft.name) return;
    setSupportingDocs((old) => [...old, {
      id: `ts-doc-${Date.now()}`,
      name: docDraft.name,
      note: docDraft.note,
      uploadedOn: new Date().toISOString().slice(0, 10),
    }]);
    setDocDraft({ name: '', note: '' });
  };

  const submitWeeklyTimesheet = () => {
    if (!supportingDocs.length || !employeeProfile) return;
    const submittedRows = rows.map((row) => ({ ...row, status: 'Submitted' }));
    setRows(submittedRows);
    setSaveState('Submitted to HR approvals');
    setLastSavedAt(new Date());
    saveTimesheet({
      employeeId: employeeProfile.id,
      employee: employeeProfile.name,
      employeeEmail: employeeProfile.email,
      entity: employeeProfile.entity,
      department: employeeProfile.department,
      client: assignedClient,
      weekStart: toIso(weekStart),
      weekEnd: toIso(new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6)),
      weekLabel: weekRangeLabel,
      month: monthNames[weekStart.getMonth()],
      year: String(weekStart.getFullYear()),
      totalHours: total,
      dailyEntries: submittedRows,
      supportingDocs,
    });
    showApiPlaceholder(
      'Weekly timesheet submitted to HR approvals',
      `${apiPlaceholders.employee.submitTimesheet.replace(':id', weekRangeLabel)}\n${apiPlaceholders.employee.uploadDocument}`
    );
  };

  useEffect(() => {
    if (isEmployer) return undefined;
    if (saveState !== 'Saving...') return undefined;
    const timer = window.setTimeout(() => {
      setLastSavedAt(new Date());
      setSaveState('Saved just now');
    }, 700);
    return () => window.clearTimeout(timer);
  }, [saveState, isEmployer, rows]);

  const employerSummary = useMemo(() => getTimesheets().filter((item) => {
    const matchesMonth = month === 'All' || item.month === month;
    const matchesYear = year === 'All' || item.year === year;
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const search = searchTerm.trim().toLowerCase();
    const matchesSearch = !search || [item.employee, item.entity, item.department, item.client, item.weekLabel, item.status]
      .some((value) => String(value || '').toLowerCase().includes(search));
    return matchesMonth && matchesYear && matchesStatus && matchesSearch;
  }), [month, year, statusFilter, searchTerm, refreshKey]);

  const allSelected = employerSummary.length > 0 && selectedTimesheets.length === employerSummary.length;
  const toggleTimesheet = (id) => setSelectedTimesheets((old) => old.includes(id) ? old.filter((item) => item !== id) : [...old, id]);
  const toggleAll = () => setSelectedTimesheets(allSelected ? [] : employerSummary.map((row) => row.id));
  const selectedRows = employerSummary.filter((row) => selectedTimesheets.includes(row.id));

  const downloadEmployerCsv = () => {
    const source = selectedRows.length ? selectedRows : employerSummary;
    const csvRows = [
      ['Employee', 'Entity', 'Department', 'Client', 'Week', 'Month', 'Year', 'Total Hours', 'Status'],
      ...source.map((item) => [item.employee, item.entity, item.department, item.client, item.weekLabel, item.month, item.year, item.totalHours, item.status]),
    ];
    downloadCsv(`timesheets-${year}-${month}-${statusFilter.toLowerCase()}.csv`, csvRows);
  };

  const approveTimesheets = (ids) => {
    ids.forEach((id) => {
      updateTimesheet(id, { status: 'Approved', reviewNote: 'Approved from employer timesheet queue.' });
    });
    setSelectedTimesheets([]);
    setRefreshKey((value) => value + 1);
  };

  return (
    <PortalLayout role={role}>
      <PageHeader
        title={isEmployer ? 'Timesheets' : 'Time Sheet'}
        description={isEmployer ? 'Review pending weekly submissions, open full detail pages, and keep approved records in searchable history.' : 'Submit one full week at a time with Sunday-start navigation, fixed assigned-client entry, and mandatory supporting documents before HR submission.'}
        actions={(
          <div className="inline-actions">
            {isEmployer ? <button className="button button-secondary slim-button" onClick={downloadEmployerCsv}>Download CSV</button> : null}
            {isEmployer ? <button className="button slim-button" onClick={() => approveTimesheets(selectedRows.map((row) => row.id))} disabled={!selectedRows.length || statusFilter !== 'Submitted'}>{`Approve Selected${selectedRows.length ? ` (${selectedRows.length})` : ''}`}</button> : null}
          </div>
        )}
      />

      {!isEmployer ? (
        <div className="timesheet-meta-bar card">
          <div className="timesheet-meta-left">
            <div className={`timesheet-overall-status status-${weekStatus.toLowerCase()}`}>
              <span className="status-dot" />
              <span>Status: {weekStatus}</span>
            </div>
            <div className="timesheet-save-state">{saveState}{lastSavedAt ? ` - ${lastSavedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : ''}</div>
          </div>
          <div className="timesheet-meta-right">
            <div className="timesheet-legend" aria-label="Timesheet status legend">
              <span className="legend-item approved"><span className="legend-dot">✓</span> Approved</span>
              <span className="legend-item submitted"><span className="legend-dot">✓</span> Submitted</span>
              <span className="legend-item draft"><span className="legend-dot">•</span> Draft</span>
            </div>
          </div>
        </div>
      ) : null}

      {isEmployer ? (
        <>
          <div className="card toolbar-card">
            <div className="filter-grid" style={{ gridTemplateColumns: 'repeat(5,minmax(0,1fr))' }}>
              <div className="filter-group">
                <label htmlFor="year-filter">Year</label>
                <select id="year-filter" value={year} onChange={(e) => setYear(e.target.value)}>
                  <option>All</option>
                  <option>2026</option>
                  <option>2025</option>
                </select>
              </div>
              <div className="filter-group">
                <label htmlFor="month-filter">Month</label>
                <select id="month-filter" value={month} onChange={(e) => setMonth(e.target.value)}>
                  <option>All</option>
                  {monthNames.map((item) => <option key={item}>{item}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label htmlFor="status-filter">Status</label>
                <select id="status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option>Submitted</option>
                  <option>Approved</option>
                  <option>Rejected</option>
                  <option>All</option>
                </select>
              </div>
              <div className="filter-group">
                <label htmlFor="search-filter">Search</label>
                <input id="search-filter" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Employee, client, week" />
              </div>
              <div className="card info-card total-hours-card" style={{ background: 'var(--surface-alt)' }}>
                <strong>{statusFilter === 'Submitted' ? `Pending Review: ${employerSummary.length}` : `History Rows: ${employerSummary.length}`}</strong>
              </div>
            </div>
          </div>

          <div className="table-wrap card">
            <table>
              <thead>
                <tr>
                  <th><input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all timesheets" /></th>
                  <th>Employee</th>
                  <th>Entity</th>
                  <th>Department</th>
                  <th>Client</th>
                  <th>Week</th>
                  <th>Month</th>
                  <th>Hours</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {employerSummary.map((row) => {
                  const checked = selectedTimesheets.includes(row.id);
                  return (
                    <tr key={row.id}>
                      <td><input type="checkbox" checked={checked} onChange={() => toggleTimesheet(row.id)} aria-label={`Select ${row.employee}`} /></td>
                      <td>{row.employee}</td>
                      <td><span className="badge readable-badge">{row.entity}</span></td>
                      <td>{row.department}</td>
                      <td>{row.client}</td>
                      <td>{row.weekLabel}</td>
                      <td>{row.month} {row.year}</td>
                      <td>{row.totalHours}</td>
                      <td>{row.status}</td>
                      <td className="inline-actions">
                        <button className="button button-secondary slim-button" onClick={() => navigate(`/employer/timesheets/${row.id}`)}>Details</button>
                        {row.status === 'Submitted' ? <button className="button slim-button" onClick={() => approveTimesheets([row.id])}>Approve</button> : null}
                      </td>
                    </tr>
                  );
                })}
                {!employerSummary.length ? <tr><td colSpan="10" className="empty-cell">{statusFilter === 'Submitted' ? 'No pending timesheets for review.' : 'No historical timesheets match the current filters.'}</td></tr> : null}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          <div className="card toolbar-card timesheet-week-toolbar">
            <div className="timesheet-week-nav">
              <button className="button button-secondary slim-button" onClick={() => moveWeek(-1)}>&lt; Previous Week</button>
              <div className="timesheet-week-range">
                <strong>{weekRangeLabel}</strong>
                <span>Sunday to Saturday</span>
              </div>
              <button className="button button-secondary slim-button" onClick={() => moveWeek(1)}>Next Week &gt;</button>
            </div>
            <div className="timesheet-week-picker">
              <div className="filter-group compact-width">
                <label htmlFor="week-date-picker">Calendar</label>
                <input id="week-date-picker" type="date" value={anchorDate} onChange={(e) => selectWeekByDate(e.target.value)} />
              </div>
              <div className="filter-group compact-width">
                <label>Assigned Client</label>
                <input value={assignedClient} readOnly />
              </div>
              <div className="filter-group compact-width copy-week-group">
                <label htmlFor="copy-week-filter">Copy Hours</label>
                <div className="copy-week-actions">
                  <select id="copy-week-filter" value={copySourceWeek} onChange={(e) => setCopySourceWeek(e.target.value)}>
                    {copyWeekOptions.map((option) => <option key={option}>{option}</option>)}
                  </select>
                  <button type="button" className="button button-secondary slim-button" onClick={copyWeekValues}>Copy</button>
                </div>
              </div>
            </div>
          </div>

          <div className="card timesheet-grid-card weekly-sheet-card">
            <div className="timesheet-week-grid">
              {rows.map((row) => (
                <div key={row.id} className="timesheet-day-card">
                  <div className="timesheet-day-head">
                    <strong>{row.day}</strong>
                    <span>{row.date}</span>
                  </div>
                  <label className="subtle">Hours</label>
                  <input
                    className="timesheet-hours-text"
                    value={row.hours}
                    onChange={(e) => updateHours(row.id, e.target.value)}
                    placeholder="0"
                    inputMode="decimal"
                  />
                  <div className={`timesheet-status-chip ${String(row.status).toLowerCase()}`} title={row.status}>
                    <span className="status-text">{row.status}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="timesheet-week-footer">
              <div className="card info-card total-hours-card timesheet-total-box">
                <strong>Total Hours: {total}</strong>
                <p className="subtle">The week is submitted against the assigned client only. Supporting docs are required before sending to HR approvals.</p>
              </div>
            </div>
          </div>

          <div className="card section-card">
            <div className="section-head">
              <div>
                <span className="section-kicker">Week-level attachments</span>
                <h3>Supporting Documents</h3>
              </div>
            </div>
            <div className="form-grid-2">
              <div><label>Document Name</label><input value={docDraft.name} onChange={(e) => setDocDraft((prev) => ({ ...prev, name: e.target.value }))} placeholder="Weekly summary / travel log / work evidence" /></div>
              <div><label>Document Note</label><input value={docDraft.note} onChange={(e) => setDocDraft((prev) => ({ ...prev, note: e.target.value }))} placeholder="Optional note for HR reviewer" /></div>
            </div>
            <div className="dialog-actions top-gap">
              <button className="button button-secondary slim-button" onClick={addSupportingDoc}>Add Supporting Doc</button>
              <button className="button slim-button" onClick={submitWeeklyTimesheet} disabled={!supportingDocs.length}>Submit Timesheet To HR</button>
            </div>
            {!supportingDocs.length ? <p className="subtle top-gap">Add at least one supporting document for the week before submitting to HR.</p> : null}
            <div className="table-wrap history-table-wrap top-gap">
              <table className="tracker-table">
                <thead>
                  <tr><th>Document</th><th>Note</th><th>Uploaded On</th></tr>
                </thead>
                <tbody>
                  {supportingDocs.length ? supportingDocs.map((doc) => (
                    <tr key={doc.id}>
                      <td><strong>{doc.name}</strong></td>
                      <td>{doc.note || '-'}</td>
                      <td>{doc.uploadedOn}</td>
                    </tr>
                  )) : <tr><td colSpan="3" className="empty-cell">No supporting docs added for this week yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </PortalLayout>
  );
}
