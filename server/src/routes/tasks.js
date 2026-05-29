const express = require("express");
const router = express.Router();
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStage,
} = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  createTaskValidation,
  updateTaskValidation,
  taskIdValidation,
} = require("../validators/taskValidators");

// All task routes are protected
router.use(protect);

router.route("/")
  .get(getTasks)
  .post(createTaskValidation, validate, createTask);

router.route("/:id")
  .get(taskIdValidation, validate, getTask)
  .put(updateTaskValidation, validate, updateTask)
  .delete(taskIdValidation, validate, deleteTask);

router.patch("/:id/stage", taskIdValidation, validate, updateTaskStage);

module.exports = router;
