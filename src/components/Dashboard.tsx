import { useState, useEffect } from 'react'
import { 
    readTodosApiV1TodosGet, 
    createTodoApiV1TodosPost, 
    deleteTodoApiV1TodosIdDelete,
    getCurrentUserApiV1LoginCurrentUserGet,
    readUsersApiV1UsersGet,
    deleteUserApiV1UsersIdDelete,
    updateTodoApiV1TodosIdPatch,
    updateUserApiV1UsersIdPatch,
    createUserApiV1UsersPost
} from '../client/sdk.gen'
import { Link } from 'react-router-dom'
import { 
    type ToDoListPublic, 
    type ToDoPriority, 
    type ToDoStatus,
    type UserPublic,
} from '../client/types.gen'
import { auth } from '../lib/auth'

interface DashboardProps {
    onLogout: () => void
}

const Dashboard = ({ onLogout }: DashboardProps) => {
    const [currentUser, setCurrentUser] = useState<UserPublic | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    
    // User Dashboard State
    const [todos, setTodos] = useState<ToDoListPublic[]>([])
    const [isAddingTodo, setIsAddingTodo] = useState(false)

    // Admin Action State
    const [isCreatingAdmin, setIsCreatingAdmin] = useState(false)
    const [newAdminEmail, setNewAdminEmail] = useState('')
    const [newAdminPassword, setNewAdminPassword] = useState('')
    const [newAdminFullName, setNewAdminFullName] = useState('')
    const [isSubmittingAdmin, setIsSubmittingAdmin] = useState(false)
    const [adminCreateError, setAdminCreateError] = useState<string | null>(null)
    const [newTodoTitle, setNewTodoTitle] = useState('')
    const [newTodoDescription, setNewTodoDescription] = useState('')
    const [newTodoDueDate, setNewTodoDueDate] = useState('')
    const [newTodoPriority, setNewTodoPriority] = useState<ToDoPriority>('medium')
    const [newTodoStatus, setNewTodoStatus] = useState<ToDoStatus>('pending')
    const [taskSearchTerm, setTaskSearchTerm] = useState('')

    // Editing Task State
    const [editingTodoId, setEditingTodoId] = useState<string | null>(null)
    const [editTodoTitle, setEditTodoTitle] = useState('')
    const [editTodoDescription, setEditTodoDescription] = useState('')
    const [editTodoPriority, setEditTodoPriority] = useState<ToDoPriority>('medium')
    const [editTodoStatus, setEditTodoStatus] = useState<ToDoStatus>('pending')
    const [editTodoDueDate, setEditTodoDueDate] = useState('')
    const [isUpdatingTodo, setIsUpdatingTodo] = useState(false)

    // Admin Dashboard State
    const [users, setUsers] = useState<UserPublic[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [roleFilter, setRoleFilter] = useState<string>('all')

    useEffect(() => {
        fetchInitialData()
    }, [])

    const fetchInitialData = async () => {
        try {
            setIsLoading(true)
            const userResponse = await getCurrentUserApiV1LoginCurrentUserGet()
            
            if (userResponse.data) {
                setCurrentUser(userResponse.data)

                if (userResponse.data.role === 'admin') {
                    await fetchUsers()
                } else {
                    await fetchTodos()
                }
            }
        } catch (error) {
            console.error('Failed to initialize dashboard:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchUsers = async () => {
        try {
            const response = await readUsersApiV1UsersGet()
            if (response.data && response.data.data) {
                setUsers(response.data.data)
            }
        } catch (error) {
            console.error('Failed to fetch users:', error)
        }
    }

    const fetchTodos = async () => {
        try {
            const response = await readTodosApiV1TodosGet()
            if (response.data && response.data.data) {
                setTodos(response.data.data)
            }
        } catch (error) {
            console.error('Failed to fetch todos:', error)
        }
    }

    // --- User Actions ---
    const handleAddTodo = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            setIsAddingTodo(true)
            await createTodoApiV1TodosPost({
                body: {
                    title: newTodoTitle,
                    description: newTodoDescription,
                    due_date_time: newTodoDueDate || null,
                    priority: newTodoPriority,
                    status: newTodoStatus
                }
            })
            setNewTodoTitle('')
            setNewTodoDescription('')
            setNewTodoDueDate('')
            setNewTodoPriority('medium')
            setNewTodoStatus('pending')
            await fetchTodos()
        } catch (error) {
            console.error('Failed to add todo:', error)
        } finally {
            setIsAddingTodo(false)
        }
    }

    const handleDeleteTodo = async (id: string) => {
        try {
            await deleteTodoApiV1TodosIdDelete({ path: { id } })
            await fetchTodos()
        } catch (error) {
            console.error('Failed to delete todo:', error)
        }
    }

    const handleToggleTodoStatus = async (todo: ToDoListPublic) => {
        const nextStatus: ToDoStatus = todo.status === 'completed' ? 'pending' : 'completed'
        try {
            await updateTodoApiV1TodosIdPatch({
                path: { id: todo.id },
                body: { status: nextStatus }
            })
            await fetchTodos()
        } catch (error) {
            console.error('Failed to update todo status:', error)
        }
    }

    const handleEditClick = (todo: ToDoListPublic) => {
        setEditingTodoId(todo.id)
        setEditTodoTitle(todo.title)
        setEditTodoDescription(todo.description || '')
        setEditTodoPriority(todo.priority || 'medium')
        setEditTodoStatus(todo.status || 'pending')
        setEditTodoDueDate(todo.due_date_time ? todo.due_date_time.slice(0, 16) : '')
    }

    const handleCancelEdit = () => {
        setEditingTodoId(null)
    }

    const handleUpdateTodo = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingTodoId) return

        try {
            setIsUpdatingTodo(true)
            await updateTodoApiV1TodosIdPatch({
                path: { id: editingTodoId },
                body: {
                    title: editTodoTitle,
                    description: editTodoDescription,
                    priority: editTodoPriority,
                    status: editTodoStatus,
                    due_date_time: editTodoDueDate || null
                }
            })
            setEditingTodoId(null)
            await fetchTodos()
        } catch (error) {
            console.error('Failed to update todo:', error)
        } finally {
            setIsUpdatingTodo(false)
        }
    }

    // --- Admin Actions ---
    const handleDeleteUser = async (user: UserPublic) => {
        if (user.id === currentUser?.id) {
            alert("You cannot delete yourself!")
            return
        }
        if (user.role === 'admin') {
            alert("You cannot delete another admin!")
            return
        }
        if (!window.confirm(`Are you sure you want to delete user ${user.email}?`)) return
        
        try {
            await deleteUserApiV1UsersIdDelete({ path: { id: user.id } })
            await fetchUsers()
        } catch (error) {
            console.error('Failed to delete user:', error)
        }
    }

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault()
        setAdminCreateError(null)
        try {
            setIsSubmittingAdmin(true)
            await createUserApiV1UsersPost({
                body: {
                    email: newAdminEmail,
                    password: newAdminPassword,
                    full_name: newAdminFullName,
                    role: 'admin',
                    is_active: true
                }
            })
            await fetchUsers()
            setIsCreatingAdmin(false)
            setNewAdminEmail('')
            setNewAdminPassword('')
            setNewAdminFullName('')
        } catch (error: any) {
            console.error('Failed to create admin:', error)
            setAdminCreateError(error.body?.detail || "Failed to create admin. Please check your inputs.")
        } finally {
            setIsSubmittingAdmin(false)
        }
    }

    const handleToggleUserStatus = async (user: UserPublic) => {
        if (user.id === currentUser?.id) return // Don't deactivate yourself
        
        try {
            await updateUserApiV1UsersIdPatch({
                path: { id: user.id },
                // Cast to any because is_active might not be in the UserUpdate type
                body: { is_active: !user.is_active } as any
            })
            await fetchUsers()
        } catch (error) {
            console.error('Failed to toggle user status:', error)
        }
    }

    const handleLogoutClick = () => {
        auth.clearToken()
        onLogout()
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)]"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-8 bg-[var(--card-bg)] p-6 rounded-2xl border border-[var(--border)] shadow-sm">
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--text-h)]">
                            {currentUser?.role === 'admin' ? 'Admin Control Center' : 'My Task Dashboard'}
                        </h1>
                        <p className="text-[var(--text-dim)] mt-1">
                            Welcome back, <Link to="/profile" className="font-semibold text-[var(--accent)] hover:underline">{currentUser?.full_name || currentUser?.email}</Link>
                        </p>
                    </div>
                    <button 
                        onClick={handleLogoutClick}
                        className="px-6 py-2.5 bg-[var(--bg)] border border-[var(--border)] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 rounded-xl transition-all font-medium"
                    >
                        Logout
                    </button>
                </header>

                {currentUser?.role === 'admin' ? (
                    /* Admin View: User Management */
                    <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border)] shadow-lg overflow-hidden">
                        <div className="p-6 border-b border-[var(--border)] bg-[var(--accent-bg)] space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-xl font-bold">User Management</h2>
                                    <button 
                                        onClick={() => setIsCreatingAdmin(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-xl text-sm font-bold hover:shadow-lg transition-all"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add New Admin
                                    </button>
                                </div>
                                <div className="flex gap-4 items-center">
                                    <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm font-bold">
                                        {users.filter(u => u.is_active).length} Active
                                    </span>
                                    <span className="px-3 py-1 bg-[var(--accent)]/10 text-[var(--accent)] rounded-full text-sm font-bold">
                                        {users.length} Total
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input 
                                        type="text"
                                        placeholder="Search by name or email..."
                                        className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition-all text-sm"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <select 
                                        className="bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition-all text-sm font-medium"
                                        value={roleFilter}
                                        onChange={(e) => setRoleFilter(e.target.value)}
                                    >
                                        <option value="all">All Roles</option>
                                        <option value="admin">Admins Only</option>
                                        <option value="user">Users Only</option>
                                    </select>
                                </div>
                            </div>

                            {/* Create Admin Form */}
                            {isCreatingAdmin && (
                                <div className="mt-6 p-6 bg-[var(--bg)] rounded-2xl border border-[var(--border)] animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-bold text-lg">Create New Administrator</h3>
                                        <button 
                                            onClick={() => {
                                                setIsCreatingAdmin(false)
                                                setAdminCreateError(null)
                                            }}
                                            className="text-[var(--text-dim)] hover:text-[var(--text)]"
                                        >
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                    <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-[var(--text-dim)]">Full Name</label>
                                            <input 
                                                type="text"
                                                className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition-all text-sm"
                                                placeholder="e.g. John Doe"
                                                value={newAdminFullName}
                                                onChange={(e) => setNewAdminFullName(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="admin_email" className="block text-sm font-bold mb-2 text-[var(--text-dim)]">Admin Email</label>
                                            <input 
                                                id="admin_email"
                                                type="email"
                                                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition-all"
                                                placeholder="Admin Email"
                                                value={newAdminEmail}
                                                onChange={(e) => setNewAdminEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="admin_password" className="block text-sm font-bold mb-2 text-[var(--text-dim)]">Admin Password</label>
                                            <input 
                                                id="admin_password"
                                                type="password"
                                                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition-all"
                                                placeholder="Admin Password"
                                                value={newAdminPassword}
                                                onChange={(e) => setNewAdminPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                        {adminCreateError && (
                                            <div className="md:col-span-3 text-sm text-red-500 font-bold p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                                                {adminCreateError}
                                            </div>
                                        )}
                                        <div className="md:col-span-3 flex justify-end gap-4 mt-2">
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    setIsCreatingAdmin(false)
                                                    setAdminCreateError(null)
                                                }}
                                                className="px-6 py-2.5 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl font-bold hover:bg-[var(--accent-bg)] transition-all"
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                type="submit"
                                                disabled={isSubmittingAdmin}
                                                className="px-8 py-2.5 bg-[var(--accent)] text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
                                            >
                                                {isSubmittingAdmin ? 'Creating...' : 'Create Admin Account'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-[var(--bg)]/50 text-[var(--text-dim)] text-sm uppercase tracking-wider">
                                        <th className="px-6 py-4 font-semibold">User</th>
                                        <th className="px-6 py-4 font-semibold">Role</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                        <th className="px-6 py-4 font-semibold">Joined</th>
                                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border)]">
                                    {users
                                        .filter(user => {
                                            const matchesSearch = 
                                                user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                user.email.toLowerCase().includes(searchTerm.toLowerCase())
                                            const matchesRole = roleFilter === 'all' || user.role === roleFilter
                                            return matchesSearch && matchesRole
                                        }).length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-dim)]">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <svg className="w-10 h-10 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                        </svg>
                                                        <p className="font-medium text-lg">No users found</p>
                                                        <p className="text-sm">Try adjusting your search or filter</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            users
                                                .filter(user => {
                                                    const matchesSearch = 
                                                        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                        user.email.toLowerCase().includes(searchTerm.toLowerCase())
                                                    const matchesRole = roleFilter === 'all' || user.role === roleFilter
                                                    return matchesSearch && matchesRole
                                                })
                                                .map((user) => (
                                                 <tr key={user.id} className="hover:bg-[var(--bg)]/30 transition-colors">
                                                     <td className="px-6 py-4">
                                                         <div className="flex flex-col">
                                                             <span className="font-semibold text-[var(--text-h)]">{user.full_name || 'Anonymous'}</span>
                                                             <span className="text-sm text-[var(--text-dim)]">{user.email}</span>
                                                         </div>
                                                     </td>
                                                     <td className="px-6 py-4">
                                                         <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                                                             user.role === 'admin' 
                                                                 ? 'bg-purple-500/10 text-purple-500' 
                                                                 : 'bg-blue-500/10 text-blue-500'
                                                         }`}>
                                                             {user.role}
                                                         </span>
                                                     </td>
                                                     <td className="px-6 py-4">
                                                         <button 
                                                             onClick={() => handleToggleUserStatus(user)}
                                                             disabled={user.id === currentUser?.id}
                                                             className={`flex items-center gap-2 group px-2 py-1 rounded-lg transition-all ${
                                                                 user.id === currentUser?.id 
                                                                     ? 'cursor-default' 
                                                                     : 'hover:bg-[var(--bg)]'
                                                             }`}
                                                             title={user.id === currentUser?.id ? "You cannot deactivate your own account" : `Click to ${user.is_active ? 'deactivate' : 'activate'} user`}
                                                         >
                                                             <div className={`w-2 h-2 rounded-full transition-all ${
                                                                 user.is_active 
                                                                     ? 'bg-green-500 group-hover:shadow-[0_0_8px_rgba(34,197,94,0.5)]' 
                                                                     : 'bg-red-500 group-hover:shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                                                             }`}></div>
                                                             <span className={`text-sm font-medium transition-colors ${
                                                                 user.is_active ? 'text-green-500' : 'text-red-500'
                                                             }`}>
                                                                 {user.is_active ? 'Active' : 'Inactive'}
                                                             </span>
                                                             {user.id !== currentUser?.id && (
                                                                 <svg className="w-3 h-3 text-[var(--text-dim)] opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                                                 </svg>
                                                             )}
                                                         </button>
                                                     </td>
                                                     <td className="px-6 py-4 text-sm text-[var(--text-dim)]">
                                                         {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                                     </td>
                                                     <td className="px-6 py-4 text-right">
                                                         <button 
                                                             onClick={() => handleDeleteUser(user)}
                                                             disabled={user.id === currentUser?.id || user.role === 'admin'}
                                                             className="p-2 text-[var(--text-dim)] hover:text-red-500 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                                                             title={user.role === 'admin' ? "Admins cannot be deleted" : "Delete user"}
                                                         >
                                                             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                             </svg>
                                                         </button>
                                                     </td>
                                                 </tr>
                                             ))
                                        )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    /* User View: Todo List */
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Sidebar: Add Todo */}
                        <div className="lg:col-span-1">
                            {/* Add Todo Section */}
                            <div className="bg-[var(--card-bg)] rounded-2xl shadow-lg border border-[var(--border)] overflow-hidden sticky top-8">
                                <div className="p-4 bg-[var(--accent-bg)] border-b border-[var(--border)]">
                                    <h2 className="font-bold text-lg flex items-center gap-2">
                                        <svg className="w-5 h-5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Create New Task
                                    </h2>
                                </div>
                                <form onSubmit={handleAddTodo} className="p-6 flex flex-col gap-5">
                                    <div>
                                        <label htmlFor="task_title" className="block text-sm font-semibold mb-1.5 text-[var(--text-dim)]">Title</label>
                                        <input 
                                            id="task_title"
                                            type="text"
                                            placeholder="What needs to be done?"
                                            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition-all"
                                            value={newTodoTitle}
                                            onChange={(e) => setNewTodoTitle(e.target.value)}
                                            required
                                        />
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="task_description" className="block text-sm font-semibold mb-1.5 text-[var(--text-dim)]">Description</label>
                                        <textarea
                                            id="task_description"
                                            placeholder="Add more details..."
                                            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition-all"
                                            value={newTodoDescription}
                                            onChange={(e) => setNewTodoDescription(e.target.value)}
                                        ></textarea>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="task_priority" className="block text-sm font-semibold mb-1.5 text-[var(--text-dim)]">Priority</label>
                                            <select
                                                id="task_priority"
                                                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition-all"
                                                value={newTodoPriority}
                                                onChange={(e) => setNewTodoPriority(e.target.value as ToDoPriority)}
                                            >
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="task_status" className="block text-sm font-semibold mb-1.5 text-[var(--text-dim)]">Status</label>
                                            <select
                                                id="task_status"
                                                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition-all"
                                                value={newTodoStatus}
                                                onChange={(e) => setNewTodoStatus(e.target.value as ToDoStatus)}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="in progress">In Progress</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="task_due_date" className="block text-sm font-semibold mb-1.5 text-[var(--text-dim)]">Due Date</label>
                                        <input
                                            id="task_due_date"
                                            type="datetime-local"
                                            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition-all"
                                            value={newTodoDueDate}
                                            onChange={(e) => setNewTodoDueDate(e.target.value)}
                                        />
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={isAddingTodo}
                                        className="w-full bg-[var(--accent)] text-white py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-[var(--accent)]/20 active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
                                    >
                                        {isAddingTodo ? 'Creating...' : 'Create Task'}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Todos List Section */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Task Search Bar */}
                            <div className="relative">
                                <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input 
                                    type="text"
                                    placeholder="Search tasks by title or description..."
                                    className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 shadow-sm transition-all"
                                    value={taskSearchTerm}
                                    onChange={(e) => setTaskSearchTerm(e.target.value)}
                                />
                            </div>

                            {todos.filter(todo => 
                                todo.title.toLowerCase().includes(taskSearchTerm.toLowerCase()) ||
                                todo.description?.toLowerCase().includes(taskSearchTerm.toLowerCase())
                            ).length === 0 ? (
                                <div className="bg-[var(--card-bg)] rounded-2xl border-2 border-dashed border-[var(--border)] p-16 text-center shadow-inner">
                                    <div className="bg-[var(--accent)]/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <svg className="w-10 h-10 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-[var(--text-h)] mb-2">
                                        {taskSearchTerm ? 'No matching tasks found' : 'No active tasks'}
                                    </h3>
                                    <p className="text-[var(--text-dim)] max-w-sm mx-auto">
                                        {taskSearchTerm ? 'Try a different search term or clear the search.' : "Get organized by adding your first task. It's time to be productive!"}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {todos
                                        .filter(todo => 
                                            todo.title.toLowerCase().includes(taskSearchTerm.toLowerCase()) ||
                                            todo.description?.toLowerCase().includes(taskSearchTerm.toLowerCase())
                                        )
                                        .map((todo) => (
                                        <div 
                                            key={todo.id} 
                                            className={`group bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6 transition-all hover:border-[var(--accent)]/50 hover:shadow-xl ${todo.status === 'completed' && editingTodoId !== todo.id ? 'opacity-70' : ''}`}
                                        >
                                            {editingTodoId === todo.id ? (
                                                <form onSubmit={handleUpdateTodo} className="space-y-4">
                                                    <div className="flex gap-4 items-start">
                                                        <div className="flex-1 space-y-4">
                                                            <div>
                                                                <label htmlFor={`edit_title_${todo.id}`} className="block text-xs font-bold uppercase tracking-wider text-[var(--text-dim)] mb-1.5">Title</label>
                                                                <input 
                                                                    id={`edit_title_${todo.id}`}
                                                                    type="text"
                                                                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition-all font-bold"
                                                                    value={editTodoTitle}
                                                                    onChange={(e) => setEditTodoTitle(e.target.value)}
                                                                    required
                                                                />
                                                            </div>
                                                            <div>
                                                                <label htmlFor={`edit_desc_${todo.id}`} className="block text-xs font-bold uppercase tracking-wider text-[var(--text-dim)] mb-1.5">Description</label>
                                                                <textarea
                                                                    id={`edit_desc_${todo.id}`}
                                                                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition-all text-sm min-h-[80px]"
                                                                    value={editTodoDescription}
                                                                    onChange={(e) => setEditTodoDescription(e.target.value)}
                                                                ></textarea>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                <div>
                                                                    <label htmlFor={`edit_priority_${todo.id}`} className="block text-xs font-bold uppercase tracking-wider text-[var(--text-dim)] mb-1.5">Priority</label>
                                                                    <select
                                                                        id={`edit_priority_${todo.id}`}
                                                                        className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition-all text-sm"
                                                                        value={editTodoPriority}
                                                                        onChange={(e) => setEditTodoPriority(e.target.value as ToDoPriority)}
                                                                    >
                                                                        <option value="low">Low</option>
                                                                        <option value="medium">Medium</option>
                                                                        <option value="high">High</option>
                                                                    </select>
                                                                </div>
                                                                <div>
                                                                    <label htmlFor={`edit_status_${todo.id}`} className="block text-xs font-bold uppercase tracking-wider text-[var(--text-dim)] mb-1.5">Status</label>
                                                                    <select
                                                                        id={`edit_status_${todo.id}`}
                                                                        className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition-all text-sm"
                                                                        value={editTodoStatus}
                                                                        onChange={(e) => setEditTodoStatus(e.target.value as ToDoStatus)}
                                                                    >
                                                                        <option value="pending">Pending</option>
                                                                        <option value="in progress">In Progress</option>
                                                                        <option value="completed">Completed</option>
                                                                    </select>
                                                                </div>
                                                                <div>
                                                                    <label htmlFor={`edit_due_date_${todo.id}`} className="block text-xs font-bold uppercase tracking-wider text-[var(--text-dim)] mb-1.5">Due Date</label>
                                                                    <input
                                                                        id={`edit_due_date_${todo.id}`}
                                                                        type="datetime-local"
                                                                        className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition-all text-sm"
                                                                        value={editTodoDueDate}
                                                                        onChange={(e) => setEditTodoDueDate(e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-3 pt-2">
                                                                <button 
                                                                    type="submit"
                                                                    disabled={isUpdatingTodo}
                                                                    className="flex-1 bg-[var(--accent)] text-white py-2.5 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
                                                                >
                                                                    {isUpdatingTodo ? 'Updating...' : 'Update Task'}
                                                                </button>
                                                                <button 
                                                                    type="button"
                                                                    onClick={handleCancelEdit}
                                                                    disabled={isUpdatingTodo}
                                                                    className="flex-1 bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] py-2.5 rounded-xl font-bold hover:bg-[var(--accent-bg)] transition-all"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </form>
                                            ) : (
                                                <div className="flex items-start gap-5">
                                                    <button 
                                                        onClick={() => handleToggleTodoStatus(todo)}
                                                        className={`mt-1 flex-shrink-0 w-7 h-7 rounded-xl border-2 transition-all flex items-center justify-center ${
                                                            todo.status === 'completed' 
                                                                ? 'bg-[var(--accent)] border-[var(--accent)] shadow-lg shadow-[var(--accent)]/30' 
                                                                : 'border-[var(--border)] group-hover:border-[var(--accent)]'
                                                        }`}
                                                    >
                                                        {todo.status === 'completed' && (
                                                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                    
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div>
                                                                <h3 className={`text-xl font-bold transition-all ${todo.status === 'completed' ? 'line-through text-[var(--text-dim)]' : 'text-[var(--text-h)]'}`}>
                                                                    {todo.title}
                                                                </h3>
                                                                <div className="flex flex-wrap gap-3 mt-2">
                                                                    <span className={`text-[10px] px-2 py-0.5 rounded-md uppercase font-black tracking-widest border ${
                                                                        todo.priority === 'high' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                                        todo.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                                        'bg-green-500/10 text-green-500 border-green-500/20'
                                                                    }`}>
                                                                        {todo.priority}
                                                                    </span>
                                                                    <span className="text-[10px] px-2 py-0.5 rounded-md uppercase font-black tracking-widest border bg-[var(--bg)] border-[var(--border)] text-[var(--text-dim)]">
                                                                        {todo.status}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                                <button 
                                                                    onClick={() => handleEditClick(todo)}
                                                                    className="p-2 text-[var(--text-dim)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 rounded-lg transition-all"
                                                                    title="Edit task"
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                                                                    </svg>
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDeleteTodo(todo.id)}
                                                                    className="p-2 text-[var(--text-dim)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                                    title="Delete task"
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                        {todo.description && (
                                                            <p className={`text-[var(--text-dim)] leading-relaxed mb-4 ${todo.status === 'completed' ? 'line-through' : ''}`}>
                                                                {todo.description}
                                                            </p>
                                                        )}
                                                        {todo.due_date_time && (
                                                            <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-dim)] bg-[var(--bg)] w-fit px-3 py-1.5 rounded-lg border border-[var(--border)]">
                                                                <svg className="w-4 h-4 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                                <span>{new Date(todo.due_date_time).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Dashboard