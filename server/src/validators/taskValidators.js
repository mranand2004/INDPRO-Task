const { body, param } = require("express-validator");
const { TASK_STAGES } = require("../models/Task");

const createTaskValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 150 })
    .withMessage("Title cannot exceed 150 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),

  body("stage")
    .optional()
    .isIn(TASK_STAGES)
    .withMessage(`Stage must be one of: ${TASK_STAGES.join(", ")}`),
];

const updateTaskValidation = [
  param("id").isMongoId().withMessage("Invalid task ID"),

  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty")
    .isLength({ max: 150 })
    .withMessage("Title cannot exceed 150 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),

  body("stage")
    .optional()
    .isIn(TASK_STAGES)
    .withMessage(`Stage must be one of: ${TASK_STAGES.join(", ")}`),
];

const taskIdValidation = [
  param("id").isMongoId().withMessage("Invalid task ID"),
];

module.exports = {
  createTaskValidation,
  updateTaskValidation,
  taskIdValidation,
};
