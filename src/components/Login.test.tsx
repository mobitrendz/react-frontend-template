import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Login from './Login'

// Mock the SDK
vi.mock('../client', () => ({
    loginAccessTokenApiV1LoginAccessTokenPost: vi.fn(),
    registerUserApiV1LoginSignupPost: vi.fn()
}))

describe('Login Component', () => {
    it('renders the login form by default', () => {
        render(<Login onLoginSuccess={() => {}} />)
        
        expect(screen.getByText(/Sign in to your account/i)).toBeInTheDocument()
        expect(screen.getByPlaceholderText(/Username \/ Email/i)).toBeInTheDocument()
        expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument()
    })

    it('toggles to sign up form', () => {
        render(<Login onLoginSuccess={() => {}} />)
        
        const toggleButton = screen.getByText(/Don't have an account\? Sign up/i)
        fireEvent.click(toggleButton)
        
        expect(screen.getByText(/Create an account/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Sign up/i })).toBeInTheDocument()
    })
})
