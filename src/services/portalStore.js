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
  timesheets: 'bc21-timesheets',
  onboardingApprovals: 'bc21-onboarding-approvals',
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

const seedTimesheets = [
  {
    id: 'TS-1001',
    employeeId: 102,
    employee: 'Emily Carter',
    employeeEmail: 'emily.carter@gxp.example',
    entity: 'GxP Consulting',
    department: 'Frontend',
    client: 'Peak Health Systems',
    weekStart: '2026-03-08',
    weekEnd: '2026-03-14',
    weekLabel: 'Mar 08 - Mar 14',
    month: 'March',
    year: '2026',
    totalHours: 40,
    status: 'Submitted',
    submittedOn: '2026-03-14',
    dailyEntries: [
      { day: 'Sun', date: '2026-03-08', hours: '0', status: 'Submitted' },
      { day: 'Mon', date: '2026-03-09', hours: '8', status: 'Submitted' },
      { day: 'Tue', date: '2026-03-10', hours: '8', status: 'Submitted' },
      { day: 'Wed', date: '2026-03-11', hours: '8', status: 'Submitted' },
      { day: 'Thu', date: '2026-03-12', hours: '8', status: 'Submitted' },
      { day: 'Fri', date: '2026-03-13', hours: '8', status: 'Submitted' },
      { day: 'Sat', date: '2026-03-14', hours: '0', status: 'Submitted' },
    ],
    supportingDocs: [
      { id: 'ts-doc-1001', name: 'Emily Weekly Summary.pdf', note: 'Weekly support log.', uploadedOn: '2026-03-14' },
    ],
    reviewHistory: [
      { date: '2026-03-14', action: 'Submitted to HR approvals', by: 'Emily Carter', note: 'Weekly time and documents submitted.' },
    ],
  },
  {
    id: 'TS-1002',
    employeeId: 101,
    employee: 'Rahul Sharma',
    employeeEmail: 'rahul.sharma@gxp.example',
    entity: 'GxP Consulting',
    department: 'Engineering',
    client: 'Bench Training',
    weekStart: '2026-03-08',
    weekEnd: '2026-03-14',
    weekLabel: 'Mar 08 - Mar 14',
    month: 'March',
    year: '2026',
    totalHours: 38,
    status: 'Submitted',
    submittedOn: '2026-03-14',
    dailyEntries: [
      { day: 'Sun', date: '2026-03-08', hours: '0', status: 'Submitted' },
      { day: 'Mon', date: '2026-03-09', hours: '8', status: 'Submitted' },
      { day: 'Tue', date: '2026-03-10', hours: '8', status: 'Submitted' },
      { day: 'Wed', date: '2026-03-11', hours: '6', status: 'Submitted' },
      { day: 'Thu', date: '2026-03-12', hours: '8', status: 'Submitted' },
      { day: 'Fri', date: '2026-03-13', hours: '8', status: 'Submitted' },
      { day: 'Sat', date: '2026-03-14', hours: '0', status: 'Submitted' },
    ],
    supportingDocs: [
      { id: 'ts-doc-1002', name: 'Bench Training Log.pdf', note: 'Internal training record.', uploadedOn: '2026-03-14' },
    ],
    reviewHistory: [
      { date: '2026-03-14', action: 'Submitted to HR approvals', by: 'Rahul Sharma', note: 'Weekly time and documents submitted.' },
    ],
  },
  {
    id: 'TS-1003',
    employeeId: 103,
    employee: 'Daniel Brooks',
    employeeEmail: 'daniel.brooks@gxp.example',
    entity: 'GxP Consulting',
    department: 'Data Engineering',
    client: 'NorthBridge Solutions',
    weekStart: '2026-03-01',
    weekEnd: '2026-03-07',
    weekLabel: 'Mar 01 - Mar 07',
    month: 'March',
    year: '2026',
    totalHours: 42,
    status: 'Approved',
    submittedOn: '2026-03-07',
    reviewedOn: '2026-03-08',
    reviewedBy: 'Sara Gomez',
    reviewNote: 'Approved for historical reference.',
    dailyEntries: [
      { day: 'Sun', date: '2026-03-01', hours: '0', status: 'Approved' },
      { day: 'Mon', date: '2026-03-02', hours: '9', status: 'Approved' },
      { day: 'Tue', date: '2026-03-03', hours: '9', status: 'Approved' },
      { day: 'Wed', date: '2026-03-04', hours: '8', status: 'Approved' },
      { day: 'Thu', date: '2026-03-05', hours: '8', status: 'Approved' },
      { day: 'Fri', date: '2026-03-06', hours: '8', status: 'Approved' },
      { day: 'Sat', date: '2026-03-07', hours: '0', status: 'Approved' },
    ],
    supportingDocs: [
      { id: 'ts-doc-1003', name: 'Work Summary.pdf', note: 'Historical approved record.', uploadedOn: '2026-03-07' },
    ],
    reviewHistory: [
      { date: '2026-03-07', action: 'Submitted to HR approvals', by: 'Daniel Brooks', note: 'Weekly time and documents submitted.' },
      { date: '2026-03-08', action: 'Approved', by: 'Sara Gomez', note: 'Approved for payroll reference.' },
    ],
  },
];

