import {
  clients as seedClients,
  documentCategories as seedDocumentCategories,
  employeeUser,
  employees as seedEmployees,
  employerUsers,
  entities as seedEntities,
  marketingCases as seedMarketingCases,
  onboardingCases as seedOnboardingCases,
  relationshipMap as seedRelationshipMap,
  teamMembers as seedTeamMembers,
} from './mockData';
import { getSession } from './session';

const KEYS = {
  employees: 'bc21-employees',
  clients: 'bc21-clients',
  entities: 'bc21-entities',
  docs: 'bc21-docs',
  marketing: 'bc21-marketing',
  onboarding: 'bc21-onboarding',
  relations: 'bc21-relations',
  docTypes: 'bc21-doctypes',
  profiles: 'bc21-profiles',
  team: 'bc21-team',
  payroll: 'bc21-payroll',
};

const seedDocuments = [
  { id: 'doc-client-msa-1', parentType: 'client', parentId: 301, name: 'MSA - Peak Health Systems.pdf', category: 'Master Service Agreement', note: 'Base agreement', s3Key: 'clients/301/msa-v1.pdf', uploadedBy: 'Sara Gomez', uploadedOn: '2025-09-01', status: 'ACTIVE' },
  { id: 'doc-client-exhibit-1', parentType: 'client', parentId: 301, name: 'Exhibit A - Peak Health Systems.pdf', category: 'Exhibit / Addendum', note: 'Addendum for onboarding batch', s3Key: 'clients/301/exhibit-a-v2.pdf', uploadedBy: 'Sara Gomez', uploadedOn: '2026-03-01', status: 'ACTIVE' },
  { id: 'doc-employee-pass-101', parentType: 'employee', parentId: 101, name: 'Rahul Passport.pdf', category: 'Passport', note: 'Uploaded by employee', s3Key: 'employees/101/passport.pdf', uploadedBy: 'Rahul Sharma', uploadedOn: '2026-03-14', status: 'ACTIVE' },
  { id: 'doc-employee-offer-102', parentType: 'employee', parentId: 102, name: 'Offer Letter - Emily Carter.pdf', category: 'Offer Letter', note: 'Generated PDF placeholder', s3Key: 'employees/102/offer-letter.pdf', uploadedBy: 'Sara Gomez', uploadedOn: '2026-03-02', status: 'ACTIVE' },
  { id: 'doc-entity-201-reg', parentType: 'entity', parentId: 201, name: 'GxP Consulting Registration.pdf', category: 'Registration', note: 'Legal record', s3Key: 'entities/201/registration.pdf', uploadedBy: 'Olivia Grant', uploadedOn: '2025-01-01', status: 'ACTIVE' },
];

const seedPayroll = [
  { id: 'pay-1', employeeId: 102, employeeName: 'Emily Carter', employeeEmail: 'emily.carter@gxp.example', month: 'March', year: '2026', payrollType: 'Regular', name: 'Emily Carter - March 2026 Payslip.pdf', note: 'ADP generated payroll slip.', s3Key: 'payroll/2026/03/emily-carter.pdf', uploadedBy: 'Payroll Admin', uploadedOn: '2026-03-05', status: 'AVAILABLE' },
];

function read(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    return JSON.parse(window.localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}
function write(key, value) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}
function ensureSeeded() {
  const seeds = [
    [KEYS.employees, seedEmployees],
    [KEYS.clients, seedClients],
    [KEYS.entities, seedEntities],
    [KEYS.marketing, seedMarketingCases],
    [KEYS.onboarding, seedOnboardingCases],
    [KEYS.relations, seedRelationshipMap],
    [KEYS.docTypes, seedDocumentCategories],
    [KEYS.docs, seedDocuments],
    [KEYS.team, seedTeamMembers],
    [KEYS.payroll, seedPayroll],
  ];
  seeds.forEach(([k, v]) => {
    if (typeof window !== 'undefined' && !window.localStorage.getItem(k)) write(k, v);
  });
  if (typeof window !== 'undefined' && !window.localStorage.getItem(KEYS.profiles)) {
    write(KEYS.profiles, {
      employee: { ...employeeUser, imageUrl: '', bio: 'Employee profile used for self-service and timesheets.' },
      employer: { ...employerUsers.admin, imageUrl: '', bio: 'Employer-side profile used for demo workflows.' },
    });
  }
}
function nextId(items, floor = 1000) {
  const nums = items.map((x) => Number(String(x.id).replace(/\D/g, ''))).filter(Boolean);
  return Math.max(floor, ...nums) + 1;
}

