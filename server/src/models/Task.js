const mongoose = require("mongoose");

const TASK_STAGES = ["todo", "in-progress", "done"];

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      minlength: [1, "Title cannot be empty"],
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: "",
    },
    stage: {
      type: String,
      enum: {
        values: TASK_STAGES,
        message: "Stage must be one of: todo, in-progress, done",
      },
      default: "todo",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Index for fast user-scoped queries
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for efficient queries: user's tasks sorted by creation
taskSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Task", taskSchema);
module.exports.TASK_STAGES = TASK_STAGES;
