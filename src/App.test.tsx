import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from './App'
import { auth } from './lib/auth'

vi.mock('./lib/auth', () => ({
    auth: {
        initialize: vi.fn(),
        isAuthenticated: vi.fn(),
        clearToken: vi.fn()
    }
}))

// Mock components to simplify
vi.mock('./components/Login', () => ({
    default: ({ onLoginSuccess }: any) => (
        <div>
            Login Page
            <button onClick={onLoginSuccess}>Mock Login</button>
        </div>
    )
}))

vi.mock('./components/Dashboard', () => ({
    default: ({ onLogout }: any) => (
        <div>
            Dashboard Page
            <button onClick={onLogout}>Mock Logout</button>
        </div>
    )
}))

vi.mock('./components/Profile', () => ({
    default: () => <div>Profile Page</div>
}))

describe('App Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders login page when not authenticated', () => {
        vi.mocked(auth.isAuthenticated).mockReturnValue(false)
        render(<App />)
        
        expect(screen.getByText('Login Page')).toBeInTheDocument()
    })

    it('renders dashboard when authenticated', () => {
        vi.mocked(auth.isAuthenticated).mockReturnValue(true)
        render(<App />)
        
        expect(screen.getByText('Dashboard Page')).toBeInTheDocument()
    })

    it('handles login and logout cycle', () => {
        vi.mocked(auth.isAuthenticated).mockReturnValue(false)
        render(<App />)
        
        // Initial state: Login
        expect(screen.getByText('Login Page')).toBeInTheDocument()
        
        // Mock login
        fireEvent.click(screen.getByText('Mock Login'))
        expect(screen.getByText('Dashboard Page')).toBeInTheDocument()
        
        // Mock logout
        fireEvent.click(screen.getByText('Mock Logout'))
        expect(auth.clearToken).toHaveBeenCalled()
        expect(screen.getByText('Login Page')).toBeInTheDocument()
    })
})
