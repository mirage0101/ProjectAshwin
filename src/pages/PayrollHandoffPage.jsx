import { useMemo, useState } from 'react';
import PortalLayout from '../layouts/PortalLayout';
import PageHeader from '../components/PageHeader';
import ApiTag from '../components/ApiTag';
import { apiPlaceholders } from '../services/apiPlaceholders';
import { addPayrollUpload, getEmployees, getPayrollUploads } from '../services/portalStore';

export default function PayrollHandoffPage() {
  const employees = getEmployees();
  const [refreshKey, setRefreshKey] = useState(0);
  const [form, setForm] = useState({
    employeeId: employees[0]?.id || 1,
    employeeName: employees[0]?.name || '',
    employeeEmail: employees[0]?.email || '',
    month: 'March',
    year: '2026',
    payrollType: 'Regular',
    name: employees[0] ? `${employees[0].name} - March 2026 Payslip.pdf` : '',
    note: 'ADP upload placeholder',
  });
  const uploads = useMemo(() => getPayrollUploads(), [refreshKey]);

  const chooseEmployee = (id) => {
    const match = employees.find((row) => String(row.id) === String(id));
    if (!match) return;
    setForm((prev) => ({
      ...prev,
      employeeId: match.id,
      employeeName: match.name,
      employeeEmail: match.email,
      name: `${match.name} - ${prev.month} ${prev.year} Payslip.pdf`,
    }));
  };

  const submit = () => {
    addPayrollUpload(form);
    setRefreshKey((v) => v + 1);
  };

  return (
    <PortalLayout role="employer">
      <PageHeader title="Payroll" description="Upload ADP payslips and map them to employees by month and year. This page serves as the current payroll document intake point before deeper ADP integration." actions={<ApiTag endpoint={apiPlaceholders.employer.uploadPayslip} />} />

      <div className="employee-section-stack">
        <section className="card section-card">
          <div className="section-head"><div><span className="section-kicker">Payroll intake</span><h3>Upload Payslip Metadata</h3></div></div>
          <div className="form-grid-2">
            <div><label>Employee</label><select value={form.employeeId} onChange={(e) => chooseEmployee(e.target.value)}>{employees.map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}</select></div>
            <div><label>Payroll Type</label><select value={form.payrollType} onChange={(e) => setForm((prev) => ({ ...prev, payrollType: e.target.value }))}><option>Regular</option><option>Bonus</option><option>Adjustment</option></select></div>
            <div><label>Month</label><select value={form.month} onChange={(e) => setForm((prev) => ({ ...prev, month: e.target.value }))}>{['January','February','March','April','May','June','July','August','September','October','November','December'].map((month) => <option key={month}>{month}</option>)}</select></div>
            <div><label>Year</label><select value={form.year} onChange={(e) => setForm((prev) => ({ ...prev, year: e.target.value }))}>{['2026','2025','2024'].map((year) => <option key={year}>{year}</option>)}</select></div>
            <div className="grid-span-2"><label>Payslip Name</label><input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} /></div>
            <div className="grid-span-2"><label>Payroll Note</label><textarea rows="4" value={form.note} onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))} placeholder="ADP batch, signed file note, or special context" /></div>
          </div>
          <div className="dialog-actions top-gap"><button className="button button-secondary" onClick={() => window.alert(`Backend placeholder:\n${apiPlaceholders.employer.payrollRuns}`)}>View API</button><button className="button" onClick={submit}>Save Payroll Upload</button></div>
        </section>

        <section className="card section-card">
          <div className="section-head with-inline-action"><div><span className="section-kicker">Recent payroll uploads</span><h3>Payroll History</h3></div><ApiTag endpoint={apiPlaceholders.employer.payrollRuns} /></div>
          <div className="table-wrap history-table-wrap">
            <table>
              <thead><tr><th>Employee</th><th>Month / Year</th><th>Type</th><th>Uploaded By</th><th>Uploaded On</th><th>Metadata Reference</th></tr></thead>
              <tbody>
                {uploads.map((row) => (
                  <tr key={row.id}>
                    <td><strong>{row.employeeName}</strong><div className="subtle">{row.employeeEmail}</div></td>
                    <td>{row.month} {row.year}</td>
                    <td>{row.payrollType}</td>
                    <td>{row.uploadedBy}</td>
                    <td>{row.uploadedOn}</td>
                    <td><code className="api-inline">{row.s3Key}</code></td>
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