export function getEmployees() { ensureSeeded(); return read(KEYS.employees, seedEmployees); }
export function getClients() { ensureSeeded(); return read(KEYS.clients, seedClients); }
export function getEntities() { ensureSeeded(); return read(KEYS.entities, seedEntities); }
export function getMarketingCases() { ensureSeeded(); return read(KEYS.marketing, seedMarketingCases); }
export function getOnboardingCases() { ensureSeeded(); return read(KEYS.onboarding, seedOnboardingCases); }
export function getRelationshipMap() { ensureSeeded(); return read(KEYS.relations, seedRelationshipMap); }
export function getDocumentCategories() { ensureSeeded(); return read(KEYS.docTypes, seedDocumentCategories); }
export function getTeamMembers() { ensureSeeded(); return read(KEYS.team, seedTeamMembers); }

export function addEmployee(payload) {
  const rows = getEmployees();
  const id = nextId(rows, 100);
  const row = {
    id,
    name: payload.name,
    joined: payload.joiningDate || new Date().toISOString().slice(0,10),
    client: 'Bench',
    manager: payload.manager || '',
    hr: payload.hr || '',
    recruiter: payload.recruiter || '',
    department: payload.department || 'Engineering',
    entity: payload.entity || getSession().entity,
    status: 'BENCH-NEW',
    role: 'Employee',
    email: payload.email,
    phone: payload.phone || '',
    employeeCode: `GXP-${id}`,
    employmentType: payload.employmentType || 'Contractor',
    location: payload.location || '',
    reportingTo: payload.manager || '',
    reportingEmail: '',
    payrollOwner: 'Finance Ops',
    currentAssignments: [],
    assignmentHistory: [],
    skills: payload.skills ? payload.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
    benchStart: payload.joiningDate || new Date().toISOString().slice(0,10),
    priority: payload.priority || 'Medium',
    resumeVersion: payload.resumeVersion || 'Pending upload',
  };
  write(KEYS.employees, [...rows, row]);
  return row;
}

export function updateEmployee(id, patch) {
  const rows = getEmployees().map((r) => String(r.id) === String(id) ? { ...r, ...patch } : r);
  write(KEYS.employees, rows);
}

export function addClient(payload) {
  const rows = getClients();
  const id = nextId(rows, 300);
  const row = {
    id,
    name: payload.name,
    type: payload.type || 'Client',
    status: 'Onboarding',
    entity: payload.entity || getSession().entity,
    address: payload.address || '',
    contact: payload.contact || '',
    email: payload.email || '',
    phone: payload.phone || '',
    employees: 0,
    industry: payload.industry || 'General',
    activeSince: payload.startDate || new Date().toISOString().slice(0,10),
    accountOwner: payload.accountOwner || getSession().name,
    billingContact: payload.billingContact || '',
    notes: payload.notes || '',
    history: [{ fromDate: new Date().toISOString().slice(0,10), toDate: '', status: 'Onboarding', note: 'Created from portal popup' }],
  };
  write(KEYS.clients, [...rows, row]);
  return row;
}

export function updateClient(id, patch) {
  const rows = getClients().map((r) => String(r.id) === String(id) ? { ...r, ...patch } : r);
  write(KEYS.clients, rows);
}

export function addEntity(payload) {
  const rows = getEntities();
  const id = nextId(rows, 200);
  const row = {
    id,
    name: payload.name,
    legalName: payload.legalName || payload.name,
    status: 'Onboarding',
    address: payload.address || '',
    admin: payload.admin || '',
    email: payload.email || '',
    phone: payload.phone || '',
    region: payload.region || 'North America',
    employeeCount: 0,
    clientCount: 0,
    notes: payload.notes || '',
  };
  write(KEYS.entities, [...rows, row]);
  return row;
}

export function updateEntity(id, patch) {
  const rows = getEntities().map((r) => String(r.id) === String(id) ? { ...r, ...patch } : r);
  write(KEYS.entities, rows);
}

