const ApiError = require("../utils/ApiError");
const { verifyAccessToken } = require("../utils/tokenUtils");
const User = require("../models/User");

/**
 * Protect routes — verifies access token from Authorization header
 * Attaches user object to req.user
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw ApiError.unauthorized("Please log in to continue.");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw ApiError.unauthorized("Please log in to continue.");
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Attach user to request (without password & refreshTokens)
    const user = await User.findById(decoded.id);

    if (!user) {
      throw ApiError.unauthorized("Account not found. Please log in again.");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(ApiError.unauthorized("Your session has expired. Please log in again."));
    }
    if (error.name === "JsonWebTokenError") {
      return next(ApiError.unauthorized("Invalid session. Please log in again."));
    }
    next(error);
  }
};

module.exports = { protect };
