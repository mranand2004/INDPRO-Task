const Task = require("../models/Task");
const ApiError = require("../utils/ApiError");

/**
 * @desc    Get all tasks for the authenticated user
 * @route   GET /api/tasks
 * @access  Private
 */
const getTasks = async (req, res, next) => {
  try {
    const { stage, sort } = req.query;

    // Build query filter
    const filter = { user: req.user._id };

    if (stage) {
      filter.stage = stage;
    }

    // Build sort option
    let sortOption = { createdAt: -1 }; // Default: newest first
    if (sort === "oldest") sortOption = { createdAt: 1 };
    if (sort === "updated") sortOption = { updatedAt: -1 };

    const tasks = await Task.find(filter).sort(sortOption);

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: { tasks },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single task by ID
 * @route   GET /api/tasks/:id
 * @access  Private
 */
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).lean();

    if (!task) {
      throw ApiError.notFound("Task not found");
    }

    res.status(200).json({
      success: true,
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 * @access  Private
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description, stage } = req.body;

    const task = await Task.create({
      title,
      description: description || "",
      stage: stage || "todo",
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Task created",
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a task
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
const updateTask = async (req, res, next) => {
  try {
    const { title, description, stage } = req.body;

    // Build update object with only provided fields
    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (stage !== undefined) updateFields.stage = stage;

    if (Object.keys(updateFields).length === 0) {
      throw ApiError.badRequest("No fields to update");
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updateFields,
      { new: true, runValidators: true }
    );

    if (!task) {
      throw ApiError.notFound("Task not found");
    }

    res.status(200).json({
      success: true,
      message: "Task updated",
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a task
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      throw ApiError.notFound("Task not found");
    }

    res.status(200).json({
      success: true,
      message: "Task deleted",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update task stage (quick stage change)
 * @route   PATCH /api/tasks/:id/stage
 * @access  Private
 */
const updateTaskStage = async (req, res, next) => {
  try {
    const { stage } = req.body;

    if (!stage) {
      throw ApiError.badRequest("Stage is required");
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { stage },
      { new: true, runValidators: true }
    );

    if (!task) {
      throw ApiError.notFound("Task not found");
    }

    res.status(200).json({
      success: true,
      message: "Task stage updated",
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStage,
};
