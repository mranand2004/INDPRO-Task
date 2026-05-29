import { useEffect, useState } from "react";
import { useTasks } from "../context/TaskContext";
import Navbar from "../components/Navbar";
import TaskColumn from "../components/TaskColumn";
import TaskForm from "../components/TaskForm";
import Loader from "../components/Loader";

const STAGES = ["todo", "in-progress", "done"];

function Dashboard() {
  const {
    tasks,
    tasksByStage,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStage,
  } = useTasks();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreate = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    if (editingTask) {
      const taskId = editingTask._id || editingTask.id;
      await updateTask(taskId, formData);
    } else {
      await createTask(formData);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content" id="main-content">
        <div className="board-header">
          <div>
            <h1>Task Board</h1>
            <p className="board-subtitle">
              {loading
                ? "Loading tasks..."
                : `${tasks.length} task${tasks.length !== 1 ? "s" : ""} total`}
            </p>
          </div>
          <button
            className="btn btn-primary btn-create"
            onClick={handleCreate}
            aria-label="Create new task"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Task
          </button>
        </div>

        {loading ? (
          <Loader />
        ) : error ? (
          <div className="board-error" role="alert">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p>{error}</p>
            <button className="btn btn-secondary" onClick={fetchTasks}>
              Try Again
            </button>
          </div>
        ) : (
          <div className="board" role="region" aria-label="Task board">
            {STAGES.map((stage) => (
              <TaskColumn
                key={stage}
                stage={stage}
                tasks={tasksByStage[stage]}
                onEdit={handleEdit}
                onDelete={deleteTask}
                onStageChange={updateTaskStage}
              />
            ))}
          </div>
        )}
      </main>

      <TaskForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        editingTask={editingTask}
      />
    </div>
  );
}

export default Dashboard;
