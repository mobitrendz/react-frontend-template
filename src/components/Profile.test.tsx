import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Profile from './Profile'
import { getCurrentUserApiV1LoginCurrentUserGet } from '../client/sdk.gen'

// Mock the SDK
vi.mock('../client/sdk.gen', () => ({
    getCurrentUserApiV1LoginCurrentUserGet: vi.fn(),
    updateUserApiV1UsersIdPatch: vi.fn(),
    deleteUserApiV1UsersIdDelete: vi.fn(),
    readTodosApiV1TodosGet: vi.fn(),
    deleteTodoApiV1TodosIdDelete: vi.fn(),
    loginAccessTokenApiV1LoginAccessTokenPost: vi.fn(),
    updatePasswordApiV1UsersPasswordPatch: vi.fn()
}))

describe('Profile Component', () => {
    const mockUser = { 
        id: 'user-123', 
        email: 'john@example.com', 
        full_name: 'John Doe', 
        role: 'user',
        is_active: true 
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(getCurrentUserApiV1LoginCurrentUserGet).mockResolvedValue({ data: mockUser } as any)
    })

    it('renders profile details successfully', async () => {
        render(
            <MemoryRouter>
                <Profile onLogout={() => {}} />
            </MemoryRouter>
        )

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument()
            expect(screen.getByText('john@example.com')).toBeInTheDocument()
        })
    })

    it('shows danger zone with delete button', async () => {
        render(
            <MemoryRouter>
                <Profile onLogout={() => {}} />
            </MemoryRouter>
        )

        await waitFor(() => {
            expect(screen.getByText(/Danger Zone/i)).toBeInTheDocument()
            expect(screen.getByText(/Delete My Account/i)).toBeInTheDocument()
        })
    })

    it('opens password verification modal when clicking delete', async () => {
        render(
            <MemoryRouter>
                <Profile onLogout={() => {}} />
            </MemoryRouter>
        )

        await waitFor(() => screen.getByText(/Delete My Account/i))
        
        const deleteButton = screen.getByText(/Delete My Account/i)
        fireEvent.click(deleteButton)

        expect(screen.getByText(/Confirm Password to Delete/i)).toBeInTheDocument()
        expect(screen.getByPlaceholderText(/Enter your password/i)).toBeInTheDocument()
    })
})
