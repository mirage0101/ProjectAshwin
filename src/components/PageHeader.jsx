export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="page-header card compact-page-header">
      <div className="page-header-copy">
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        <p>{description}</p>
        <div className="page-header-accent" aria-hidden="true" />
      </div>
      {actions ? <div className="header-actions">{actions}</div> : null}
    </div>
  );
}
