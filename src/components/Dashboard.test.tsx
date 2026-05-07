import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Dashboard from './Dashboard'
import * as sdk from '../client/sdk.gen'

// Mock the entire SDK
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
        window.alert = vi.fn()
        window.confirm = vi.fn(() => true)
    })

    const mockUser = { id: 'user-1', email: 'user@test.com', role: 'user', full_name: 'Normal User', is_active: true }
    const mockAdmin = { id: 'admin-1', email: 'admin@test.com', role: 'admin', full_name: 'Admin User', is_active: true }

    it('renders empty states and covers task creation', async () => {
        vi.mocked(sdk.getCurrentUserApiV1LoginCurrentUserGet).mockResolvedValue({ data: mockUser } as any)
        vi.mocked(sdk.readTodosApiV1TodosGet).mockResolvedValue({ data: { data: [], count: 0 } } as any)
        vi.mocked(sdk.createTodoApiV1TodosPost).mockResolvedValue({ data: {} } as any)

        render(<MemoryRouter><Dashboard onLogout={() => {}} /></MemoryRouter>)
        
        await waitFor(() => expect(screen.getByText(/No active tasks/i)).toBeInTheDocument())
        
        fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'New Task' } })
        fireEvent.click(screen.getByRole('button', { name: /Create Task/i }))
        await waitFor(() => expect(sdk.createTodoApiV1TodosPost).toHaveBeenCalled())
    })

    it('handles admin management workflow', async () => {
        const users = [{ id: '1', email: 'a@test.com', role: 'user', is_active: true }]
        vi.mocked(sdk.getCurrentUserApiV1LoginCurrentUserGet).mockResolvedValue({ data: mockAdmin } as any)
        vi.mocked(sdk.readUsersApiV1UsersGet).mockResolvedValue({ data: { data: users, count: 1 } } as any)
        vi.mocked(sdk.createUserApiV1UsersPost).mockResolvedValue({ data: {} } as any)

        render(<MemoryRouter><Dashboard onLogout={() => {}} /></MemoryRouter>)
        await screen.findByText('a@test.com')

        fireEvent.click(screen.getByText(/Add New Admin/i))
        
        fireEvent.change(await screen.findByLabelText(/Admin Email/i), { target: { value: 'new@admin.com' } })
        fireEvent.change(screen.getByLabelText(/Admin Password/i), { target: { value: 'pass' } })
        fireEvent.click(screen.getByRole('button', { name: /Create Admin Account/i }))
        
        await waitFor(() => expect(sdk.createUserApiV1UsersPost).toHaveBeenCalled())
    })

    it('handles task editing', async () => {
        const mockTodo = { id: 'todo-1', title: 'Test Task', status: 'pending', priority: 'medium' }
        vi.mocked(sdk.getCurrentUserApiV1LoginCurrentUserGet).mockResolvedValue({ data: mockUser } as any)
        vi.mocked(sdk.readTodosApiV1TodosGet).mockResolvedValue({ data: { data: [mockTodo], count: 1 } } as any)
        vi.mocked(sdk.updateTodoApiV1TodosIdPatch).mockResolvedValue({ data: {} } as any)

        render(<MemoryRouter><Dashboard onLogout={() => {}} /></MemoryRouter>)
        await screen.findByText('Test Task')
        
        fireEvent.click(screen.getByTitle(/Edit Task/i))
        
        // Find the input in the modal
        const editTitleInput = await screen.findByDisplayValue('Test Task')
        fireEvent.change(editTitleInput, { target: { value: 'Updated' } })
        fireEvent.click(screen.getByRole('button', { name: /Update Task/i }))
        
        await waitFor(() => expect(sdk.updateTodoApiV1TodosIdPatch).toHaveBeenCalled())
    })
})
