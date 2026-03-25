export const company = {
  name: 'GxP Associates',
  portal: 'BaseCamp',
  description: 'Staffing Operations Portal',
  altDescription:
    'A modern internal portal for recruiter-led marketing, HR-owned onboarding, employee self-service, approvals, weekly time capture, and assignment lifecycle tracking.',
};

export const employerUsers = {
  superadmin: {
    name: 'Olivia Grant',
    title: 'Super Admin',
    entity: 'GxP Associates',
    email: 'olivia@gxp.example',
    phone: '+1 (555) 010-1200',
    location: 'Tampa, FL',
  },
  admin: {
    name: 'Ava Reynolds',
    title: 'Admin',
    entity: 'GxP Consulting',
    email: 'ava@gxp.example',
    phone: '+1 (555) 010-1201',
    location: 'Tampa, FL',
  },
  lead_recruiter: {
    name: 'Marcus Lee',
    title: 'Lead Recruiter',
    entity: 'GxP Consulting',
    email: 'marcus@gxp.example',
    phone: '+1 (555) 010-1202',
    location: 'Tampa, FL',
  },
  recruiter: {
    name: 'Nina Patel',
    title: 'Recruiter',
    entity: 'GxP Consulting',
    email: 'nina@gxp.example',
    phone: '+1 (555) 010-1203',
    location: 'Tampa, FL',
  },
  hr: {
    name: 'Sara Gomez',
    title: 'HR',
    entity: 'GxP Consulting',
    email: 'sara@gxp.example',
    phone: '+1 (555) 010-1204',
    location: 'Tampa, FL',
  },
};

export const employeeUser = {
  name: 'Rahul Sharma',
  title: 'Senior Java Consultant',
  entity: 'GxP Consulting',
  email: 'rahul.sharma@gxp.example',
  manager: 'Sara Gomez',
  phone: '+1 (555) 010-2201',
  location: 'Plant City, FL',
};

export const entities = [
  {
    id: 201,
    name: 'GxP Consulting',
    legalName: 'GxP Consulting LLC',
    status: 'Active',
    address: 'Tampa, Florida',
    admin: 'Ava Reynolds',
    email: 'admin@gxp.example',
    phone: '+1 (555) 010-3001',
    region: 'North America',
    employeeCount: 24,
    clientCount: 8,
    notes: 'Primary operating entity for current rollout.',
  },
  {
    id: 202,
    name: 'GxP Labs',
    legalName: 'GxP Labs Inc',
    status: 'Onboarding',
    address: 'Dallas, Texas',
    admin: 'Open',
    email: 'ops@gxp.example',
    phone: '+1 (555) 010-3002',
    region: 'North America',
    employeeCount: 0,
    clientCount: 0,
    notes: 'Reserved for future expansion.',
  },
];

export const teamMembers = [
  { id: 1, name: 'Olivia Grant', role: 'Super Admin', entity: 'GxP Associates', status: 'Active', email: 'olivia@gxp.example' },
  { id: 2, name: 'Ava Reynolds', role: 'Admin', entity: 'GxP Consulting', status: 'Active', email: 'ava@gxp.example' },
  { id: 3, name: 'Marcus Lee', role: 'Lead Recruiter', entity: 'GxP Consulting', status: 'Active', email: 'marcus@gxp.example' },
  { id: 4, name: 'Nina Patel', role: 'Recruiter', entity: 'GxP Consulting', status: 'Active', email: 'nina@gxp.example' },
  { id: 5, name: 'Sara Gomez', role: 'HR', entity: 'GxP Consulting', status: 'Active', email: 'sara@gxp.example' },
];

