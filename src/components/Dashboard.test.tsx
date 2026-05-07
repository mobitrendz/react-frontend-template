import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Dashboard from './Dashboard'
import { getCurrentUserApiV1LoginCurrentUserGet, readTodosApiV1TodosGet, readUsersApiV1UsersGet } from '../client/sdk.gen'

// Mock the SDK
vi.mock('../client/sdk.gen', () => ({
    getCurrentUserApiV1LoginCurrentUserGet: vi.fn(),
    readTodosApiV1TodosGet: vi.fn(),
    readUsersApiV1UsersGet: vi.fn(),
    createTodoApiV1TodosPost: vi.fn(),
    deleteTodoApiV1TodosIdDelete: vi.fn(),
    deleteUserApiV1UsersIdDelete: vi.fn(),
    updateTodoApiV1TodosIdPatch: vi.fn(),
    updateUserApiV1UsersIdPatch: vi.fn(),
    createUserApiV1UsersPost: vi.fn()
}))

describe('Dashboard Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders admin view with user management when user is admin', async () => {
        const mockAdmin = { id: 'admin-1', email: 'admin@test.com', role: 'admin', full_name: 'Admin User' }
        const mockUsersResponse = { 
            data: [
                mockAdmin, 
                { id: 'user-1', email: 'user@test.com', role: 'user', full_name: 'Normal User', is_active: true }
            ], 
            count: 2 
        }
        
        vi.mocked(getCurrentUserApiV1LoginCurrentUserGet).mockResolvedValue({ data: mockAdmin } as any)
        vi.mocked(readUsersApiV1UsersGet).mockResolvedValue({ data: mockUsersResponse } as any)

        render(
            <MemoryRouter>
                <Dashboard onLogout={() => {}} />
            </MemoryRouter>
        )

        await waitFor(() => {
            expect(screen.getByText(/Admin Control Center/i)).toBeInTheDocument()
            expect(screen.getByText(/User Management/i)).toBeInTheDocument()
            expect(screen.getByText('Normal User')).toBeInTheDocument()
            expect(screen.getByText('user@test.com')).toBeInTheDocument()
        })
    })

    it('renders task dashboard when user is a normal user', async () => {
        const mockUser = { id: 'user-1', email: 'user@test.com', role: 'user', full_name: 'Normal User' }
        const mockTodosResponse = { 
            data: [
                { id: 'todo-1', title: 'Complete Unit Tests', status: 'todo', priority: 'high', description: 'Important' }
            ], 
            count: 1 
        }
        
        vi.mocked(getCurrentUserApiV1LoginCurrentUserGet).mockResolvedValue({ data: mockUser } as any)
        vi.mocked(readTodosApiV1TodosGet).mockResolvedValue({ data: mockTodosResponse } as any)

        render(
            <MemoryRouter>
                <Dashboard onLogout={() => {}} />
            </MemoryRouter>
        )

        await waitFor(() => {
            expect(screen.getByText(/My Task Dashboard/i)).toBeInTheDocument()
            expect(screen.getByText('Complete Unit Tests')).toBeInTheDocument()
            expect(screen.getByPlaceholderText(/What needs to be done\?/i)).toBeInTheDocument()
        })
    })

    it('shows loading spinner initially', () => {
        vi.mocked(getCurrentUserApiV1LoginCurrentUserGet).mockReturnValue(new Promise(() => {})) // Never resolves

        render(
            <MemoryRouter>
                <Dashboard onLogout={() => {}} />
            </MemoryRouter>
        )

        expect(document.querySelector('.animate-spin')).toBeInTheDocument()
    })
})
