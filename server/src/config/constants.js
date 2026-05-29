/**
 * Application-wide constants
 */
module.exports = {
  // Token expiry durations
  ACCESS_TOKEN_EXPIRY: "15m",
  REFRESH_TOKEN_EXPIRY: "7d",

  // Cookie settings
  REFRESH_TOKEN_COOKIE: "refreshToken",
  REFRESH_TOKEN_COOKIE_MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days in ms

  // User roles (extensible for future)
  ROLES: {
    USER: "user",
    ADMIN: "admin",
  },
};