export const employees = [
  {
    id: 101,
    name: 'Rahul Sharma',
    joined: '2026-02-01',
    client: 'Bench',
    manager: 'Marcus Lee',
    hr: 'Sara Gomez',
    recruiter: 'Nina Patel',
    department: 'Engineering',
    entity: 'GxP Consulting',
    status: 'BENCH-NEW',
    role: 'Employee',
    email: 'rahul.sharma@gxp.example',
    phone: '+1 (555) 010-2201',
    employeeCode: 'GXP-101',
    employmentType: 'Contractor',
    location: 'Plant City, FL',
    reportingTo: 'Marcus Lee',
    reportingEmail: 'marcus@gxp.example',
    payrollOwner: 'Finance Ops',
    currentAssignments: [],
    assignmentHistory: [
      { client: 'Vertex Talent LLC', project: 'Senior Backend Consultant', fromDate: '2025-03-01', toDate: '2025-12-30', status: 'Completed' },
      { client: 'HealthAxis Corp', project: 'API Modernization', fromDate: '2025-12-31', toDate: '2026-01-31', status: 'Completed' },
    ],
    skills: ['Java', 'Spring Boot', 'Kafka', 'AWS'],
    benchStart: '2026-02-01',
    priority: 'High',
    resumeVersion: 'Rahul_Resume_v4.pdf',
  },
  {
    id: 102,
    name: 'Emily Carter',
    joined: '2024-10-18',
    client: 'Peak Health Systems',
    manager: 'Sara Gomez',
    hr: 'Sara Gomez',
    recruiter: 'Marcus Lee',
    department: 'Frontend',
    entity: 'GxP Consulting',
    status: 'ONBOARDED',
    role: 'Employee',
    email: 'emily.carter@gxp.example',
    phone: '+1 (555) 010-2202',
    employeeCode: 'GXP-102',
    employmentType: 'Contractor',
    location: 'Austin, TX',
    reportingTo: 'Sara Gomez',
    reportingEmail: 'sara@gxp.example',
    payrollOwner: 'Finance Ops',
    currentAssignments: [
      { client: 'Peak Health Systems', project: 'Portal UX', startDate: '2026-03-01', endDate: '2026-09-30', allocation: '100%', status: 'Active' }
    ],
    assignmentHistory: [
      { client: 'NorthBridge Solutions', project: 'React Consultant', fromDate: '2024-10-18', toDate: '2026-02-28', status: 'Completed' },
      { client: 'Peak Health Systems', project: 'Portal UX', fromDate: '2026-03-01', toDate: '', status: 'Active' },
    ],
    skills: ['React', 'Angular', 'TypeScript'],
    benchStart: '',
    priority: 'Medium',
    resumeVersion: 'Emily_React_Profile.pdf',
  },
  {
    id: 103,
    name: 'Daniel Brooks',
    joined: '2025-06-11',
    client: 'Bench',
    manager: 'Marcus Lee',
    hr: 'Sara Gomez',
    recruiter: '',
    department: 'Data Engineering',
    entity: 'GxP Consulting',
    status: 'BENCH',
    role: 'Employee',
    email: 'daniel.brooks@gxp.example',
    phone: '+1 (555) 010-2203',
    employeeCode: 'GXP-103',
    employmentType: 'Contractor',
    location: 'Orlando, FL',
    reportingTo: 'Marcus Lee',
    reportingEmail: 'marcus@gxp.example',
    payrollOwner: 'Finance Ops',
    currentAssignments: [],
    assignmentHistory: [
      { client: 'NorthBridge Solutions', project: 'Airflow Migration', fromDate: '2025-06-11', toDate: '2026-02-21', status: 'Completed' },
    ],
    skills: ['Python', 'SQL', 'Airflow'],
    benchStart: '2026-02-22',
    priority: 'Medium',
    resumeVersion: 'Daniel_DataEng.pdf',
  },
];

