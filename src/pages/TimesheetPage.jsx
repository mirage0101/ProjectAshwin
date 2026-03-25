import { useEffect, useMemo, useState } from 'react';
import PortalLayout from '../layouts/PortalLayout';
import PageHeader from '../components/PageHeader';
import { adminEmployees } from '../services/mockData';

const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const clients = ['Apex Health', 'ASH Internal', 'FinEdge', 'Blue Orbit'];
const copyWeekOptions = ['Last week', 'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];

function makeWeekRows(sourceWeek = 'Week 3') {
  const base = [
    ['Mon', '2026-03-09', 'Approved'],
    ['Tue', '2026-03-10', 'Approved'],
    ['Wed', '2026-03-11', 'Submitted'],
    ['Thu', '2026-03-12', 'Submitted'],
    ['Fri', '2026-03-13', 'Submitted'],
    ['Sat', '2026-03-14', 'Pending'],
    ['Sun', '2026-03-15', 'Pending'],
  ];
  const hourSets = {
    'Week 1': [9, 8, 8.5, 9, 7.5, 0, 0],
    'Week 2': [8, 8, 8, 7.5, 8.5, 0, 0],
    'Week 3': [8, 8, 6, 8, 6, 0, 0],
    'Week 4': [10, 9, 8, 8.5, 7, 0, 0],
    'Week 5': [8, 9, 9, 8, 8, 0, 0],
    'Last week': [8, 8, 7.5, 8, 7.5, 0, 0],
  };
  const hoursForWeek = hourSets[sourceWeek] || hourSets['Week 3'];
  return base.map(([day, date, status], idx) => ({
    id: idx + 1,
    day,
    date,
    client: idx < 5 ? 'Apex Health' : '',
    hours: idx < 5 ? hoursForWeek[idx] : 0,
    notes: idx < 5 ? 'Weekly project work' : '',
    status,
  }));
}

function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map((v) => `"${String(v ?? '').replaceAll('\"', '\"\"')}"`).join(',')).join('\n');
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

function HoursInput({ value, onChange, status }) {
  const numericValue = Number(value || 0);
  const statusLabel = status === 'Approved' ? 'Approved' : status === 'Submitted' ? 'Submitted' : 'Draft';
  const statusIcon = status === 'Approved' ? '✓' : status === 'Submitted' ? '✓' : '•';
  return (
    <div className="hours-cell">
      <div className="hours-stepper native-hours-stepper">
        <input
          type="number"
          min="0"
          max="24"
          step="0.5"
          value={Number.isFinite(numericValue) ? numericValue : 0}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`Hours for ${statusLabel} entry`}
        />
      </div>
      <span className={`timesheet-status-chip ${status.toLowerCase()}`} title={statusLabel} aria-label={statusLabel}>
        <span className="status-icon">{statusIcon}</span>
        <span className="status-text">{statusLabel}</span>
      </span>
    </div>
  );
}

export default function TimesheetPage({ role }) {
  const isEmployer = role === 'employer';
  const [year, setYear] = useState('2026');
  const [month, setMonth] = useState('March');
  const [week, setWeek] = useState('Week 3');
  const [rows, setRows] = useState(makeWeekRows('Week 3'));
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [copySourceWeek, setCopySourceWeek] = useState('Last week');
  const [saveState, setSaveState] = useState('Saved just now');
  const [lastSavedAt, setLastSavedAt] = useState(new Date());

  const total = useMemo(() => rows.reduce((sum, row) => sum + Number(row.hours || 0), 0), [rows]);
  const weekStatus = useMemo(() => {
    if (rows.every((row) => row.status === 'Approved')) return 'Approved';
    if (rows.some((row) => row.status === 'Submitted')) return 'Submitted';
    return 'Draft';
  }, [rows]);

  const updateRow = (id, field, value) => {
    setRows((old) => old.map((row) => row.id === id ? { ...row, [field]: field === 'hours' ? Number(value) : value } : row));
    setSaveState('Saving...');
  };

  const copyWeekValues = () => {
    const sourceRows = makeWeekRows(copySourceWeek);
    setRows((old) => old.map((row, index) => ({
      ...row,
      hours: sourceRows[index]?.hours ?? row.hours,
      client: sourceRows[index]?.client ?? row.client,
      notes: sourceRows[index]?.notes ? `${sourceRows[index].notes} · copied from ${copySourceWeek}` : row.notes,
    })));
    setSaveState(`Copied from ${copySourceWeek}`);
    setLastSavedAt(new Date());
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

  const employerSummary = useMemo(() => adminEmployees.map((employee, idx) => ({
    employee: employee.name,
    entity: employee.entity,
    department: employee.department,
    client: employee.client,
    week,
    month,
    year,
    totalHours: [40, 39, 38, 42, 36][idx % 5],
    status: idx % 3 === 0 ? 'Approved' : idx % 3 === 1 ? 'Submitted' : 'Pending',
  })), [week, month, year]);

  const allSelected = employerSummary.length > 0 && selectedEmployees.length === employerSummary.length;
  const toggleEmployee = (name) => setSelectedEmployees((old) => old.includes(name) ? old.filter((item) => item !== name) : [...old, name]);
  const toggleAll = () => setSelectedEmployees(allSelected ? [] : employerSummary.map((row) => row.employee));
  const selectedRows = employerSummary.filter((row) => selectedEmployees.includes(row.employee));

  const downloadEmployerCsv = () => {
    const source = selectedRows.length ? selectedRows : employerSummary;
    const csvRows = [
      ['Employee', 'Entity', 'Department', 'Client', 'Week', 'Month', 'Year', 'Total Hours', 'Status'],
      ...source.map((item) => [item.employee, item.entity, item.department, item.client, item.week, item.month, item.year, item.totalHours, item.status]),
    ];
    downloadCsv(`timesheets-${year}-${month}-${week.replace(/\s+/g, '-').toLowerCase()}.csv`, csvRows);
  };

  return (
    <PortalLayout role={role}>
      <PageHeader
        title={isEmployer ? 'Timesheets' : 'Time Sheet'}
        description={isEmployer ? 'Review weekly submissions by employee before payroll readiness and approval.' : 'Enter one weekly timesheet at a time by month, year, and week with client, hours, and notes.'}
        actions={(
          <div className="inline-actions">
            {isEmployer ? <button className="button button-secondary" onClick={downloadEmployerCsv}>Download CSV</button> : null}
            <button className="button">{isEmployer ? `Approve Selected${selectedRows.length ? ` (${selectedRows.length})` : ''}` : 'Submit Weekly Timesheet'}</button>
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
            <div className="timesheet-save-state">{saveState}{lastSavedAt ? ` · ${lastSavedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : ''}</div>
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

      <div className="card toolbar-card">
        <div className="filter-grid" style={{ gridTemplateColumns: isEmployer ? 'repeat(5,minmax(0,1fr))' : 'repeat(4,minmax(0,1fr))' }}>
          <div className="filter-group">
            <label htmlFor="year-filter">Year</label>
            <select id="year-filter" value={year} onChange={(e) => setYear(e.target.value)}>
              <option>2026</option><option>2025</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="month-filter">Month</label>
            <select id="month-filter" value={month} onChange={(e) => setMonth(e.target.value)}>
              {monthNames.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="week-filter">Week</label>
            <select id="week-filter" value={week} onChange={(e) => setWeek(e.target.value)}>
              <option>Week 1</option><option>Week 2</option><option>Week 3</option><option>Week 4</option><option>Week 5</option>
            </select>
          </div>
          {isEmployer ? (
            <div className="filter-group">
              <label htmlFor="status-filter">Status</label>
              <select id="status-filter" defaultValue="All">
                <option>All Employees</option><option>Approved</option><option>Submitted</option><option>Pending</option>
              </select>
            </div>
          ) : null}
          {!isEmployer ? (
            <div className="filter-group copy-week-group">
              <label htmlFor="copy-week-filter">Copy Hours</label>
              <div className="copy-week-actions">
                <select id="copy-week-filter" value={copySourceWeek} onChange={(e) => setCopySourceWeek(e.target.value)}>
                  {copyWeekOptions.map((option) => <option key={option}>{option}</option>)}
                </select>
                <button type="button" className="button button-secondary" onClick={copyWeekValues}>Copy</button>
              </div>
            </div>
          ) : null}
          <div className="card info-card total-hours-card" style={{ background: 'var(--surface-alt)' }}>
            <strong>{isEmployer ? `Selected: ${selectedRows.length || employerSummary.length}` : `Total Hours: ${total}`}</strong>
          </div>
        </div>
      </div>

      {isEmployer ? (
        <div className="table-wrap card">
          <table>
            <thead>
              <tr>
                <th><input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all employees" /></th>
                <th>Employee</th><th>Entity</th><th>Department</th><th>Client</th><th>Week</th><th>Month</th><th>Hours</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {employerSummary.map((row) => {
                const checked = selectedEmployees.includes(row.employee);
                return (
                  <tr key={row.employee}>
                    <td><input type="checkbox" checked={checked} onChange={() => toggleEmployee(row.employee)} aria-label={`Select ${row.employee}`} /></td>
                    <td>{row.employee}</td>
                    <td><span className="badge readable-badge">{row.entity}</span></td>
                    <td>{row.department}</td>
                    <td>{row.client}</td>
                    <td>{row.week}</td>
                    <td>{row.month} {row.year}</td>
                    <td>{row.totalHours}</td>
                    <td>{row.status}</td>
                    <td><button className="button button-secondary slim-button" onClick={() => setSelectedEmployees([row.employee])}>Select</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card timesheet-grid-card">
          <div className="timesheet-column-headings" aria-hidden="true">
            <div>Date/Day</div>
            <div>Hours</div>
            <div>Client</div>
            <div>Notes</div>
          </div>
          {rows.map((row) => (
            <div key={row.id} className="timesheet-week-row four-column-row">
              <div>
                <strong>{month.slice(0,3)} {row.date.slice(8)}, {row.day}</strong>
                <div className="date-pill">{row.date}</div>
              </div>
              <div>
                <HoursInput value={row.hours} status={row.status} onChange={(value) => updateRow(row.id, 'hours', value)} />
              </div>
              <div><select value={row.client} onChange={(e) => updateRow(row.id, 'client', e.target.value)}>{clients.map((c) => <option key={c}>{c}</option>)}</select></div>
              <div><input value={row.notes} onChange={(e) => updateRow(row.id, 'notes', e.target.value)} placeholder="Notes" /></div>
            </div>
          ))}
        </div>
      )}
    </PortalLayout>
  );
}
