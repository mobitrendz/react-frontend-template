import { X, Calendar, Flag, Activity } from "lucide-react";
import { ToDoPriority, ToDoStatus } from "../../client/types.gen";

interface TaskFormProps {
  title: string;
  description: string;
  priority: ToDoPriority;
  status: ToDoStatus;
  dueDate: string;
  isEditing: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onTitleChange: (val: string) => void;
  onDescriptionChange: (val: string) => void;
  onPriorityChange: (val: ToDoPriority) => void;
  onStatusChange: (val: ToDoStatus) => void;
  onDueDateChange: (val: string) => void;
}

const TaskForm = ({
  title,
  description,
  priority,
  status,
  dueDate,
  isEditing,
  isSubmitting,
  onClose,
  onSubmit,
  onTitleChange,
  onDescriptionChange,
  onPriorityChange,
  onStatusChange,
  onDueDateChange,
}: TaskFormProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--card-bg)] w-full max-w-lg rounded-3xl shadow-2xl border border-[var(--border)] overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-[var(--border)] flex justify-between items-center bg-[var(--sidebar-bg)]">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-h)]">
              {isEditing ? "Edit Task" : "Create New Task"}
            </h2>
            <p className="text-xs text-[var(--text-dim)] font-medium uppercase tracking-widest mt-0.5">
              Task Details
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--text-dim)] hover:text-[var(--text-h)] hover:bg-[var(--bg)] rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="task-title"
              className="text-sm font-bold text-[var(--text-h)] flex items-center gap-2"
            >
              Title
            </label>
            <input
              id="task-title"
              type="text"
              placeholder="What needs to be done?"
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition-all font-medium"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="task-desc"
              className="text-sm font-bold text-[var(--text-h)]"
            >
              Description
            </label>
            <textarea
              id="task-desc"
              placeholder="Add more context or sub-tasks..."
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl px-5 py-3.5 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition-all text-sm"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="task-priority"
                className="text-sm font-bold text-[var(--text-h)] flex items-center gap-2"
              >
                <Flag className="w-3.5 h-3.5 text-[var(--text-dim)]" />
                Priority
              </label>
              <select
                id="task-priority"
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition-all text-sm font-medium"
                value={priority}
                onChange={(e) =>
                  onPriorityChange(e.target.value as ToDoPriority)
                }
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="task-status"
                className="text-sm font-bold text-[var(--text-h)] flex items-center gap-2"
              >
                <Activity className="w-3.5 h-3.5 text-[var(--text-dim)]" />
                Status
              </label>
              <select
                id="task-status"
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition-all text-sm font-medium"
                value={status}
                onChange={(e) => onStatusChange(e.target.value as ToDoStatus)}
              >
                <option value="pending">Pending</option>
                <option value="in progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="task-due-date"
              className="text-sm font-bold text-[var(--text-h)] flex items-center gap-2"
            >
              <Calendar className="w-3.5 h-3.5 text-[var(--text-dim)]" />
              Due Date
            </label>
            <input
              id="task-due-date"
              type="datetime-local"
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition-all text-sm"
              value={dueDate}
              onChange={(e) => onDueDateChange(e.target.value)}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3.5 bg-[var(--bg)] border border-[var(--border)] text-[var(--text-h)] rounded-2xl font-bold hover:bg-[var(--sidebar-bg)] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3.5 bg-[var(--accent)] text-white rounded-2xl font-bold hover:shadow-lg shadow-[var(--accent)]/20 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isSubmitting
                ? "Processing..."
                : isEditing
                  ? "Update Task"
                  : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
