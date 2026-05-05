import React, { useEffect, useState } from 'react';
import { 
    getCurrentUserApiV1LoginCurrentUserGet, 
    readTodosApiV1TodosGet,
    createTodoApiV1TodosPost,
    updateTodoApiV1TodosIdPatch,
    deleteTodoApiV1TodosIdDelete,
    readUsersApiV1UsersGet,
    createUserApiV1UsersPost,
    deleteUserApiV1UsersIdDelete,
    type UserPublic, 
    type ToDoListPublic,
} from '../client';
import { auth } from '../lib/auth';

interface DashboardProps {
    onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
    const [user, setUser] = useState<UserPublic | null>(null);
    const [todos, setTodos] = useState<ToDoListPublic[]>([]);
    const [users, setUsers] = useState<UserPublic[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Form state for new todo
    const [newTodoTitle, setNewTodoTitle] = useState('');
    const [isAddingTodo, setIsAddingTodo] = useState(false);

    // Form state for new user
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [isAddingUser, setIsAddingUser] = useState(false);

    // State for editing user
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editFullName, setEditFullName] = useState('');
    const [isUpdatingUser, setIsUpdatingUser] = useState(false);

    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [userRes, todosRes] = await Promise.all([
                    getCurrentUserApiV1LoginCurrentUserGet(),
                    readTodosApiV1TodosGet()
                ]);

                if (userRes.error) {
                    auth.clearToken();
                    onLogout();
                    return;
                }

