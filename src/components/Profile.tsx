import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
    getCurrentUserApiV1LoginCurrentUserGet,
    updateUserApiV1UsersIdPatch,
    updatePasswordApiV1UsersPasswordPatch
} from '../client/sdk.gen'
import { type UserPublic } from '../client/types.gen'

interface ProfileProps {
    onLogout: () => void
}

const Profile = ({ onLogout }: ProfileProps) => {
    const [currentUser, setCurrentUser] = useState<UserPublic | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    
    // User Profile Edit State
    const [isEditingProfile, setIsEditingProfile] = useState(false)
    const [editFullName, setEditFullName] = useState('')
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
    
    // Password Change State
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
    const [passwordError, setPasswordError] = useState<string | null>(null)
    const [passwordSuccess, setPasswordSuccess] = useState(false)

    useEffect(() => {
        fetchUser()
    }, [])

    const fetchUser = async () => {
        try {
            setIsLoading(true)
            const response = await getCurrentUserApiV1LoginCurrentUserGet()
            if (response.data) {
                setCurrentUser(response.data)
                setEditFullName(response.data.full_name || '')
            }
        } catch (error) {
            console.error('Failed to fetch user:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!currentUser) return

        try {
            setIsUpdatingProfile(true)
            const response = await updateUserApiV1UsersIdPatch({
                path: { id: currentUser.id },
                body: { full_name: editFullName }
            })
            if (response.data) {
                setCurrentUser(response.data)
                setIsEditingProfile(false)
            }
        } catch (error) {
            console.error('Failed to update profile:', error)
        } finally {
            setIsUpdatingProfile(false)
        }
    }

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setPasswordError(null)
        setPasswordSuccess(false)

        if (newPassword !== confirmPassword) {
            setPasswordError("New passwords do not match")
            return
        }

        try {
            setIsUpdatingPassword(true)
            await updatePasswordApiV1UsersPasswordPatch({
                body: {
                    current_password: currentPassword,
                    new_password: newPassword
                }
            })
            setPasswordSuccess(true)
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
            setTimeout(() => {
                setIsChangingPassword(false)
                setPasswordSuccess(false)
            }, 2000)
        } catch (error: any) {
            console.error('Failed to update password:', error)
            setPasswordError(error.body?.detail || "Failed to update password. Please check your current password.")
        } finally {
            setIsUpdatingPassword(false)
        }
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
            <div className="max-w-3xl mx-auto">
                <header className="flex justify-between items-center mb-8 bg-[var(--card-bg)] p-6 rounded-2xl border border-[var(--border)] shadow-sm">
                    <div className="flex items-center gap-4">
                        <Link 
                            to="/" 
                            className="p-2 hover:bg-[var(--bg)] rounded-xl transition-all text-[var(--text-dim)] hover:text-[var(--accent)]"
                            title="Back to Dashboard"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <h1 className="text-2xl font-bold text-[var(--text-h)]">Account Settings</h1>
                    </div>
                    <button 
                        onClick={onLogout}
                        className="px-6 py-2.5 bg-[var(--bg)] border border-[var(--border)] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 rounded-xl transition-all font-medium"
                    >
                        Logout
                    </button>
                </header>

                <div className="space-y-8">
                    {/* Profile Information Section */}
                    <div className="bg-[var(--card-bg)] rounded-2xl shadow-lg border border-[var(--border)] overflow-hidden">
                        <div className="p-6 border-b border-[var(--border)] bg-[var(--accent-bg)] flex justify-between items-center">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <svg className="w-5 h-5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Personal Information
                            </h2>
                            {!isEditingProfile && (
                                <button 
                                    onClick={() => setIsEditingProfile(true)}
                                    className="text-sm font-bold text-[var(--accent)] hover:bg-[var(--accent)]/10 px-4 py-2 rounded-xl transition-all"
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>
                        <div className="p-8">
                            {isEditingProfile ? (
                                <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-md">
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-[var(--text-dim)]">Full Name</label>
                                        <input 
                                            type="text"
                                            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition-all"
                                            value={editFullName}
                                            onChange={(e) => setEditFullName(e.target.value)}
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <button 
                                            type="submit"
                                            disabled={isUpdatingProfile}
                                            className="flex-1 bg-[var(--accent)] text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
                                        >
                                            {isUpdatingProfile ? 'Saving Changes...' : 'Save Changes'}
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                setIsEditingProfile(false)
                                                setEditFullName(currentUser?.full_name || '')
                                            }}
                                            disabled={isUpdatingProfile}
                                            className="flex-1 bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] py-3 rounded-xl font-bold hover:bg-[var(--accent-bg)] transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-[var(--text-dim)] uppercase tracking-wider">Email Address</p>
                                        <p className="text-lg text-[var(--text-h)] font-medium">{currentUser?.email}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-[var(--text-dim)] uppercase tracking-wider">Full Name</p>
                                        <p className="text-lg text-[var(--text-h)] font-medium">{currentUser?.full_name || 'Not set'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-[var(--text-dim)] uppercase tracking-wider">Account Role</p>
                                        <span className="inline-block px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 mt-1">
                                            {currentUser?.role}
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-[var(--text-dim)] uppercase tracking-wider">Account Status</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                                            <span className="text-lg font-medium">Active</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Security Section */}
                    <div className="bg-[var(--card-bg)] rounded-2xl shadow-lg border border-[var(--border)] overflow-hidden">
                        <div className="p-6 border-b border-[var(--border)] bg-[var(--accent-bg)] flex justify-between items-center">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Password & Security
                            </h2>
                            {!isChangingPassword && (
                                <button 
                                    onClick={() => setIsChangingPassword(true)}
                                    className="text-sm font-bold text-red-500 hover:bg-red-500/10 px-4 py-2 rounded-xl transition-all"
                                >
                                    Change Password
                                </button>
                            )}
                        </div>
                        <div className="p-8">
                            {isChangingPassword ? (
                                <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-md">
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-[var(--text-dim)]">Current Password</label>
                                        <input 
                                            type="password"
                                            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition-all"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-[var(--text-dim)]">New Password</label>
                                            <input 
                                                type="password"
                                                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition-all"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-[var(--text-dim)]">Confirm New Password</label>
                                            <input 
                                                type="password"
                                                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition-all"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {passwordError && (
                                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                            <p className="text-sm text-red-500 font-bold flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                {passwordError}
                                            </p>
                                        </div>
                                    )}
                                    {passwordSuccess && (
                                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                                            <p className="text-sm text-green-500 font-bold flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Password updated successfully!
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex gap-4">
                                        <button 
                                            type="submit"
                                            disabled={isUpdatingPassword}
                                            className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
                                        >
                                            {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                setIsChangingPassword(false)
                                                setPasswordError(null)
                                                setPasswordSuccess(false)
                                                setCurrentPassword('')
                                                setNewPassword('')
                                                setConfirmPassword('')
                                            }}
                                            disabled={isUpdatingPassword}
                                            className="flex-1 bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] py-3 rounded-xl font-bold hover:bg-[var(--accent-bg)] transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="max-w-md">
                                        <p className="font-semibold text-[var(--text-h)]">Security Settings</p>
                                        <p className="text-[var(--text-dim)] text-sm mt-1">
                                            It's a good idea to use a strong password that you're not using elsewhere.
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => setIsChangingPassword(true)}
                                        className="py-3 px-8 bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] rounded-xl font-bold hover:bg-[var(--accent-bg)] transition-all flex items-center justify-center gap-2 group"
                                    >
                                        <svg className="w-5 h-5 text-[var(--text-dim)] group-hover:text-[var(--accent)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                        </svg>
                                        Update Password
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile
