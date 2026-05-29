const { validationResult } = require("express-validator");
const ApiError = require("../utils/ApiError");

/**
 * Middleware to check express-validator results
 * Use after validation chain in routes
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => err.msg);
    // Use next() instead of throw — throw doesn't work in Express 4 middleware
    return next(ApiError.badRequest("Validation failed", extractedErrors));
  }

  next();
};

module.exports = validate;
