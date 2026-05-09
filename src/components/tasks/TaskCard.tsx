import { 
  Clock, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Circle,
  MoreVertical
} from 'lucide-react'
import { ToDoListPublic, ToDoPriority, ToDoStatus } from '../../client/types.gen'

interface TaskCardProps {
  todo: ToDoListPublic
  onToggle: (todo: ToDoListPublic) => void
  onEdit: (todo: ToDoListPublic) => void
  onDelete: (id: string) => void
}

const TaskCard = ({ todo, onToggle, onEdit, onDelete }: TaskCardProps) => {
  const priorityColors = {
    high: 'bg-red-500/10 text-red-500 border-red-500/20',
    medium: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    low: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  }

  const isCompleted = todo.status === 'completed'

  return (
    <div className={`group bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5 transition-all hover:shadow-lg hover:border-[var(--accent)]/30 ${isCompleted ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-4">
        {/* Toggle Button */}
        <button 
          onClick={() => onToggle(todo)}
          className={`mt-1 flex-shrink-0 transition-all ${isCompleted ? 'text-[var(--accent)]' : 'text-[var(--text-dim)] hover:text-[var(--accent)]'}`}
        >
          {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className={`font-bold text-lg transition-all truncate ${isCompleted ? 'line-through text-[var(--text-dim)]' : 'text-[var(--text-h)]'}`}>
              {todo.title}
            </h3>
            <div className="flex gap-1 transition-all">
              <button 
                onClick={() => onEdit(todo)}
                className="p-1.5 text-[var(--text-dim)] hover:text-[var(--accent)] hover:bg-[var(--accent-bg)] rounded-lg transition-all"
                title="Edit Task"
                aria-label="Edit Task"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onDelete(todo.id)}
                className="p-1.5 text-[var(--text-dim)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                title="Delete Task"
                aria-label="Delete Task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p className={`text-sm mt-1 line-clamp-2 ${isCompleted ? 'text-[var(--text-dim)]/50' : 'text-[var(--text)]'}`}>
            {todo.description || 'No description provided.'}
          </p>

          <div className="flex flex-wrap gap-3 mt-4">
            <span className={`text-[10px] px-2 py-0.5 rounded-md uppercase font-black tracking-widest border ${priorityColors[todo.priority || 'medium']}`}>
              {todo.priority}
            </span>
            
            {todo.due_date_time && (
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider">
                <Clock className="w-3 h-3" />
                {new Date(todo.due_date_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </div>
            )}

            <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${isCompleted ? 'text-green-500' : 'text-blue-500'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`} />
              {todo.status}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskCard
