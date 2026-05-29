import { useState } from "react";
import TaskCard from "./TaskCard";

const STAGE_CONFIG = {
  todo: { label: "To Do", color: "#6366f1", emoji: "📋", emptyIcon: "📝", emptyText: "No tasks yet" },
  "in-progress": { label: "In Progress", color: "#f59e0b", emoji: "⚡", emptyIcon: "🚀", emptyText: "Nothing in progress" },
  done: { label: "Done", color: "#22c55e", emoji: "✅", emptyIcon: "🎉", emptyText: "No completed tasks" },
};

function TaskColumn({ stage, tasks, onEdit, onDelete, onStageChange }) {
  const config = STAGE_CONFIG[stage];
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    // Only remove highlight if leaving the actual column container
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData("taskId");
    const sourceStage = e.dataTransfer.getData("sourceStage");
    
    if (taskId && sourceStage !== stage) {
      onStageChange(taskId, stage);
    }
  };

  return (
    <div 
      className={`task-column ${isDragOver ? "task-column--drag-over" : ""}`}
      role="region" 
      aria-label={`${config.label} column`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="column-header">
        <div className="column-title">
          <span className="column-emoji" aria-hidden="true">{config.emoji}</span>
          <h2>{config.label}</h2>
          <span className="column-count" aria-label={`${tasks.length} tasks`}>
            {tasks.length}
          </span>
        </div>
        <div
          className="column-indicator"
          style={{ backgroundColor: config.color }}
          aria-hidden="true"
        />
      </div>

      <div className="column-tasks">
        {tasks.length === 0 ? (
          <div className="column-empty" aria-label={config.emptyText}>
            <div className="column-empty-icon" aria-hidden="true">{config.emptyIcon}</div>
            <p>{config.emptyText}</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task._id || task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onStageChange={onStageChange}
              currentStage={stage}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default TaskColumn;
