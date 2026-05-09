import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Profile from './components/Profile'
import { AuthProvider, Role, useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import DashboardLayout from './components/layout/DashboardLayout'

const AccessDeniedOverlay = () => {
  const { setAccessDenied } = useAuth();
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="max-w-md w-full bg-[var(--card-bg)] border border-red-500/30 rounded-2xl p-8 text-center shadow-2xl shadow-red-500/10">
        <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m11 3.29V17a2 2 0 00-2-2h-1.29l-3.3-3.3a2 2 0 00-2.83 0l-3.3 3.3H5a2 2 0 00-2 2v3.29a2 2 0 00.59 1.41l3.3 3.3a2 2 0 002.83 0l3.3-3.3h1.29a2 2 0 002-2v-3.29a2 2 0 00-.59-1.41l-3.3-3.3a2 2 0 00-2.83 0l-3.3 3.3H5" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[var(--text-h)] mb-2">Access Forbidden</h1>
        <p className="text-[var(--text-dim)] mb-8">
          The server refused this request because you don't have enough permissions.
        </p>
        <button 
          onClick={() => setAccessDenied(false)}
          className="w-full py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/25"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, role, logout } = useAuth();
  const [activeView, setActiveView] = useState<'admin' | 'user'>('user');

  return (
    <DashboardLayout 
      currentUser={user} 
      onLogout={logout}
      activeView={activeView}
      onViewChange={setActiveView}
    >
      {children}
    </DashboardLayout>
  );
};

const AppContent = () => {
  const { accessDenied } = useAuth();
  return (
    <BrowserRouter>
      <div className="app-container">
        {accessDenied && <AccessDeniedOverlay />}
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Profile />
                </ProtectedLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/users" 
            element={
              <ProtectedRoute requiredRole={Role.ADMIN}>
                <Dashboard defaultView="admin" />
              </ProtectedRoute>
            } 
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
