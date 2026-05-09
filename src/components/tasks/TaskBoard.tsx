import { Plus, Search, Filter } from 'lucide-react'
import TaskCard from './TaskCard'
import { ToDoListPublic } from '../../client/types.gen'

interface TaskBoardProps {
  todos: ToDoListPublic[]
  searchTerm: string
  onSearchChange: (val: string) => void
  onAddClick: () => void
  onToggleStatus: (todo: ToDoListPublic) => void
  onEditClick: (todo: ToDoListPublic) => void
  onDeleteTask: (id: string) => void
}

const TaskBoard = ({ 
  todos, 
  searchTerm, 
  onSearchChange, 
  onAddClick, 
  onToggleStatus, 
  onEditClick, 
  onDeleteTask 
}: TaskBoardProps) => {
  const filteredTodos = todos.filter(todo => 
    todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    todo.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-h)]">My Tasks</h2>
          <p className="text-sm text-[var(--text-dim)]">Manage and track your productivity</p>
        </div>
        <button 
          onClick={onAddClick}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] text-white rounded-xl font-bold hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Create Task
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
          <input 
            type="text"
            placeholder="Search tasks..."
            className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <button className="p-3.5 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl text-[var(--text-dim)] hover:text-[var(--accent)] transition-all shadow-sm">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Grid */}
      {filteredTodos.length === 0 ? (
        <div className="bg-[var(--card-bg)] rounded-3xl border-2 border-dashed border-[var(--border)] p-16 text-center shadow-inner">
          <div className="bg-[var(--accent-bg)] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckSquare className="w-10 h-10 text-[var(--accent)]" />
          </div>
          <h3 className="text-xl font-bold text-[var(--text-h)] mb-2">No tasks found</h3>
          <p className="text-[var(--text-dim)] max-w-sm mx-auto">
            {searchTerm ? 'Try a different search term or clear the filter.' : "You're all caught up! Create a new task to get started."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTodos.map((todo) => (
            <TaskCard 
              key={todo.id}
              todo={todo}
              onToggle={onToggleStatus}
              onEdit={onEditClick}
              onDelete={onDeleteTask}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Internal helper component
const CheckSquare = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
)

export default TaskBoard