const seedOnboardingApprovals = [
  { id: 'APR-2001', caseId: 'OB-7002', employee: 'Rahul Sharma', entity: 'GxP Consulting', detail: 'Passport, Visa, ID Proof', stage: 'Document Review', priority: 'High', status: 'Pending' },
  { id: 'APR-2002', caseId: 'OB-7001', employee: 'Emily Carter', entity: 'GxP Consulting', detail: 'Offer acknowledgement', stage: 'Offer Review', priority: 'Low', status: 'Pending' },
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
    [KEYS.timesheets, seedTimesheets],
    [KEYS.onboardingApprovals, seedOnboardingApprovals],
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
export function addTeamMember(payload) {
  const rows = getTeamMembers();
  const id = nextId(rows, 1);
  const today = new Date().toISOString().slice(0, 10);
  const row = {
    id,
    name: payload.name,
    role: payload.role || 'Recruiter',
    entity: payload.entity || getSession().entity,
    status: payload.status || 'Active',
    email: payload.email,
    phone: payload.phone || '',
    location: payload.location || '',
    department: payload.department || 'Operations',
    manager: payload.manager || '',
    startDate: payload.startDate || today,
    notes: payload.notes || '',
  };
  write(KEYS.team, [...rows, row]);
  return row;
}
export function updateTeamMember(id, patch) {
  const rows = getTeamMembers().map((row) => String(row.id) === String(id) ? { ...row, ...patch } : row);
  write(KEYS.team, rows);
  return rows.find((row) => String(row.id) === String(id));
}

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

function syncMarketingCaseForEmployee(employee, nextMarketingRows = getMarketingCases()) {
  const shouldBeInQueue = String(employee.status).startsWith('BENCH');
  const existingIndex = nextMarketingRows.findIndex((row) => String(row.employeeId) === String(employee.id));

  if (!shouldBeInQueue) {
    if (existingIndex === -1) return nextMarketingRows;
    const next = [...nextMarketingRows];
    next.splice(existingIndex, 1);
    return next;
  }

  const summary = employee.currentAssignments?.length
    ? `${employee.department} consultant with active assignment history.`
    : 'Bench employee visible in marketing queue.';
  const casePatch = {
    employeeId: employee.id,
    employee: employee.name,
    recruiter: employee.recruiter || '',
    state: 'Queue',
    queueStatus: 'Open',
    assignedAt: '',
    summary,
    submissions: [],
    history: [],
  };

  if (existingIndex === -1) {
    return [...nextMarketingRows, { id: `MC-${Date.now().toString().slice(-6)}`, ...casePatch }];
  }

  return nextMarketingRows.map((row, index) => index === existingIndex ? {
    ...row,
    employee: employee.name,
    recruiter: row.recruiter || employee.recruiter || '',
    state: 'Queue',
    queueStatus: row.recruiter ? 'Assigned' : 'Open',
    summary,
  } : row);
}

export function updateEmployeeRecord(id, patch) {
  const rows = getEmployees();
  const nextEmployees = rows.map((row) => String(row.id) === String(id) ? { ...row, ...patch } : row);
  write(KEYS.employees, nextEmployees);
  const updated = nextEmployees.find((row) => String(row.id) === String(id));
  if (updated) write(KEYS.marketing, syncMarketingCaseForEmployee(updated));
  return updated;
}

export function updateEmployeeAssignment(id, payload) {
  const rows = getEmployees();
  const employee = rows.find((row) => String(row.id) === String(id));
  if (!employee) return null;

  const today = new Date().toISOString().slice(0, 10);
  const previousActive = (employee.currentAssignments || []).length
    ? employee.currentAssignments[0]
    : (employee.client && employee.client !== 'Bench'
      ? {
          client: employee.client,
          project: employee.department,
          startDate: employee.joined,
          endDate: '',
          allocation: '100%',
          status: employee.status,
        }
      : null);

  let currentAssignments = employee.currentAssignments || [];
  let assignmentHistory = [...(employee.assignmentHistory || [])];
  let client = employee.client;
  let status = employee.status;
  let benchStart = employee.benchStart || '';

  if (payload.action === 'bench') {
    const effectiveEndDate = payload.effectiveDate || today;
    if (previousActive) {
      const endedAssignment = { ...previousActive, endDate: effectiveEndDate, status: 'Ended' };
      assignmentHistory = [
        ...assignmentHistory.filter((row) => !(row.client === previousActive.client && row.fromDate === previousActive.startDate && !row.toDate)),
        {
          client: endedAssignment.client,
          project: endedAssignment.project,
          fromDate: endedAssignment.startDate,
          toDate: endedAssignment.endDate,
          status: 'Completed',
        },
      ];
    }
    currentAssignments = [];
    client = 'Bench';
    status = 'BENCH';
    benchStart = effectiveEndDate;
  } else if (payload.action === 'extend') {
    const nextEndDate = payload.endDate || previousActive?.endDate || '';
    if (!previousActive) return employee;
    currentAssignments = [{ ...previousActive, endDate: nextEndDate, status: 'Active', allocation: payload.allocation || previousActive.allocation || '100%' }];
    client = previousActive.client;
    status = 'ONBOARDED';
    benchStart = '';
  } else if (payload.action === 'assign') {
    if (!payload.client || !payload.project || !payload.startDate) return employee;
    if (previousActive) {
      const effectiveEndDate = payload.previousEndDate || today;
      assignmentHistory = [
        ...assignmentHistory.filter((row) => !(row.client === previousActive.client && row.fromDate === previousActive.startDate && !row.toDate)),
        {
          client: previousActive.client,
          project: previousActive.project,
          fromDate: previousActive.startDate,
          toDate: effectiveEndDate,
          status: 'Completed',
        },
      ];
    }
    currentAssignments = [{
      client: payload.client,
      project: payload.project,
      startDate: payload.startDate,
      endDate: payload.endDate || '',
      allocation: payload.allocation || '100%',
      status: 'Active',
    }];
    client = payload.client;
    status = 'ONBOARDED';
    benchStart = '';
  }

  const updated = {
    ...employee,
    client,
    status,
    benchStart,
    currentAssignments,
    assignmentHistory,
  };

  const nextEmployees = rows.map((row) => String(row.id) === String(id) ? updated : row);
  write(KEYS.employees, nextEmployees);
  write(KEYS.marketing, syncMarketingCaseForEmployee(updated));
  return updated;
}

export function getEmployerNotifications() {
  const session = getSession();
  const today = new Date().toISOString().slice(0, 10);
  const soonCutoff = new Date();
  soonCutoff.setDate(soonCutoff.getDate() + 14);
  const cutoff = soonCutoff.toISOString().slice(0, 10);

  return getEmployees()
    .filter((employee) => employee.entity === session.entity || session.employerRole === 'superadmin')
    .flatMap((employee) => {
      const activeAssignment = (employee.currentAssignments || [])[0];
      if (!activeAssignment?.endDate) return [];
      const isEnded = activeAssignment.endDate < today;
      const isExpiringSoon = activeAssignment.endDate >= today && activeAssignment.endDate <= cutoff;
      if (!isEnded && !isExpiringSoon) return [];
      return [{
        id: `emp-assignment-${employee.id}`,
        title: isEnded ? 'Employee assignment ended' : 'Employee assignment expiring soon',
        text: isEnded
          ? `${employee.name} ended with ${activeAssignment.client} on ${activeAssignment.endDate}. HR/Admin should move the employee to Bench or extend the assignment.`
          : `${employee.name} is assigned to ${activeAssignment.client} until ${activeAssignment.endDate}. Review whether to extend or move the employee to Bench.`,
        time: isEnded ? 'Action required' : 'Upcoming',
        href: `/employer/employees/${employee.id}?openAssignment=1`,
      }];
    });
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
export function updateDocument(documentId, patch) {
  const docs = read(KEYS.docs, seedDocuments).map((doc) => doc.id === documentId ? { ...doc, ...patch } : doc);
  write(KEYS.docs, docs);
  return docs.find((doc) => doc.id === documentId);
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

export function getTimesheets() { ensureSeeded(); return read(KEYS.timesheets, seedTimesheets); }
export function saveTimesheet(payload) {
  const rows = getTimesheets();
  const existing = rows.find((row) => String(row.employeeId) === String(payload.employeeId) && row.weekStart === payload.weekStart);
  const today = new Date().toISOString().slice(0, 10);
  const reviewHistory = [{
    date: today,
    action: 'Submitted to HR approvals',
    by: payload.employee,
    note: 'Weekly time and documents submitted.',
  }];
  const row = {
    id: existing?.id || `TS-${nextId(rows, 1000)}`,
    status: 'Submitted',
    submittedOn: today,
    reviewedOn: '',
    reviewedBy: '',
    reviewNote: '',
    reviewHistory,
    ...payload,
  };
  const nextRows = existing
    ? rows.map((item) => item.id === existing.id ? { ...existing, ...row } : item)
    : [...rows, row];
  write(KEYS.timesheets, nextRows);
  return row;
}
export function updateTimesheet(timesheetId, patch) {
  const rows = getTimesheets();
  const today = new Date().toISOString().slice(0, 10);
  const nextRows = rows.map((row) => {
    if (row.id !== timesheetId) return row;
    const nextStatus = patch.status || row.status;
    const historyEntry = patch.historyEntry || (patch.status ? {
      date: today,
      action: patch.status,
      by: getSession().name,
      note: patch.reviewNote || '',
    } : null);
    return {
      ...row,
      ...patch,
      dailyEntries: patch.dailyEntries || row.dailyEntries,
      reviewHistory: historyEntry ? [...(row.reviewHistory || []), historyEntry] : row.reviewHistory || [],
      reviewedOn: patch.status ? today : (patch.reviewedOn || row.reviewedOn || ''),
      reviewedBy: patch.status ? getSession().name : (patch.reviewedBy || row.reviewedBy || ''),
      status: nextStatus,
    };
  });
  write(KEYS.timesheets, nextRows);
  return nextRows.find((row) => row.id === timesheetId);
}
export function getOnboardingApprovals() { ensureSeeded(); return read(KEYS.onboardingApprovals, seedOnboardingApprovals); }
export function updateOnboardingApproval(id, patch) {
  const rows = getOnboardingApprovals().map((row) => row.id === id ? { ...row, ...patch } : row);
  write(KEYS.onboardingApprovals, rows);
  return rows.find((row) => row.id === id);
}

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
export function updateMarketingCase(caseId, patch) {
  const rows = getMarketingCases().map((row) => row.id === caseId ? { ...row, ...patch } : row);
  write(KEYS.marketing, rows);
  return rows.find((row) => row.id === caseId);
}
export function updateSubmission(caseId, submissionId, patch) {
  const today = new Date().toISOString().slice(0,10);
  const rows = getMarketingCases().map((row) => {
    if (row.id !== caseId) return row;
    const submissions = (row.submissions || []).map((sub) => {
      if (sub.id !== submissionId) return sub;
      return {
        ...sub,
        ...patch,
        updatedOn: today,
        history: [...(sub.history || []), {
          date: today,
          action: patch.historyAction || 'Submission updated',
          by: getSession().name,
          note: patch.note ?? sub.note ?? '',
          outcome: patch.outcome ?? sub.outcome ?? '',
        }],
      };
    });
    return {
      ...row,
      submissions,
      history: [...(row.history || []), { date: today, action: patch.historyAction || `Submission ${submissionId} updated`, by: getSession().name }],
    };
  });
  write(KEYS.marketing, rows);
  return rows.find((row) => row.id === caseId)?.submissions?.find((sub) => sub.id === submissionId);
}
export function updateOnboardingCase(caseId, patch) {
  const rows = getOnboardingCases().map((row) => {
    if (row.id !== caseId) return row;
    const { historyEntry, ...rest } = patch;
    return {
      ...row,
      ...rest,
      history: historyEntry ? [...(row.history || []), historyEntry] : (patch.history || row.history || []),
    };
  });
  write(KEYS.onboarding, rows);
  return rows.find((row) => row.id === caseId);
}
