import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import brandImage from '../assets/basecamp-brand.svg';
import cityBg from '../assets/city-night-login-true.jpg';
import { company } from '../services/mockData';
import { saveSession } from '../services/session';

const employerRoleOptions = [
  ['superadmin', 'Super Admin'],
  ['admin', 'Admin'],
  ['lead_recruiter', 'Lead Recruiter'],
  ['recruiter', 'Recruiter'],
  ['hr', 'HR'],
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState('employee');
  const [employerRole, setEmployerRole] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    saveSession({
      loginType,
      employerRole,
      email: email || (loginType === 'employee' ? 'rahul.sharma@gxp.example' : 'ava@gxp.example'),
    });
    navigate(loginType === 'employee' ? '/employee' : '/employer');
  };

  return (
    <div className="login-wrapper" style={{ backgroundImage: `url(${cityBg})` }}>
      <div className="login-left-section">
        <div className="login-logo-container">
          <img src={brandImage} alt="BaseCamp" className="login-logo-large" />
        </div>

        <div className="login-intro-text">
          <h1>Central workspace for Staffing,</h1>
          <h1>Marketing, Onboarding,</h1>
          <h1>& Time capture.</h1>
          <h2>{company.altDescription}</h2>
          <h3>© 2026 {company.name}</h3>
        </div>
      </div>

      <div className="login-right-section">
        <div className="login-form-container">
          <div className="login-panel-badge">Secure portal access</div>
          <h3 className="login-form-title">Sign in</h3>
          <p className="login-form-subtitle">Use the same branded login layout while switching between employee and employer demo flows.</p>

          <form onSubmit={handleLogin} className="login-form">
            <div className="role-selector">
              <p className="role-selector-label">Portal Type</p>
              <div className="role-toggle-group">
                <button type="button" className={`role-toggle-btn ${loginType === 'employee' ? 'active' : ''}`} onClick={() => setLoginType('employee')}>Employee</button>
                <button type="button" className={`role-toggle-btn ${loginType === 'employer' ? 'active' : ''}`} onClick={() => setLoginType('employer')}>Employer</button>
              </div>
            </div>

            {loginType === 'employer' && (
              <div className="form-group">
                <label htmlFor="employer-role">Employer Role</label>
                <select id="employer-role" value={employerRole} onChange={(e) => setEmployerRole(e.target.value)}>
                  {employerRoleOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input id="email" type="email" placeholder={loginType === 'employee' ? 'rahul.sharma@gxp.example' : 'ava@gxp.example'} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <button type="button" className="forgot-password-link">Forgot password?</button>
            <button type="submit" className="login-submit-btn">Sign In</button>
          </form>
        </div>
      </div>
    </div>
  );
}
