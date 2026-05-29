const { REFRESH_TOKEN_COOKIE_MAX_AGE } = require("../config/constants");

/**
 * Secure cookie options for refresh token
 *
 * NOTE: For cross-origin deployments (e.g. Vercel frontend + Render backend),
 * sameSite must be "none" and secure must be true (HTTPS required).
 * Set SAME_ORIGIN=true in env if frontend & backend share the same domain.
 */
const getSameSitePolicy = () => {
  if (process.env.NODE_ENV !== "production") return "lax";
  // If frontend and backend are on different domains (e.g., Vercel + Render)
  return process.env.SAME_ORIGIN === "true" ? "strict" : "none";
};

const getRefreshCookieOptions = () => ({
  httpOnly: true, // Not accessible via JavaScript
  secure: process.env.NODE_ENV === "production", // HTTPS only in production
  sameSite: getSameSitePolicy(),
  maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE,
  path: "/api/auth", // Only sent to auth routes
});

/**
 * Options to clear the refresh token cookie
 */
const getClearCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: getSameSitePolicy(),
  path: "/api/auth",
});

module.exports = { getRefreshCookieOptions, getClearCookieOptions };
