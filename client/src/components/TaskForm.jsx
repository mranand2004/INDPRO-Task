import { useState, useEffect, useRef } from "react";

const STAGE_OPTIONS = [
  { value: "todo", label: "📋 To Do" },
  { value: "in-progress", label: "⚡ In Progress" },
  { value: "done", label: "✅ Done" },
];

const TITLE_MAX = 150;
const DESC_MAX = 1000;

function TaskForm({ isOpen, onClose, onSubmit, editingTask }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    stage: "todo",
  });
  const [titleError, setTitleError] = useState("");
  const [loading, setLoading] = useState(false);
  const titleRef = useRef(null);

  const isEditing = !!editingTask;

  // Populate form when editing
  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title || "",
        description: editingTask.description || "",
        stage: editingTask.stage || "todo",
      });
    } else {
      setFormData({ title: "", description: "", stage: "todo" });
    }
    setTitleError("");
  }, [editingTask, isOpen]);

  // Focus title input when modal opens
  useEffect(() => {
    if (isOpen && titleRef.current) {
      const timer = setTimeout(() => titleRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Close on Escape key — but NOT during submission
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen && !loading) onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose, loading]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Trap focus inside modal
  useEffect(() => {
    if (!isOpen) return;
    const modal = document.getElementById("task-modal");
    if (!modal) return;
    const focusable = modal.querySelectorAll(
      'button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const handleTab = (e) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "title" && titleError) setTitleError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedTitle = formData.title.trim();
    if (!trimmedTitle) {
      setTitleError("Title is required");
      titleRef.current?.focus();
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ ...formData, title: trimmedTitle });
      setFormData({ title: "", description: "", stage: "todo" });
      onClose();
    } catch {
      // Error already shown by context toast
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = () => {
    if (!loading) onClose();
  };

  if (!isOpen) return null;

  const titleCharsLeft = TITLE_MAX - formData.title.length;
  const descCharsLeft = DESC_MAX - formData.description.length;

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        id="task-modal"
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <h2 id="modal-title">{isEditing ? "Edit Task" : "New Task"}</h2>
          <button
            className="icon-btn"
            onClick={onClose}
            disabled={loading}
            aria-label="Close modal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form" noValidate>
          <div className={`form-group ${titleError ? "form-group--error" : ""}`}>
            <div className="form-label-row">
              <label htmlFor="task-title">Title <span className="required-star">*</span></label>
              <span className={`char-count ${titleCharsLeft < 20 ? "char-count--warn" : ""}`}>
                {titleCharsLeft}
              </span>
            </div>
            <input
              ref={titleRef}
              id="task-title"
              name="title"
              type="text"
              placeholder="What needs to be done?"
              value={formData.title}
              onChange={handleChange}
              maxLength={TITLE_MAX}
              disabled={loading}
              aria-required="true"
              aria-describedby={titleError ? "title-error" : undefined}
              aria-invalid={!!titleError}
            />
            {titleError && (
              <span className="field-error" id="title-error" role="alert">
                {titleError}
              </span>
            )}
          </div>

          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="task-description">Description <span className="optional-label">(optional)</span></label>
              <span className={`char-count ${descCharsLeft < 100 ? "char-count--warn" : ""}`}>
                {descCharsLeft}
              </span>
            </div>
            <textarea
              id="task-description"
              name="description"
              placeholder="Add more details..."
              value={formData.description}
              onChange={handleChange}
              maxLength={DESC_MAX}
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-stage">Stage</label>
            <select
              id="task-stage"
              name="stage"
              value={formData.stage}
              onChange={handleChange}
              disabled={loading}
            >
              {STAGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !formData.title.trim()}
            >
              {loading ? <span className="btn-spinner" /> : null}
              {isEditing ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskForm;