                if (userRes.data) {
                    setUser(userRes.data);
                    // If user is admin, fetch all users
                    if (userRes.data.role === 'admin') {
                        const usersRes = await readUsersApiV1UsersGet();
                        if (usersRes.data) {
                            setUsers(usersRes.data.data);
                        }
                    }
                }
                if (todosRes.data) setTodos(todosRes.data.data);
                
            } catch (err) {
                setError('Failed to load dashboard data.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, [onLogout]);

    const handleLogout = () => {
        auth.clearToken();
        onLogout();
    };

    // Todo handlers
    const handleAddTodo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTodoTitle.trim()) return;

        setIsAddingTodo(true);
        try {
            const { data, error: apiError } = await createTodoApiV1TodosPost({
                body: { title: newTodoTitle }
            });

            if (apiError) {
                alert('Failed to add task.');
            } else if (data) {
                setTodos([data, ...todos]);
                setNewTodoTitle('');
            }
        } catch (err) {
            alert('An error occurred while adding the task.');
        } finally {
            setIsAddingTodo(false);
        }
    };

    const handleToggleTodo = async (todo: ToDoListPublic) => {
        const newStatus = todo.status === 'completed' ? 'pending' : 'completed';
        try {
            const { data, error: apiError } = await updateTodoApiV1TodosIdPatch({
                path: { id: todo.id },
                body: { status: newStatus }
            });

            if (!apiError && data) {
                setTodos(todos.map(t => t.id === todo.id ? data : t));
            }
        } catch (err) {
            console.error('Failed to update todo status', err);
        }
    };

    const handleDeleteTodo = async (id: string) => {
        if (!confirm('Are you sure you want to delete this task?')) return;

        try {
            const { error: apiError } = await deleteTodoApiV1TodosIdDelete({
                path: { id }
            });

            if (!apiError) {
                setTodos(todos.filter(t => t.id !== id));
            }
        } catch (err) {
            alert('Failed to delete task.');
        }
    };

    // User management handlers
    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUserEmail.trim() || !newUserPassword.trim()) return;

        setIsAddingUser(true);
        try {
            const { data, error: apiError } = await createUserApiV1UsersPost({
                body: { 
                    email: newUserEmail, 
                    password: newUserPassword,
                    role: 'user'
                }
            });

            if (apiError) {
                alert((apiError as any).detail || 'Failed to create user.');
            } else if (data) {
                setUsers([data, ...users]);
                setNewUserEmail('');
                setNewUserPassword('');
                alert('User created successfully!');
            }
        } catch (err) {
            alert('An error occurred while creating the user.');
        } finally {
            setIsAddingUser(false);
        }
    };

    const handleUpdateUser = async (id: string) => {
        setIsUpdatingUser(true);
        try {
            const { data, error: apiError } = await updateUserApiV1UsersIdPatch({
                path: { id },
                body: { full_name: editFullName }
            });

            if (!apiError && data) {
                setUsers(users.map(u => u.id === id ? data : u));
                setEditingUserId(null);
                setEditFullName('');
            } else {
                alert('Failed to update user.');
            }
        } catch (err) {
            alert('An error occurred while updating the user.');
        } finally {
            setIsUpdatingUser(false);
        }
    };

    const startEditingUser = (u: UserPublic) => {
        setEditingUserId(u.id);
        setEditFullName(u.full_name || '');
    };

    const handleDeleteUser = async (id: string) => {
        if (id === user?.id) {
            alert('You cannot delete your own account.');
            return;
        }
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            const { error: apiError } = await deleteUserApiV1UsersIdDelete({
                path: { id }
            });

            if (!apiError) {
                setUsers(users.filter(u => u.id !== id));
            } else {
                alert('Failed to delete user.');
            }
        } catch (err) {
            alert('An error occurred while deleting the user.');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)]"></div>
            </div>
        );
    }

    const stats = {
        total: todos.length,
        completed: todos.filter(t => t.status === 'completed').length,
        pending: todos.filter(t => t.status !== 'completed').length,
        users: users.length,
    };

    return (
        <div className="min-h-screen bg-[var(--bg)]">
            {/* Navigation */}
            <nav className="sticky top-0 z-10 bg-[var(--bg)] border-b border-[var(--border)] shadow-[var(--shadow)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <span className="text-xl font-bold text-[var(--accent)]">FastAPI Dashboard</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex flex-col items-end mr-2">
                                <span className="hidden sm:block text-sm font-bold text-[var(--text-h)]">{user?.full_name || user?.email}</span>
                                <span className="hidden sm:block text-[10px] uppercase tracking-tighter text-[var(--accent)] font-bold">{user?.role}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-[var(--bg)] border border-[var(--border)] rounded-md py-1.5 px-3 text-sm font-medium text-[var(--text)] hover:bg-[var(--accent-bg)] transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-extrabold text-[var(--text-h)]">
                        Welcome back, {user?.full_name || user?.email?.split('@')[0]}!
                    </h1>
                    <p className="mt-1 text-[var(--text)]">Here's an overview of your account and tasks.</p>
                </div>

                {/* Stats Row */}
                <div className={`grid grid-cols-1 ${isAdmin ? 'sm:grid-cols-4' : 'sm:grid-cols-3'} gap-6`}>
                    <div className="bg-[var(--bg)] p-6 rounded-xl border border-[var(--border)] shadow-[var(--shadow)]">
                        <p className="text-sm font-medium text-[var(--text)] uppercase tracking-wider">Total Tasks</p>
                        <p className="mt-2 text-3xl font-bold text-[var(--text-h)]">{stats.total}</p>
                    </div>
                    <div className="bg-[var(--bg)] p-6 rounded-xl border border-[var(--border)] shadow-[var(--shadow)]">
                        <p className="text-sm font-medium text-[var(--text)] uppercase tracking-wider">Pending</p>
                        <p className="mt-2 text-3xl font-bold text-orange-500">{stats.pending}</p>
                    </div>
                    <div className="bg-[var(--bg)] p-6 rounded-xl border border-[var(--border)] shadow-[var(--shadow)]">
                        <p className="text-sm font-medium text-[var(--text)] uppercase tracking-wider">Completed</p>
                        <p className="mt-2 text-3xl font-bold text-green-500">{stats.completed}</p>
                    </div>
                    {isAdmin && (
                        <div className="bg-[var(--bg)] p-6 rounded-xl border border-[var(--border)] shadow-[var(--shadow)]">
                            <p className="text-sm font-medium text-[var(--text)] uppercase tracking-wider">Total Users</p>
                            <p className="mt-2 text-3xl font-bold text-[var(--accent)]">{stats.users}</p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Task Manager & User Management (if admin) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Task Manager Section */}
                        <div className="bg-[var(--bg)] rounded-xl border border-[var(--border)] shadow-[var(--shadow)] overflow-hidden">
                            <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
                                <h2 className="text-xl font-bold text-[var(--text-h)]">Your Tasks</h2>
                                <span className="text-sm text-[var(--text)]">{todos.length} items</span>
                            </div>
                            
                            {/* Add Todo Form */}
                            <form onSubmit={handleAddTodo} className="p-6 bg-[var(--accent-bg)] flex gap-4 border-b border-[var(--border)]">
                                <input 
                                    type="text"
                                    placeholder="What needs to be done?"
                                    className="flex-1 bg-[var(--bg)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-h)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                                    value={newTodoTitle}
                                    onChange={(e) => setNewTodoTitle(e.target.value)}
                                    disabled={isAddingTodo}
                                />
                                <button 
                                    type="submit"
                                    disabled={isAddingTodo || !newTodoTitle.trim()}
                                    className="bg-[var(--accent)] text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {isAddingTodo ? 'Adding...' : 'Add'}
                                </button>
                            </form>

                            {/* Todo List */}
                            <div className="divide-y divide-[var(--border)] max-h-[400px] overflow-y-auto">
                                {todos.length === 0 ? (
                                    <div className="p-12 text-center text-[var(--text)]">
                                        <p>No tasks yet. Add one above to get started!</p>
                                    </div>
                                ) : (
                                    todos.map((todo) => (
                                        <div key={todo.id} className="p-4 flex items-center justify-between hover:bg-[var(--accent-bg)] transition-colors group">
                                            <div className="flex items-center space-x-4">
                                                <button 
                                                    onClick={() => handleToggleTodo(todo)}
                                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                                        todo.status === 'completed' 
                                                        ? 'bg-green-500 border-green-500 text-white' 
                                                        : 'border-[var(--border)]'
                                                    }`}
                                                >
                                                    {todo.status === 'completed' && (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </button>
                                                <span className={`text-[var(--text-h)] ${todo.status === 'completed' ? 'line-through opacity-50' : ''}`}>
                                                    {todo.title}
                                                </span>
                                            </div>
                                            <button 
                                                onClick={() => handleDeleteTodo(todo.id)}
                                                className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* User Management Section (Admin Only) */}
                        {isAdmin && (
                            <div className="bg-[var(--bg)] rounded-xl border border-[var(--border)] shadow-[var(--shadow)] overflow-hidden">
                                <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg)]">
                                    <h2 className="text-xl font-bold text-[var(--text-h)]">User Management</h2>
                                    <span className="text-sm text-[var(--text)]">{users.length} users</span>
                                </div>
                                
                                {/* Add User Form */}
                                <form onSubmit={handleAddUser} className="p-6 bg-[var(--accent-bg)] flex flex-wrap gap-4 border-b border-[var(--border)]">
                                    <input 
                                        type="email"
                                        placeholder="User Email"
                                        className="flex-1 min-w-[200px] bg-[var(--bg)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-h)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                                        value={newUserEmail}
                                        onChange={(e) => setNewUserEmail(e.target.value)}
                                        disabled={isAddingUser}
                                        required
                                    />
                                    <input 
                                        type="password"
                                        placeholder="Initial Password"
                                        className="flex-1 min-w-[200px] bg-[var(--bg)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text-h)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                                        value={newUserPassword}
                                        onChange={(e) => setNewUserPassword(e.target.value)}
                                        disabled={isAddingUser}
                                        required
                                    />
                                    <button 
                                        type="submit"
                                        disabled={isAddingUser}
                                        className="bg-[var(--accent)] text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                                    >
                                        {isAddingUser ? 'Creating...' : 'Create User'}
                                    </button>
                                </form>

                                {/* User List */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-[var(--bg)] border-b border-[var(--border)]">
                                            <tr>
                                                <th className="px-6 py-3 text-xs font-bold text-[var(--text)] uppercase tracking-wider">Email</th>
                                                <th className="px-6 py-3 text-xs font-bold text-[var(--text)] uppercase tracking-wider">Full Name</th>
                                                <th className="px-6 py-3 text-xs font-bold text-[var(--text)] uppercase tracking-wider">Role</th>
                                                <th className="px-6 py-3 text-xs font-bold text-[var(--text)] uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-xs font-bold text-[var(--text)] uppercase tracking-wider text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--border)]">
                                            {users.map((u) => (
                                                <tr key={u.id} className="hover:bg-[var(--accent-bg)] transition-colors">
                                                    <td className="px-6 py-4 text-sm text-[var(--text-h)]">{u.email}</td>
                                                    <td className="px-6 py-4 text-sm text-[var(--text-h)]">
                                                        {editingUserId === u.id ? (
                                                            <input 
                                                                type="text"
                                                                className="bg-[var(--bg)] border border-[var(--border)] rounded px-2 py-1 text-sm focus:ring-1 focus:ring-[var(--accent)] outline-none w-full"
                                                                value={editFullName}
                                                                onChange={(e) => setEditFullName(e.target.value)}
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            u.full_name || '-'
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-[var(--text)] capitalize">{u.role}</td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                            {u.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-right space-x-2">
                                                        {editingUserId === u.id ? (
                                                            <>
                                                                <button 
                                                                    onClick={() => handleUpdateUser(u.id)}
                                                                    disabled={isUpdatingUser}
                                                                    className="text-green-500 hover:text-green-600 font-bold text-xs uppercase"
                                                                >
                                                                    Save
                                                                </button>
                                                                <button 
                                                                    onClick={() => setEditingUserId(null)}
                                                                    className="text-[var(--text)] hover:text-[var(--text-h)] font-bold text-xs uppercase"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button 
                                                                    onClick={() => startEditingUser(u)}
                                                                    className="text-indigo-400 hover:text-indigo-600 p-1"
                                                                    title="Edit User"
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                    </svg>
                                                                </button>
                                                                {u.id !== user?.id && (
                                                                    <button 
                                                                        onClick={() => handleDeleteUser(u.id)}
                                                                        className="text-red-400 hover:text-red-600 p-1"
                                                                        title="Delete User"
                                                                    >
                                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                        </svg>
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Profile Section */}
                    <div className="space-y-6">
                        <div className="bg-[var(--bg)] p-6 rounded-xl border border-[var(--border)] shadow-[var(--shadow)]">
                            <h2 className="text-xl font-bold text-[var(--text-h)] mb-4 border-b border-[var(--border)] pb-2">Profile Details</h2>
                            <dl className="space-y-4">
                                <div>
                                    <dt className="text-xs font-medium text-[var(--text)] uppercase tracking-wider">Full Name</dt>
                                    <dd className="mt-1 text-sm text-[var(--text-h)] font-medium">{user?.full_name || 'N/A'}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium text-[var(--text)] uppercase tracking-wider">Email Address</dt>
                                    <dd className="mt-1 text-sm text-[var(--text-h)] font-medium">{user?.email}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium text-[var(--text)] uppercase tracking-wider">Account Role</dt>
                                    <dd className="mt-1 text-sm text-[var(--text-h)] font-medium capitalize flex items-center gap-2">
                                        {user?.role}
                                        {isAdmin && (
                                            <span className="bg-[var(--accent)] text-white text-[8px] px-1.5 py-0.5 rounded font-black uppercase">Admin</span>
                                        )}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium text-[var(--text)] uppercase tracking-wider">Status</dt>
                                    <dd className="mt-1">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user?.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                            {user?.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {isAdmin ? (
                            <div className="bg-[var(--accent-bg)] p-6 rounded-xl border border-[var(--accent-border)] border-dashed">
                                <h3 className="text-sm font-bold text-[var(--accent)] mb-2 uppercase tracking-tighter">Admin Panel</h3>
                                <ul className="text-xs text-[var(--text)] space-y-2">
                                    <li>• Create new user accounts</li>
                                    <li>• Monitor system-wide users</li>
                                    <li>• Delete inactive or problematic users</li>
                                    <li>• Security: You cannot delete your own account</li>
                                </ul>
                            </div>
                        ) : (
                            <div className="bg-[var(--accent-bg)] p-6 rounded-xl border border-[var(--accent-border)] border-dashed">
                                <h3 className="text-sm font-bold text-[var(--accent)] mb-2 uppercase">Quick Tips</h3>
                                <ul className="text-xs text-[var(--text)] space-y-2">
                                    <li>• Click the circle to complete a task</li>
                                    <li>• Hover over a task to see the delete icon</li>
                                    <li>• Stats update automatically when you modify tasks</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
