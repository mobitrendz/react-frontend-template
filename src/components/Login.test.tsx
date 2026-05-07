import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Login from './Login'
import { loginAccessTokenApiV1LoginAccessTokenPost, registerUserApiV1LoginSignupPost } from '../client'
import { auth } from '../lib/auth'

// Mock the SDK and auth
vi.mock('../client', () => ({
    loginAccessTokenApiV1LoginAccessTokenPost: vi.fn(),
    registerUserApiV1LoginSignupPost: vi.fn()
}))

vi.mock('../lib/auth', () => ({
    auth: {
        setToken: vi.fn(),
        clearToken: vi.fn()
    }
}))

describe('Login Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        window.alert = vi.fn()
    })

    it('handles successful login', async () => {
        const onLoginSuccess = vi.fn()
        vi.mocked(loginAccessTokenApiV1LoginAccessTokenPost).mockResolvedValue({ 
            data: { access_token: 'fake-token' } 
        } as any)

        render(<Login onLoginSuccess={onLoginSuccess} />)
        
        fireEvent.change(screen.getByPlaceholderText(/Username \/ Email/i), { target: { value: 'test@example.com' } })
        fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123' } })
        fireEvent.click(screen.getByRole('button', { name: /Sign in/i }))

        await waitFor(() => {
            expect(auth.setToken).toHaveBeenCalledWith('fake-token')
            expect(onLoginSuccess).toHaveBeenCalled()
        })
    })

    it('handles login failure and inactive user', async () => {
        render(<Login onLoginSuccess={() => {}} />)
        
        const usernameInput = screen.getByPlaceholderText(/Username \/ Email/i)
        const passwordInput = screen.getByPlaceholderText(/Password/i)
        const submitButton = screen.getByRole('button', { name: /Sign in/i })

        fireEvent.change(usernameInput, { target: { value: 'any' } })
        fireEvent.change(passwordInput, { target: { value: 'any' } })

        // 1. Generic failure
        vi.mocked(loginAccessTokenApiV1LoginAccessTokenPost).mockResolvedValueOnce({ 
            error: { body: { detail: 'Invalid credentials' } } 
        } as any)
        fireEvent.click(submitButton)
        expect(await screen.findByText(/Invalid credentials/i)).toBeInTheDocument()

        // 2. Inactive user
        vi.mocked(loginAccessTokenApiV1LoginAccessTokenPost).mockResolvedValueOnce({ 
            error: { body: { detail: 'Inactive user' } } 
        } as any)
        fireEvent.click(submitButton)
        expect(await screen.findByText(/Your account is inactive/i)).toBeInTheDocument()
    })

    it('handles signup workflow and errors', async () => {
        render(<Login onLoginSuccess={() => {}} />)
        
        // 1. Success path
        vi.mocked(registerUserApiV1LoginSignupPost).mockResolvedValueOnce({ data: {} } as any)
        fireEvent.click(screen.getByText(/Don't have an account\? Sign up/i))
        
        fireEvent.change(screen.getByPlaceholderText(/Username \/ Email/i), { target: { value: 'new@test.com' } })
        fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'pass123' } })
        fireEvent.click(screen.getByRole('button', { name: /Sign up/i }))

        await waitFor(() => {
            expect(registerUserApiV1LoginSignupPost).toHaveBeenCalled()
            expect(window.alert).toHaveBeenCalledWith('Signup successful! Please sign in.')
        })

        // 2. Error path
        // Switches back to Login mode. Switch to Signup again.
        fireEvent.click(await screen.findByText(/Don't have an account\? Sign up/i))
        
        vi.mocked(registerUserApiV1LoginSignupPost).mockResolvedValueOnce({ error: { body: { detail: 'Already exists' } } } as any)
        fireEvent.change(screen.getByPlaceholderText(/Username \/ Email/i), { target: { value: 'exists@test.com' } })
        fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'pass123' } })
        
        fireEvent.click(screen.getByRole('button', { name: /Sign up/i }))
        expect(await screen.findByText(/Already exists/i)).toBeInTheDocument()
    })
})
