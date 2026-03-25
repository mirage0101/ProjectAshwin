import { useMemo, useState } from 'react';
import PortalLayout from '../layouts/PortalLayout';
import PageHeader from '../components/PageHeader';
import ApiTag from '../components/ApiTag';
import { apiPlaceholders } from '../services/apiPlaceholders';
import { getPayslipsForEmployee } from '../services/portalStore';

export default function PayPage() {
  const [month, setMonth] = useState('March');
  const [year, setYear] = useState('2026');
  const slips = useMemo(() => getPayslipsForEmployee('john.carter@ashconsulting.example').filter((row) => row.month === month && row.year === year), [month, year]);

  return (
    <PortalLayout role="employee">
      <PageHeader title="Pay" description="View monthly payslips uploaded by payroll admin. Files can later be served from S3 through signed APIs." actions={<ApiTag endpoint={apiPlaceholders.employee.payslips.replace(':month', month).replace(':year', year)} />} />
      <div className="card toolbar-card filter-section">
        <div className="filter-grid compact-inline-grid">
          <div className="filter-group compact-width"><label>Month</label><select value={month} onChange={(e) => setMonth(e.target.value)}>{['January','February','March','April','May','June','July','August','September','October','November','December'].map((item) => <option key={item}>{item}</option>)}</select></div>
          <div className="filter-group compact-width"><label>Year</label><select value={year} onChange={(e) => setYear(e.target.value)}>{['2026','2025','2024'].map((item) => <option key={item}>{item}</option>)}</select></div>
        </div>
      </div>
      <div className="doc-grid">
        {slips.length ? slips.map((item) => <div key={item.id} className="card info-card"><strong>{item.name}</strong><p className="subtle">{item.payrollType} • {item.note}</p><code className="api-inline">{item.s3Key}</code><div className="inline-actions"><button className="button button-secondary">Preview</button><button className="button">Open</button></div></div>) : <div className="card info-card"><strong>No payslip found</strong><p className="subtle">No payroll file is available yet for {month} {year}.</p></div>}
      </div>
    </PortalLayout>
  );
}
