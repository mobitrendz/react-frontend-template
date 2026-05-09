import { useState, useEffect } from "react";
import TaskBoard from "./TaskBoard";
import TaskForm from "./TaskForm";
import {
  readTodosApiV1TodosGet,
  createTodoApiV1TodosPost,
  updateTodoApiV1TodosIdPatch,
  deleteTodoApiV1TodosIdDelete,
} from "../../client/sdk.gen";
import {
  ToDoListPublic,
  ToDoPriority,
  ToDoStatus,
} from "../../client/types.gen";

const UserTaskView = () => {
  const [todos, setTodos] = useState<ToDoListPublic[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<ToDoListPublic | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<ToDoPriority>("medium");
  const [status, setStatus] = useState<ToDoStatus>("pending");
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setIsLoading(true);
      const response = await readTodosApiV1TodosGet();
      if (response.data && response.data.data) {
        setTodos(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch todos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingTodo(null);
    setTitle("");
    setDescription("");
    setPriority("medium");
    setStatus("pending");
    setDueDate("");
    setIsFormOpen(true);
  };

  const handleEditClick = (todo: ToDoListPublic) => {
    setEditingTodo(todo);
    setTitle(todo.title);
    setDescription(todo.description || "");
    setPriority(todo.priority || "medium");
    setStatus(todo.status || "pending");
    setDueDate(todo.due_date_time ? todo.due_date_time.slice(0, 16) : "");
    setIsFormOpen(true);
  };

  const handleToggleStatus = async (todo: ToDoListPublic) => {
    const nextStatus: ToDoStatus =
      todo.status === "completed" ? "pending" : "completed";
    try {
      await updateTodoApiV1TodosIdPatch({
        path: { id: todo.id },
        body: { status: nextStatus },
      });
      await fetchTodos();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await deleteTodoApiV1TodosIdDelete({ path: { id } });
      await fetchTodos();
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const body = {
        title,
        description,
        priority,
        status,
        due_date_time: dueDate || null,
      };

      if (editingTodo) {
        await updateTodoApiV1TodosIdPatch({
          path: { id: editingTodo.id },
          body,
        });
      } else {
        await createTodoApiV1TodosPost({ body });
      }

      setIsFormOpen(false);
      await fetchTodos();
    } catch (error) {
      console.error("Failed to save task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <TaskBoard
        todos={todos}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddClick={handleAddClick}
        onToggleStatus={handleToggleStatus}
        onEditClick={handleEditClick}
        onDeleteTask={handleDeleteTask}
      />

      {isFormOpen && (
        <TaskForm
          title={title}
          description={description}
          priority={priority}
          status={status}
          dueDate={dueDate}
          isEditing={!!editingTodo}
          isSubmitting={isSubmitting}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleSubmit}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onPriorityChange={setPriority}
          onStatusChange={setStatus}
          onDueDateChange={setDueDate}
        />
      )}
    </div>
  );
};

export default UserTaskView;