export const clients = [
  {
    id: 301,
    name: 'Peak Health Systems',
    type: 'Client',
    status: 'Active',
    entity: 'GxP Consulting',
    address: 'Chicago, IL',
    contact: 'Elaine Brooks',
    email: 'elaine@peak.example',
    phone: '+1 (555) 020-1001',
    employees: 2,
    industry: 'Healthcare',
    activeSince: '2025-09-01',
    accountOwner: 'Ava Reynolds',
    billingContact: 'peak-ap@peak.example',
    notes: 'Direct client relationship.',
    history: [{ fromDate: '2025-09-01', toDate: '', status: 'Active', note: 'Active direct account' }],
  },
  {
    id: 302,
    name: 'Vertex Talent LLC',
    type: 'Vendor',
    status: 'Active',
    entity: 'GxP Consulting',
    address: 'Jersey City, NJ',
    contact: 'Hector Mills',
    email: 'hector@vertex.example',
    phone: '+1 (555) 020-1002',
    employees: 1,
    industry: 'Staffing',
    activeSince: '2024-06-15',
    accountOwner: 'Marcus Lee',
    billingContact: 'ops@vertex.example',
    notes: 'Vendor commonly paired with Peak Health Systems.',
    history: [{ fromDate: '2024-06-15', toDate: '', status: 'Active', note: 'Preferred vendor' }],
  },
  {
    id: 303,
    name: 'NorthBridge Solutions',
    type: 'Client + Vendor',
    status: 'Active',
    entity: 'GxP Consulting',
    address: 'Atlanta, GA',
    contact: 'Melissa Stone',
    email: 'melissa@northbridge.example',
    phone: '+1 (555) 020-1003',
    employees: 3,
    industry: 'Technology',
    activeSince: '2025-01-20',
    accountOwner: 'Ava Reynolds',
    billingContact: 'finance@northbridge.example',
    notes: 'Can operate as direct client and intermediary vendor.',
    history: [{ fromDate: '2025-01-20', toDate: '', status: 'Active', note: 'Dual role mapping' }],
  },
];

export const relationshipMap = [
  { id: 1, entity: 'GxP Consulting', client: 'Peak Health Systems', vendor: 'Vertex Talent LLC', status: 'Mapped', note: 'Vendor approved path to Peak' },
  { id: 2, entity: 'GxP Consulting', client: 'Peak Health Systems', vendor: 'NorthBridge Solutions', status: 'Mapped', note: 'Sub-contract path' },
  { id: 3, entity: 'GxP Consulting', client: 'NorthBridge Solutions', vendor: 'Self / Direct', status: 'Direct', note: 'Direct client route' },
];

export const documentCategories = [
  { id: 1, name: 'Passport', scope: 'Employee Onboarding', entity: 'GxP Consulting' },
  { id: 2, name: 'Visa', scope: 'Employee Onboarding', entity: 'GxP Consulting' },
  { id: 3, name: 'ID Proof', scope: 'Employee Onboarding', entity: 'GxP Consulting' },
  { id: 4, name: 'Previous Employment', scope: 'Employee Onboarding', entity: 'GxP Consulting' },
  { id: 5, name: 'Offer Letter', scope: 'Employee Assignment', entity: 'GxP Consulting' },
  { id: 6, name: 'Master Service Agreement', scope: 'Client/Vendor Docs', entity: 'GxP Consulting' },
  { id: 7, name: 'Exhibit / Addendum', scope: 'Client/Vendor Docs', entity: 'GxP Consulting' },
];

export const marketingCases = [
  {
    id: 'MC-2041',
    employeeId: 101,
    employee: 'Rahul Sharma',
    recruiter: 'Nina Patel',
    state: 'Active Marketing',
    queueStatus: 'Assigned',
    assignedAt: '2026-03-12',
    summary: 'Java backend consultant open for pharma / health clients',
    submissions: [
      {
        id: 'SUB-901',
        clientId: 301,
        vendorId: 302,
        client: 'Peak Health Systems',
        vendor: 'Vertex Talent LLC',
        route: 'Vertex Talent LLC → Peak Health Systems',
        outcome: 'In Review',
        note: 'Conflict check flagged prior employment path through Vertex.',
        conflict: 'Past employment overlap found with Vertex Talent LLC',
      },
      {
        id: 'SUB-902',
        clientId: 303,
        vendorId: null,
        client: 'NorthBridge Solutions',
        vendor: '',
        route: 'NorthBridge Solutions (Direct)',
        outcome: 'Interview Scheduled',
        note: 'Technical screen booked Friday.',
        conflict: '',
      },
    ],
    history: [
      { date: '2026-03-12', action: 'Assigned to Nina Patel', by: 'Nina Patel' },
      { date: '2026-03-13', action: 'Submission created to Vertex → Peak', by: 'Nina Patel' },
    ],
  },
  {
    id: 'MC-2042',
    employeeId: 103,
    employee: 'Daniel Brooks',
    recruiter: '',
    state: 'Queue',
    queueStatus: 'Open',
    assignedAt: '',
    summary: 'Bench consultant visible to all recruiters',
    submissions: [],
    history: [],
  },
];

