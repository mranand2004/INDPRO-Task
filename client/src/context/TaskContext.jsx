import { createContext, useContext, useState, useCallback, useMemo } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/tasks");
      setTasks(data.data.tasks);
    } catch (err) {
      const message = err.response?.data?.message || "Failed to fetch tasks";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (taskData) => {
    try {
      const { data } = await api.post("/tasks", taskData);
      setTasks((prev) => [data.data.task, ...prev]);
      toast.success("Task created");
      return data.data.task;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to create task";
      toast.error(message);
      throw err;
    }
  }, []);

  const updateTask = useCallback(async (id, taskData) => {
    try {
      const { data } = await api.put(`/tasks/${id}`, taskData);
      setTasks((prev) =>
        prev.map((t) => (t._id === id || t.id === id ? data.data.task : t))
      );
      toast.success("Task updated");
      return data.data.task;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update task";
      toast.error(message);
      throw err;
    }
  }, []);

  const deleteTask = useCallback(async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id && t.id !== id));
      toast.success("Task deleted");
    } catch (err) {
      const message = err.response?.data?.message || "Failed to delete task";
      toast.error(message);
      throw err;
    }
  }, []);

  const updateTaskStage = useCallback(async (id, stage) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t._id === id || t.id === id ? { ...t, stage } : t))
    );
    try {
      const { data } = await api.patch(`/tasks/${id}/stage`, { stage });
      setTasks((prev) =>
        prev.map((t) => (t._id === id || t.id === id ? data.data.task : t))
      );
      return data.data.task;
    } catch (err) {
      // Revert optimistic update on failure
      await fetchTasks();
      const message = err.response?.data?.message || "Failed to move task";
      toast.error(message);
      throw err;
    }
  }, [fetchTasks]);

  // Derived state: tasks grouped by stage
  const tasksByStage = useMemo(() => ({
    todo: tasks.filter((t) => t.stage === "todo"),
    "in-progress": tasks.filter((t) => t.stage === "in-progress"),
    done: tasks.filter((t) => t.stage === "done"),
  }), [tasks]);

  const value = {
    tasks,
    tasksByStage,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStage,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
}
