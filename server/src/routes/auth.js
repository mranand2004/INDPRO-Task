const express = require("express");
const router = express.Router();
const {
  register,
  login,
  refreshAccessToken,
  logout,
  logoutAll,
  getMe,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  registerValidation,
  loginValidation,
} = require("../validators/authValidators");

// Public routes
router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);
router.post("/refresh", refreshAccessToken);

// Protected routes
router.post("/logout", protect, logout);
router.post("/logout-all", protect, logoutAll);
router.get("/me", protect, getMe);

// Soft logout — clears cookie even without valid access token (for expired token logout)
router.post("/logout-soft", logout);

module.exports = router;
