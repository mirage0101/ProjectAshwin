import { useMemo, useRef, useState } from 'react';
import PortalLayout from '../layouts/PortalLayout';
import PageHeader from '../components/PageHeader';
import ApiTag from '../components/ApiTag';
import { apiPlaceholders } from '../services/apiPlaceholders';
import { getProfile, getDocuments, updateProfile } from '../services/portalStore';

export default function ProfilePage({ role }) {
  const profile = useMemo(() => getProfile(role), [role]);
  const [form, setForm] = useState(profile);
  const [preview, setPreview] = useState(profile.imageUrl || '');
  const fileRef = useRef(null);
  const docs = getDocuments(role === 'employee' ? 'employee' : 'employee', 1);

  const saveProfile = () => {
    updateProfile(role, { ...form, imageUrl: preview });
    window.alert(`Profile UI updated.\n\nBackend placeholder:\n${role === 'employee' ? apiPlaceholders.employee.updateProfile : apiPlaceholders.employer.updateEmployee}`);
  };

  const onPickImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <PortalLayout role={role}>
      <PageHeader
        title="Profile"
        description="Profile is intentionally available from the top-right user menu only. Update photo, personal details, and backend-bound profile preferences here."
        actions={<ApiTag endpoint={role === 'employee' ? apiPlaceholders.employee.profile : apiPlaceholders.employer.employeeDetail.replace(':id', 'me')} />}
      />

      <div className="two-col">
        <div className="card section-card">
          <div className="section-head"><div><span className="section-kicker">Account identity</span><h3>Profile Photo & Basic Details</h3></div></div>
          <div className="profile-hero-grid">
            <div className="profile-photo-card">
              {preview ? <img className="profile-photo-preview" src={preview} alt="Profile preview" /> : <div className="profile-photo-placeholder">{form.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div>}
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onPickImage} />
              <div className="inline-actions top-gap">
                <button className="button button-secondary slim-button" onClick={() => fileRef.current?.click()}>Upload Photo</button>
                <button className="button slim-button" onClick={() => setPreview('')}>Remove</button>
              </div>
              <ApiTag endpoint={role === 'employee' ? apiPlaceholders.employee.updateProfilePhoto : 'PUT /api/admin/profile-photo'} />
            </div>
            <div className="simple-grid" style={{ gridTemplateColumns: 'repeat(2,minmax(0,1fr))' }}>
              <div><label>Name</label><input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} /></div>
              <div><label>Title</label><input value={form.title || ''} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} /></div>
              <div><label>Email</label><input value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} /></div>
              <div><label>Phone</label><input value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} /></div>
              <div><label>Entity</label><input value={form.entity} onChange={(e) => setForm((prev) => ({ ...prev, entity: e.target.value }))} /></div>
              <div><label>Manager</label><input value={form.manager} onChange={(e) => setForm((prev) => ({ ...prev, manager: e.target.value }))} /></div>
              <div className="grid-span-2"><label>Location</label><input value={form.location} onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))} /></div>
              <div className="grid-span-2"><label>Bio</label><textarea rows="4" value={form.bio || ''} onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))} /></div>
            </div>
          </div>
          <div className="dialog-actions top-gap"><button className="button button-secondary" onClick={() => setForm(profile)}>Reset</button><button className="button" onClick={saveProfile}>Save Profile</button></div>
        </div>

        <div className="card section-card">
          <div className="section-head"><div><span className="section-kicker">Profile-linked records</span><h3>Current Document Snapshot</h3></div></div>
          <div className="doc-grid">
            {docs.map((doc) => (
              <div key={doc.id} className="card info-card">
                <strong>{doc.name}</strong>
                <p className="subtle">{doc.category}</p>
                <code className="api-inline">{doc.s3Key}</code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
