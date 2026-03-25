import { useNavigate } from 'react-router-dom';
import PortalLayout from '../layouts/PortalLayout';
import PageHeader from '../components/PageHeader';
import { apiPlaceholders, showApiPlaceholder } from '../services/apiPlaceholders';

export default function NewEmployeeOnboardingPage() {
  const navigate = useNavigate();

  const saveDraft = () => showApiPlaceholder('Save new employee onboarding draft', apiPlaceholders.employees.create || 'POST /api/employees');
  const submitInvite = () => showApiPlaceholder('Submit onboarding and send invite', 'POST /api/onboarding/invite');

  return (
    <PortalLayout role="employer">
      <PageHeader
        title="New Employee Onboarding"
        description="Enter the new employee details, assign entity and department, then trigger the onboarding invite flow."
        actions={<button className="button button-secondary" onClick={() => navigate('/employer/employees')}>Back to All Employees</button>}
      />

      <div className="card onboarding-form-card">
        <div className="form-grid-2">
          <div><label>Full Name</label><input placeholder="Enter full name" /></div>
          <div><label>Email</label><input placeholder="employee@ashconsulting.example" /></div>
          <div><label>Contact Number</label><input placeholder="+1 (555) 000-0000" /></div>
          <div><label>Joining Date</label><input type="date" /></div>
          <div><label>Department</label><select><option>Engineering</option><option>QA</option><option>HR</option><option>Finance</option></select></div>
          <div><label>Entity</label><select><option>ASH USA</option><option>ASH UK</option><option>ASH Canada</option></select></div>
          <div><label>Client</label><input placeholder="Client assignment" /></div>
          <div><label>Reporting Manager</label><input placeholder="Manager name" /></div>
          <div><label>HR Owner</label><input placeholder="HR contact" /></div>
          <div><label>Role Type</label><select><option>Employee</option><option>HR</option><option>Finance</option><option>Admin</option></select></div>
        </div>

        <div className="form-grid-1 top-gap">
          <div><label>Notes</label><textarea rows="5" placeholder="Add onboarding notes, special approvals, or required documents" /></div>
        </div>

        <div className="inline-actions top-gap">
          <button className="button button-secondary" onClick={saveDraft}>Save Draft</button>
          <button className="button" onClick={submitInvite}>Submit & Send Invite</button>
        </div>
      </div>
    </PortalLayout>
  );
}
