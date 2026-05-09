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
        
        await waitFor(() => expect(screen.getByText(/No tasks found/i)).toBeInTheDocument())
        
        // Open the creation form
        fireEvent.click(screen.getByRole('button', { name: /Create Task/i }))
        
        const titleInput = await screen.findByLabelText(/Title/i)
        fireEvent.change(titleInput, { target: { value: 'New Task' } })
        fireEvent.click(screen.getByRole('button', { name: /Create Task/i }))
        await waitFor(() => expect(sdk.createTodoApiV1TodosPost).toHaveBeenCalled())
    })

    it('handles admin management workflow', async () => {
        const users = [{ id: '1', email: 'a@test.com', role: 'user', is_active: true }]
        vi.mocked(sdk.getCurrentUserApiV1LoginCurrentUserGet).mockResolvedValue({ data: mockAdmin } as any)
        vi.mocked(sdk.readUsersApiV1UsersGet).mockResolvedValue({ data: { items: users, total: 1 } } as any)
        vi.mocked(sdk.createUserApiV1UsersPost).mockResolvedValue({ data: {} } as any)

        render(<MemoryRouter><Dashboard onLogout={() => {}} /></MemoryRouter>)
        
        // Wait for the table to load
        await screen.findByText('a@test.com')

        // Click Provision Admin
        fireEvent.click(screen.getByText(/Provision Admin/i))
        
        const emailInput = await screen.findByLabelText(/Email Address/i)
        fireEvent.change(emailInput, { target: { value: 'new@admin.com' } })
        fireEvent.change(screen.getByLabelText(/Temporary Password/i), { target: { value: 'pass' } })
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
        
        // Wait for the button to be ready
        const editButton = await screen.findByTitle(/Edit Task/i)
        fireEvent.click(editButton)
        
        // Find the input in the modal
        const editTitleInput = await screen.findByDisplayValue('Test Task')
        fireEvent.change(editTitleInput, { target: { value: 'Updated' } })
        fireEvent.click(screen.getByRole('button', { name: /Update Task/i }))
        
        await waitFor(() => expect(sdk.updateTodoApiV1TodosIdPatch).toHaveBeenCalled())
    })
})
