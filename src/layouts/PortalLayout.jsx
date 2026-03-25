import { Link, NavLink } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import Icon from '../components/Icon';
import markImage from '../assets/basecamp-mark.png';
import { useTheme } from '../context/ThemeContext';
import { company } from '../services/mockData';
import { getProfile } from '../services/portalStore';
import { canManageDocumentsSetup, canSeeEntities, canSeeReports, getEmployerRole } from '../services/session';

const employerMenusByRole = {
  superadmin: [
    ['dashboard', 'Home / Overview', '/employer'],
    ['entity', 'Entity', '/employer/entities'],
    ['employees', 'Team', '/employer/team'],
    ['clients', 'Clients & Vendors', '/employer/clients'],
    ['employees', 'Employee', '/employer/employees'],
    ['payroll', 'Marketing', '/employer/marketing'],
    ['onboarding', 'Onboarding', '/employer/onboarding'],
    ['timesheet', 'Timesheets', '/employer/timesheets'],
    ['approvals', 'Approvals', '/employer/approvals'],
    ['documents', 'Documents Setup', '/employer/documents'],
    ['reports', 'Reports', '/employer/reports'],
  ],
  admin: [
    ['dashboard', 'Home / Overview', '/employer'],
    ['employees', 'Team', '/employer/team'],
    ['clients', 'Clients & Vendors', '/employer/clients'],
    ['employees', 'Employee', '/employer/employees'],
    ['payroll', 'Marketing', '/employer/marketing'],
    ['onboarding', 'Onboarding', '/employer/onboarding'],
    ['timesheet', 'Timesheets', '/employer/timesheets'],
    ['approvals', 'Approvals', '/employer/approvals'],
    ['documents', 'Documents Setup', '/employer/documents'],
    ['reports', 'Reports', '/employer/reports'],
  ],
  lead_recruiter: [
    ['dashboard', 'Home / Overview', '/employer'],
    ['clients', 'Clients & Vendors', '/employer/clients'],
    ['employees', 'Employee', '/employer/employees'],
    ['payroll', 'Marketing', '/employer/marketing'],
    ['approvals', 'Approvals', '/employer/approvals'],
  ],
  recruiter: [
    ['dashboard', 'Home / Overview', '/employer'],
    ['clients', 'Clients & Vendors', '/employer/clients'],
    ['employees', 'Employee', '/employer/employees'],
    ['payroll', 'Marketing', '/employer/marketing'],
    ['approvals', 'Approvals', '/employer/approvals'],
  ],
  hr: [
    ['dashboard', 'Home / Overview', '/employer'],
    ['clients', 'Clients & Vendors', '/employer/clients'],
    ['employees', 'Employee', '/employer/employees'],
    ['onboarding', 'Onboarding', '/employer/onboarding'],
    ['approvals', 'Approvals', '/employer/approvals'],
    ['timesheet', 'Timesheets', '/employer/timesheets'],
    ['documents', 'Documents Setup', '/employer/documents'],
  ],
};

const employeeMenus = [
  ['dashboard', 'Home / Overview', '/employee'],
  ['onboarding', 'Tasks', '/employee/onboarding'],
  ['timesheet', 'Timesheet', '/employee/timesheets'],
];

const accentColors = ['var(--accent-1)', 'var(--accent-2)', 'var(--accent-3)', 'var(--accent-4)', '#5dbef3', '#f687b3'];

export default function PortalLayout({ role, children }) {
  const { theme, toggleTheme } = useTheme();
  const employerRole = getEmployerRole();
  const navItems = role === 'employee' ? employeeMenus : employerMenusByRole[employerRole] || employerMenusByRole.admin;
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const profile = getProfile(role);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="portal-root">
      <header className="portal-header thin-header textured-header">
        <div className="portal-header-left">
          <button className={`collapse-btn ${collapsed ? 'is-collapsed' : ''}`} onClick={() => setCollapsed((v) => !v)} aria-label="Toggle menu">
            <Icon name="menu" />
          </button>
          <Link className="banner-brand inline-banner-brand" to={role === 'employee' ? '/employee' : '/employer'}>
            <img src={markImage} alt="BaseCamp logo mark" />
            <div className="banner-brand-copy inline-copy">
              <h1>BaseCamp <span>|</span> <em>{company.name}</em></h1>
            </div>
          </Link>
        </div>

        <div className="portal-header-right">
          <button className={`theme-toggle ${theme === 'dark' ? 'dark' : 'light'}`} onClick={toggleTheme} aria-label="Toggle theme">
            <span className="theme-thumb" />
            <span className="theme-icon sun">☀</span>
            <span className="theme-icon moon">☾</span>
          </button>

          <div className="user-menu-wrap" ref={menuRef}>
            <button className="user-menu-trigger compact" onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen}>
              <div className="user-avatar">{profile.imageUrl ? <img src={profile.imageUrl} alt={profile.name} className="user-avatar-img" /> : (profile.name || 'BC').split(' ').map((part) => part[0]).slice(0,2).join('')}</div>
            </button>
            {menuOpen && (
              <div className="user-dropdown">
                <div className="user-dropdown-head">
                  <div className="user-avatar large">{profile.imageUrl ? <img src={profile.imageUrl} alt={profile.name} className="user-avatar-img" /> : (profile.name || 'BC').split(' ').map((part) => part[0]).slice(0,2).join('')}</div>
                  <div className="user-dropdown-copy">
                    <strong>{profile.name}</strong>
                    <span>{profile.title}</span>
                  </div>
                </div>
                <Link to={`/${role}/profile`} onClick={() => setMenuOpen(false)}><Icon name="profile" />Profile</Link>
                <Link to={`/${role}/settings`} onClick={() => setMenuOpen(false)}><Icon name="settings" />Settings</Link>
                <Link to={`/${role}/notifications`} onClick={() => setMenuOpen(false)}><Icon name="notifications" />Notifications</Link>
                <Link to="/login" onClick={() => setMenuOpen(false)}><Icon name="login" />Logout</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className={`portal-body ${collapsed ? 'collapsed' : 'expanded'}`}>
        <aside className="sidebar textured-sidebar">
          <div className="sidebar-nav">
            {navItems.map(([icon, label, path], idx) => (
              <NavLink
                key={path}
                to={path}
                end={path === `/${role}`}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                style={{ '--accent-color': accentColors[idx % accentColors.length] }}
                title={collapsed ? label : undefined}
              >
                <span className="nav-icon-shell"><Icon name={icon} /></span>
                <span className="nav-label">{label}</span>
                <span className="nav-indicator" />
              </NavLink>
            ))}
          </div>
        </aside>

        <main className="content-area">
          {children}
          <div className="page-footer">© 2026 {company.name}</div>
        </main>
      </div>
    </div>
  );
}
