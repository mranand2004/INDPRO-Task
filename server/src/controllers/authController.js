const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/tokenUtils");
const {
  getRefreshCookieOptions,
  getClearCookieOptions,
} = require("../utils/cookieOptions");
const { REFRESH_TOKEN_COOKIE } = require("../config/constants");

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw ApiError.conflict("Email already registered");
    }

    // Create user
    const user = await User.create({ name, email, password });

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token in DB (hashed array for multi-device support), keeping only last 5 sessions
    await User.findByIdAndUpdate(user._id, {
      $push: { refreshTokens: { $each: [refreshToken], $slice: -5 } },
    });

    // Set refresh token in httpOnly cookie
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, getRefreshCookieOptions());

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token in DB, keeping only last 5 sessions
    await User.findByIdAndUpdate(user._id, {
      $push: { refreshTokens: { $each: [refreshToken], $slice: -5 } },
    });

    // Set refresh token in httpOnly cookie
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, getRefreshCookieOptions());

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Refresh access token using refresh token from cookie
 * @route   POST /api/auth/refresh
 * @access  Public (requires valid refresh token cookie)
 *
 * Implements refresh token rotation:
 * - Old refresh token is invalidated
 * - New refresh token is issued
 * - Detects token reuse (potential theft) and invalidates all sessions
 */
const refreshAccessToken = async (req, res, next) => {
  try {
    const incomingRefreshToken = req.cookies[REFRESH_TOKEN_COOKIE];

    if (!incomingRefreshToken) {
      throw ApiError.unauthorized("Your session has expired. Please log in again.");
    }

    // Verify the refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(incomingRefreshToken);
    } catch (error) {
      // If token is expired or invalid, clear cookie
      res.clearCookie(REFRESH_TOKEN_COOKIE, getClearCookieOptions());
      throw ApiError.unauthorized("Your session has expired. Please log in again.");
    }

    // Find user and check if this refresh token exists in their stored tokens
    const user = await User.findById(decoded.id).select("+refreshTokens");

    if (!user) {
      throw ApiError.unauthorized("Account not found. Please log in again.");
    }

    // Check if the incoming token is in the user's stored tokens
    const tokenIndex = user.refreshTokens.indexOf(incomingRefreshToken);

    if (tokenIndex === -1) {
      // Token reuse detected — possible token theft
      // Invalidate ALL refresh tokens for this user (force re-login on all devices)
      await User.findByIdAndUpdate(user._id, { refreshTokens: [] });
      res.clearCookie(REFRESH_TOKEN_COOKIE, getClearCookieOptions());
      throw ApiError.unauthorized(
        "Your session is no longer valid. Please log in again."
      );
    }

    // Rotate: Remove old token, generate new pair
    user.refreshTokens.splice(tokenIndex, 1);

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshTokens.push(newRefreshToken);
    
    // Keep only the last 5 tokens
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }
    
    await user.save({ validateBeforeSave: false });

    // Set new refresh token in cookie
    res.cookie(REFRESH_TOKEN_COOKIE, newRefreshToken, getRefreshCookieOptions());

    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user (invalidate current refresh token)
 * @route   POST /api/auth/logout  (protected) or /api/auth/logout-soft (public)
 * @access  Private / Public
 */
const logout = async (req, res, next) => {
  try {
    const incomingRefreshToken = req.cookies[REFRESH_TOKEN_COOKIE];

    if (incomingRefreshToken && req.user) {
      // Remove this specific refresh token from DB
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { refreshTokens: incomingRefreshToken },
      });
    }

    // Clear the cookie regardless
    res.clearCookie(REFRESH_TOKEN_COOKIE, getClearCookieOptions());

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout from all devices (invalidate all refresh tokens)
 * @route   POST /api/auth/logout-all
 * @access  Private
 */
const logoutAll = async (req, res, next) => {
  try {
    // Clear all refresh tokens for this user
    await User.findByIdAndUpdate(req.user._id, { refreshTokens: [] });

    // Clear the cookie
    res.clearCookie(REFRESH_TOKEN_COOKIE, getClearCookieOptions());

    res.status(200).json({
      success: true,
      message: "Logged out from all devices",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current authenticated user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          createdAt: req.user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshAccessToken,
  logout,
  logoutAll,
  getMe,
};
