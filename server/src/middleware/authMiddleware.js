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
      throw ApiError.unauthorized("Access token is required");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw ApiError.unauthorized("Access token is required");
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Attach user to request (without password & refreshTokens)
    const user = await User.findById(decoded.id);

    if (!user) {
      throw ApiError.unauthorized("User no longer exists");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(ApiError.unauthorized("Access token expired"));
    }
    if (error.name === "JsonWebTokenError") {
      return next(ApiError.unauthorized("Invalid access token"));
    }
    next(error);
  }
};

module.exports = { protect };
