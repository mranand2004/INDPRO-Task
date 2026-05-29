import { useState } from "react";

const STAGE_OPTIONS = [
  { value: "todo", label: "To Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

function TaskCard({ task, onEdit, onDelete, onStageChange, currentStage }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const taskId = task._id || task.id;

  const handleDeleteClick = () => {
    setConfirmDelete(true);
  };

  const handleDeleteConfirm = async () => {
    if (isDeleting) return;
    setConfirmDelete(false);
    setIsDeleting(true);
    try {
      await onDelete(taskId);
    } catch {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setConfirmDelete(false);
  };

  const handleStageChange = async (e) => {
    const newStage = e.target.value;
    if (newStage === currentStage || isMoving) return;
    setIsMoving(true);
    try {
      await onStageChange(taskId, newStage);
    } catch {
      // revert handled by context
    } finally {
      setIsMoving(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (confirmDelete) {
    return (
      <div className="task-card task-card--confirm">
        <p className="confirm-text">Delete this task?</p>
        <p className="confirm-title">&ldquo;{task.title}&rdquo;</p>
        <div className="confirm-actions">
          <button className="btn btn-secondary btn-sm" onClick={handleDeleteCancel}>
            Cancel
          </button>
          <button className="btn btn-danger btn-sm" onClick={handleDeleteConfirm}>
            Delete
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`task-card ${isDeleting ? "task-card--deleting" : ""}`}
      draggable={!isDeleting && !confirmDelete}
      onDragStart={(e) => {
        e.dataTransfer.setData("taskId", taskId);
        e.dataTransfer.setData("sourceStage", currentStage);
        e.dataTransfer.effectAllowed = "move";
        // Optional: add a slight delay to add a dragging class
        setTimeout(() => e.target.classList.add('task-card--dragging'), 0);
      }}
      onDragEnd={(e) => {
        e.target.classList.remove('task-card--dragging');
      }}
    >
      <div className="task-card-header">
        <h3 className="task-card-title">{task.title}</h3>
        <div className="task-card-actions">
          <button
            className="icon-btn"
            onClick={() => onEdit(task)}
            title="Edit task"
            aria-label={`Edit task: ${task.title}`}
            disabled={isDeleting}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            className="icon-btn icon-btn--danger"
            onClick={handleDeleteClick}
            disabled={isDeleting}
            title="Delete task"
            aria-label={`Delete task: ${task.title}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </button>
        </div>
      </div>

      {task.description && (
        <p className="task-card-desc">{task.description}</p>
      )}

      <div className="task-card-footer">
        <select
          className={`stage-select ${isMoving ? "stage-select--loading" : ""}`}
          value={currentStage}
          onChange={handleStageChange}
          disabled={isMoving || isDeleting}
          aria-label="Change task stage"
        >
          {STAGE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="task-card-date" title={new Date(task.createdAt || task.updatedAt).toLocaleString()}>
          {formatDate(task.createdAt || task.updatedAt)}
        </span>
      </div>
    </div>
  );
}

export default TaskCard;
