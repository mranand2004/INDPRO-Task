import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: "center" }}>
        <div className="auth-header">
          <div className="auth-logo" style={{ background: "var(--color-error-light)", color: "var(--color-error)" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1>404</h1>
          <p>Page Not Found</p>
        </div>
        <p style={{ color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