export function getDocuments(parentType, parentId) {
  ensureSeeded();
  return read(KEYS.docs, seedDocuments).filter((d) => d.parentType === parentType && String(d.parentId) === String(parentId));
}
export function addDocument(parentType, parentId, payload) {
  const docs = read(KEYS.docs, seedDocuments);
  const id = `doc-${parentType}-${parentId}-${Date.now()}`;
  const row = {
    id, parentType, parentId,
    name: payload.name || `${payload.category || 'Document'}.pdf`,
    category: payload.category || 'General',
    note: payload.note || '',
    s3Key: payload.s3Key || `${parentType}/${parentId}/${id}.pdf`,
    uploadedBy: payload.uploadedBy || getSession().name,
    uploadedOn: new Date().toISOString().slice(0,10),
    status: 'ACTIVE',
  };
  write(KEYS.docs, [...docs, row]);
  return row;
}
export function markDocumentDeleted(documentId) {
  const docs = read(KEYS.docs, seedDocuments).map((d) => d.id === documentId ? { ...d, status: 'DELETED' } : d);
  write(KEYS.docs, docs);
}

export function getProfile(role) {
  ensureSeeded();
  const profiles = read(KEYS.profiles, {});
  if (role === 'employee') return profiles.employee;
  const session = getSession();
  return {
    ...(profiles.employer || {}),
    ...(employerUsers[session.employerRole] || employerUsers.admin),
    title: (employerUsers[session.employerRole] || employerUsers.admin).title,
  };
}
export function updateProfile(role, patch) {
  const profiles = read(KEYS.profiles, {});
  const next = { ...profiles, [role]: { ...(profiles[role] || {}), ...patch } };
  write(KEYS.profiles, next);
  return next[role];
}
export function getPayrollUploads() { ensureSeeded(); return read(KEYS.payroll, seedPayroll); }
export function addPayrollUpload(payload) {
  const rows = getPayrollUploads();
  const row = { id: `pay-${Date.now()}`, uploadedOn: new Date().toISOString().slice(0,10), status: 'AVAILABLE', ...payload };
  write(KEYS.payroll, [...rows, row]);
  return row;
}
export function getPayslipsForEmployee(employeeEmail) { return getPayrollUploads().filter((r) => r.employeeEmail === employeeEmail); }

export function assignMarketingCase(caseId, recruiterName) {
  const rows = getMarketingCases().map((row) => row.id === caseId ? {
    ...row,
    recruiter: recruiterName,
    queueStatus: 'Assigned',
    assignedAt: new Date().toISOString().slice(0,10),
    history: [...(row.history || []), { date: new Date().toISOString().slice(0,10), action: `Assigned to ${recruiterName}`, by: recruiterName }],
  } : row);
  write(KEYS.marketing, rows);
}
export function addSubmission(caseId, payload) {
  const rows = getMarketingCases().map((row) => {
    if (row.id !== caseId) return row;
    const submission = {
      id: `SUB-${Date.now().toString().slice(-4)}`,
      clientId: payload.clientId,
      vendorId: payload.vendorId || null,
      client: payload.client,
      vendor: payload.vendor || '',
      route: payload.vendor ? `${payload.vendor} → ${payload.client}` : `${payload.client} (Direct)`,
      outcome: payload.outcome || 'Submitted',
      note: payload.note || '',
      conflict: payload.conflict || '',
    };
    return { ...row, submissions: [...(row.submissions || []), submission], history: [...(row.history || []), { date: new Date().toISOString().slice(0,10), action: `Submission created: ${submission.route}`, by: getSession().name }] };
  });
  write(KEYS.marketing, rows);
}
export function getConflictHints(employeeId, clientName, vendorName='') {
  const employee = getEmployees().find((e) => String(e.id) === String(employeeId));
  const caseRows = getMarketingCases();
  const conflicts = [];
  if (employee?.assignmentHistory?.some((h) => h.client === clientName)) conflicts.push(`Past assignment found with ${clientName}`);
  if (employee?.assignmentHistory?.some((h) => vendorName && h.client === vendorName)) conflicts.push(`Past assignment/vendor overlap found with ${vendorName}`);
  caseRows.forEach((row) => (row.submissions || []).forEach((sub) => {
    if (String(row.employeeId) === String(employeeId) && sub.client === clientName && (!!sub.vendor === !!vendorName)) {
      conflicts.push(`Existing submission already found for ${sub.route}`);
    }
  }));
  return conflicts;
}