export const onboardingCases = [
  {
    id: 'OB-7001',
    employeeId: 102,
    employee: 'Emily Carter',
    client: 'Peak Health Systems',
    vendorPath: 'Direct Client',
    hr: 'Sara Gomez',
    state: 'Document Collection',
    taskCount: 5,
    assignmentEnd: '2026-09-30',
    docsRequested: ['Passport', 'ID Proof', 'Visa', 'Offer Letter Ack', 'Previous Employment'],
  },
  {
    id: 'OB-7002',
    employeeId: 101,
    employee: 'Rahul Sharma',
    client: 'Peak Health Systems',
    vendorPath: 'Vertex Talent LLC → Peak Health Systems',
    hr: 'Sara Gomez',
    state: 'Pending Onboarding',
    taskCount: 3,
    assignmentEnd: '2026-12-31',
    docsRequested: ['Passport', 'Visa', 'ID Proof'],
  },
];

export const approvalItems = {
  timesheets: [
    { id: 'APR-1001', employee: 'Emily Carter', entity: 'GxP Consulting', detail: 'Week 12 • 40 hours • Peak Health', stage: 'HR Review', priority: 'High' },
    { id: 'APR-1002', employee: 'Rahul Sharma', entity: 'GxP Consulting', detail: 'Week 12 • 38 hours • Bench Training', stage: 'HR Review', priority: 'Medium' },
  ],
  onboarding: [
    { id: 'APR-2001', employee: 'Rahul Sharma', entity: 'GxP Consulting', detail: 'Passport, Visa, ID Proof', stage: 'Document Review', priority: 'High' },
    { id: 'APR-2002', employee: 'Emily Carter', entity: 'GxP Consulting', detail: 'Offer acknowledgement', stage: 'Offer Review', priority: 'Low' },
  ],
};

export const employeeTasks = [
  { title: 'Upload Passport for onboarding', due: 'Today', status: 'Open' },
  { title: 'Acknowledge Offer Letter', due: 'Tomorrow', status: 'Pending' },
  { title: 'Submit current week timesheet', due: 'Friday', status: 'Open' },
];

export const reportingContacts = [
  { name: 'Sara Gomez', role: 'HR Contact', detail: 'GxP Consulting' },
  { name: 'Marcus Lee', role: 'Recruiting Lead', detail: 'Marketing owner history' },
  { name: 'Finance Operations', role: 'Payroll Contact', detail: 'Weekly payroll cycle' },
];

export const employeeStats = [
  { label: 'Pending tasks', value: '3', detail: '2 due this week' },
  { label: 'Hours this week', value: '32', detail: 'Weekly target: 40' },
  { label: 'Offer letters', value: '1', detail: 'Awaiting acknowledgement' },
  { label: 'Past assignments', value: '2', detail: 'Visible in history' },
];


export const adminEmployees = employees;
export const notifications = [
  { title: 'Timesheet due Friday', text: 'Submit the current week timesheet before 5:00 PM.', time: '2h ago' },
  { title: 'Offer acknowledgement pending', text: 'Review and accept your current offer letter.', time: 'Today' },
  { title: 'Assignment expiry watchlist updated', text: 'HR/admin reminders are ready for upcoming renewals.', time: 'Tomorrow' },
];
export const leaveBalances = [
  { label: 'Annual Leave', value: '8 days' },
  { label: 'Sick Leave', value: '4 days' },
  { label: 'Personal Leave', value: '2 days' },
];
export const leaveRequests = [
  { type: 'Annual Leave', from: '2026-04-07', to: '2026-04-11', status: 'Pending' },
  { type: 'Sick Leave', from: '2026-02-16', to: '2026-02-16', status: 'Approved' },
];
