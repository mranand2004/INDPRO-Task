import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutCancel = () => {
    if (loggingOut) return;
    setShowLogoutConfirm(false);
  };

  const handleLogoutConfirm = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  // Close logout modal on Escape key
  const handleEscKey = useCallback(
    (e) => {
      if (e.key === "Escape" && showLogoutConfirm && !loggingOut) {
        setShowLogoutConfirm(false);
      }
    },
    [showLogoutConfirm, loggingOut]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [handleEscKey]);

  // Lock body scroll when logout modal is open
  useEffect(() => {
    if (showLogoutConfirm) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showLogoutConfirm]);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <>
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <div className="navbar-inner">
          <div className="navbar-brand" aria-label="TaskFlow home">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
            <span>TaskFlow</span>
          </div>

          <div className="navbar-user">
            <button
              onClick={toggleTheme}
              className="btn-theme-toggle"
              title="Toggle theme"
              aria-label="Toggle theme"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--color-text-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "8px",
                marginRight: "12px",
                borderRadius: "50%",
              }}
            >
              {isDark ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <div className="user-avatar" aria-hidden="true" title={user?.name}>
              {initials}
            </div>
            <span className="user-name">{user?.name}</span>
            <button
              onClick={handleLogoutClick}
              className="btn-logout"
              title="Logout"
              aria-label="Logout"
              disabled={loggingOut}
            >
              {loggingOut ? (
                <span className="btn-spinner btn-spinner--dark" />
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div
          className="modal-overlay"
          onClick={handleLogoutCancel}
          role="presentation"
        >
          <div
            className="modal logout-modal"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
            aria-describedby="logout-modal-desc"
          >
            <div className="logout-modal-icon" aria-hidden="true">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
            <h2 id="logout-modal-title">Log out?</h2>
            <p id="logout-modal-desc">
              Are you sure you want to log out of your account?
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={handleLogoutCancel}
                disabled={loggingOut}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleLogoutConfirm}
                disabled={loggingOut}
                autoFocus
              >
                {loggingOut ? <span className="btn-spinner" /> : null}
                {loggingOut ? "Logging out..." : "Log Out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;

