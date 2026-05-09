import { useState, useEffect } from 'react'
import { Search, UserMinus, UserCheck, Shield, Mail, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { UserPublic } from '../../client/types.gen'
import { readUsersApiV1UsersGet } from '../../client/sdk.gen'
import { Role, useAuth } from '../../contexts/AuthContext'

interface AdminUserTableProps {
  currentUser: UserPublic | null
  onToggleStatus: (user: UserPublic) => Promise<void>
  onDeleteUser: (user: UserPublic) => Promise<void>
}

const AdminUserTable = ({ currentUser, onToggleStatus, onDeleteUser }: AdminUserTableProps) => {
  const { role: currentUserRole } = useAuth()
  const [users, setUsers] = useState<UserPublic[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [currentPage])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await readUsersApiV1UsersGet({
        query: { page: currentPage, size: pageSize }
      })
      // Supporting both {items, total} and {data, count}
      if (response.data) {
        const data = (response.data as any).data || (response.data as any).items || []
        const count = (response.data as any).count || (response.data as any).total || 0
        setUsers(data)
        setTotalUsers(count)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const canManageUser = (targetUser: UserPublic) => {
    if (currentUserRole === Role.SUPER) return true
    if (currentUserRole === Role.ADMIN) {
      // ADMIN can only manage regular USERs, and themselves (partially)
      // Hide or disable actions for any account where role === 'SUPER' or role === 'ADMIN' (except their own)
      const targetRole = targetUser.role?.toUpperCase()
      if (targetUser.id === currentUser?.id) return true
      if (targetRole === Role.SUPER || targetRole === Role.ADMIN) return false
      return true
    }
    return false
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Role filtering
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    
    // Visibility restriction: ADMINs should not see SUPER users, 
    // and no one should see themselves in the management list
    if (user.id === currentUser?.id) return false;
    
    if (currentUserRole === Role.ADMIN) {
      const targetRole = user.role?.toUpperCase()
      if (targetRole === Role.SUPER) return false
    }
    
    return matchesSearch && matchesRole
  })

  return (
    <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
      {/* Table Header / Controls */}
      <div className="p-6 border-b border-[var(--border)] space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-xl font-bold text-[var(--text-h)]">User Directory</h2>
          <div className="flex gap-4 items-center">
            <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold">
              {filteredUsers.filter(u => u.is_active).length} Active
            </span>
            <span className="px-3 py-1 bg-[var(--accent)]/10 text-[var(--accent)] rounded-full text-xs font-bold">
              {filteredUsers.length} Visible
            </span>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
            <input 
              type="text"
              placeholder="Search by name or email..."
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition-all text-sm font-medium"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            {currentUserRole === Role.SUPER && <option value="super">Super Admins</option>}
            <option value="admin">Admins</option>
            <option value="user">Users</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[var(--sidebar-bg)] text-[var(--text-dim)] text-xs uppercase tracking-widest font-black">
              <th className="px-6 py-4">User Details</th>
              <th className="px-6 py-4">Security Role</th>
              <th className="px-6 py-4">System Status</th>
              <th className="px-6 py-4">Registration</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)] mx-auto"></div>
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-dim)]">
                  <p className="font-medium text-lg">No users found</p>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-[var(--sidebar-bg)]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[var(--accent-bg)] text-[var(--accent)] flex items-center justify-center font-bold text-sm">
                        {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-[var(--text-h)]">{user.full_name || 'Anonymous'}</span>
                        <div className="flex items-center gap-1 text-xs text-[var(--text-dim)]">
                          <Mail className="w-3 h-3" />
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      user.role === 'super'
                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        : user.role === 'admin' 
                          ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' 
                          : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                    }`}>
                      <Shield className="w-3 h-3" />
                      {user.role}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => onToggleStatus(user)}
                      disabled={!canManageUser(user) || user.id === currentUser?.id}
                      className={`flex items-center gap-2 group px-2 py-1 rounded-lg transition-all ${
                        (!canManageUser(user) || user.id === currentUser?.id) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[var(--bg)]'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className={`text-sm font-medium ${user.is_active ? 'text-green-500' : 'text-red-500'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-[var(--text-dim)]">
                      <Calendar className="w-3.5 h-3.5" />
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onDeleteUser(user)}
                      disabled={!canManageUser(user) || user.id === currentUser?.id}
                      className="p-2 text-[var(--text-dim)] hover:text-red-500 disabled:opacity-20 transition-colors"
                      title="Delete User"
                    >
                      <UserMinus className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalUsers > pageSize && (
        <div className="px-6 py-4 bg-[var(--sidebar-bg)] border-t border-[var(--border)] flex justify-between items-center">
          <p className="text-xs text-[var(--text-dim)] font-medium">
            Showing <span className="text-[var(--text-h)] font-bold">{(currentPage - 1) * pageSize + 1}</span> to <span className="text-[var(--text-h)] font-bold">{Math.min(currentPage * pageSize, totalUsers)}</span> of {totalUsers}
          </p>
          <div className="flex gap-1">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg hover:bg-[var(--accent-bg)] disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalUsers / pageSize), prev + 1))}
              disabled={currentPage === Math.ceil(totalUsers / pageSize)}
              className="p-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg hover:bg-[var(--accent-bg)] disabled:opacity-30 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUserTable
