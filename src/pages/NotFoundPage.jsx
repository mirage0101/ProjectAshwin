import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="notfound-shell">
      <div className="card notfound-card">
        <div className="eyebrow">404</div>
        <h1>Page not found</h1>
        <p>The requested route is not part of this sample project.</p>
        <div className="inline-actions">
          <Link to="/login" className="button">Go to login</Link>
          <Link to="/employee" className="button button-secondary">Employee demo</Link>
          <Link to="/employer" className="button button-secondary">Employer demo</Link>
        </div>
      </div>
    </div>
  );
}
