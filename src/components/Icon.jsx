const icons = {
  dashboard: (
    <path d="M4 13.5 12 5l8 8.5v5a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1z" />
  ),
  onboarding: (
    <>
      <path d="M5 12.5 9.2 17 19 7.5" />
      <path d="M20 12v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h9" />
    </>
  ),
  timesheet: (
    <>
      <path d="M7 3v3M17 3v3M4 9h16" />
      <rect x="4" y="5" width="16" height="15" rx="2" ry="2" />
      <path d="M8 13h3M13 13h3M8 17h3M13 17h3" />
    </>
  ),
  leave: (
    <>
      <path d="M12 21c5-4 8-7.3 8-11a4.5 4.5 0 0 0-8-2.8A4.5 4.5 0 0 0 4 10c0 3.7 3 7 8 11Z" />
    </>
  ),
  documents: (
    <>
      <path d="M8 3h7l5 5v12a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M15 3v5h5M10 13h6M10 17h6" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8" r="3.25" />
      <path d="M5 19a7 7 0 0 1 14 0" />
    </>
  ),
  notifications: (
    <>
      <path d="M12 3a4 4 0 0 1 4 4v2.2c0 .8.24 1.58.7 2.23l1.05 1.52A1 1 0 0 1 16.92 15H7.08a1 1 0 0 1-.82-1.58l1.05-1.52A3.8 3.8 0 0 0 8 9.2V7a4 4 0 0 1 4-4Z" />
      <path d="M9.5 18a2.5 2.5 0 0 0 5 0" />
    </>
  ),
  clients: (
    <>
      <rect x="4" y="6" width="16" height="12" rx="2" />
      <path d="M8 10h8M8 14h5" />
    </>
  ),
  entity: (
    <>
      <path d="M4 20V8l8-4 8 4v12" />
      <path d="M9 20v-5h6v5M8 10h.01M16 10h.01" />
    </>
  ),
  employees: (
    <>
      <circle cx="9" cy="9" r="2.5" />
      <circle cx="16.5" cy="8" r="2" />
      <path d="M4.5 18a4.5 4.5 0 0 1 9 0M13.5 18a3.5 3.5 0 0 1 7 0" />
    </>
  ),
  approvals: (
    <>
      <path d="M5 12.5 9.2 17 19 7.5" />
      <path d="M4 4h16v16H4z" />
    </>
  ),
  payroll: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 10h8M8 14h5M15 14h1M8 18h3" />
    </>
  ),
  reports: (
    <>
      <path d="M5 19V9M12 19V5M19 19v-8" />
      <path d="M3 19h18" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1.8 1.8 0 1 1-2.55 2.55l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.92V20a1.8 1.8 0 1 1-3.6 0v-.23a1 1 0 0 0-.65-.92 1 1 0 0 0-1.1.2l-.1.1A1.8 1.8 0 1 1 4.3 16.3l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.92-.6H3.4a1.8 1.8 0 1 1 0-3.6h.23a1 1 0 0 0 .92-.65 1 1 0 0 0-.2-1.1l-.1-.1A1.8 1.8 0 1 1 6.84 4.5l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.92V3.6a1.8 1.8 0 1 1 3.6 0v.23a1 1 0 0 0 .65.92 1 1 0 0 0 1.1-.2l.1-.1A1.8 1.8 0 1 1 19.7 7.1l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .92.6h.23a1.8 1.8 0 1 1 0 3.6h-.23a1 1 0 0 0-.92.65Z" />
    </>
  ),
  help: (
    <>
      <path d="M9.1 9a3 3 0 1 1 5.8 1c-.54.9-1.62 1.37-2.2 2.08-.38.47-.56.92-.56 1.92" />
      <circle cx="12" cy="17.25" r=".75" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="9" />
    </>
  ),
  login: <path d="M5 12h13M13 6l6 6-6 6" />,
  menu: (
    <>
      <path d="M5 7h14M5 12h14M5 17h14" />
    </>
  ),
};

export default function Icon({ name }) {
  return (
    <span className="icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {icons[name] || <circle cx="12" cy="12" r="2" />}
      </svg>
    </span>
  );
}
