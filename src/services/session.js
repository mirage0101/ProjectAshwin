const KEY = 'basecamp-session-v21';

const defaultSession = {
  loginType: 'employer',
  employerRole: 'admin',
  entity: 'GxP Consulting',
  name: 'Ava Reynolds',
  email: 'ava@gxp.example',
};

export function getSession() {
  if (typeof window === 'undefined') return defaultSession;
  try {
    return { ...defaultSession, ...(JSON.parse(window.localStorage.getItem(KEY) || '{}')) };
  } catch {
    return defaultSession;
  }
}

export function saveSession(payload) {
  if (typeof window === 'undefined') return;
  const next = { ...getSession(), ...payload };
  window.localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(KEY);
}

export function getEmployerRole() {
  return getSession().employerRole || 'admin';
}

export function isEmployeePortal() {
  return getSession().loginType === 'employee';
}

export function isRole(...roles) {
  return roles.includes(getEmployerRole());
}

export function canCreateEmployees() {
  return isRole('superadmin', 'admin', 'hr');
}

export function canCreateClientsVendors() {
  return isRole('superadmin', 'admin', 'lead_recruiter', 'recruiter');
}

export function canSeeReports() {
  return isRole('superadmin', 'admin');
}

export function canSeeEntities() {
  return isRole('superadmin');
}

export function canManageDocumentsSetup() {
  return isRole('superadmin', 'admin', 'hr');
}
