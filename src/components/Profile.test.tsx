import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Profile from './Profile'
import * as sdk from '../client/sdk.gen'

// Mock the entire SDK
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
    const mockUser = { id: 'user-123', email: 'john@example.com', full_name: 'John Doe', role: 'user', is_active: true }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(sdk.getCurrentUserApiV1LoginCurrentUserGet).mockResolvedValue({ data: mockUser } as any)
        window.alert = vi.fn()
        window.confirm = vi.fn(() => true)
    })

    it('handles profile update', async () => {
        vi.mocked(sdk.updateUserApiV1UsersIdPatch).mockResolvedValue({ data: { ...mockUser, full_name: 'John Updated' } } as any)
        render(<MemoryRouter><Profile onLogout={() => {}} /></MemoryRouter>)
        
        fireEvent.click(await screen.findByText(/Edit Profile/i))
        const nameInput = await screen.findByLabelText(/Full Name/i)
        fireEvent.change(nameInput, { target: { value: 'John Updated' } })
        fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }))

        await waitFor(() => {
            expect(screen.getByText('John Updated')).toBeInTheDocument()
        })
    })

    it('handles password validation mismatch', async () => {
        render(<MemoryRouter><Profile onLogout={() => {}} /></MemoryRouter>)
        
        fireEvent.click(await screen.findByText('Change Password'))
        
        const currentPassInput = await screen.findByLabelText(/Current Password/i)
        const newPassInput = screen.getByLabelText(/^New Password$/i)
        const confirmPassInput = screen.getByLabelText(/Confirm New Password/i)
        
        fireEvent.change(currentPassInput, { target: { value: 'any' } })
        fireEvent.change(newPassInput, { target: { value: 'p1' } })
        fireEvent.change(confirmPassInput, { target: { value: 'p2' } })
        
        fireEvent.click(screen.getByRole('button', { name: /^Update Password$/i }))
        expect(await screen.findByText(/New passwords do not match/i)).toBeInTheDocument()
    })

    it('handles successful password update', async () => {
        vi.mocked(sdk.updatePasswordApiV1UsersPasswordPatch).mockResolvedValue({ data: {} } as any)
        render(<MemoryRouter><Profile onLogout={() => {}} /></MemoryRouter>)
        
        fireEvent.click(await screen.findByText('Change Password'))
        
        fireEvent.change(await screen.findByLabelText(/Current Password/i), { target: { value: 'oldpass' } })
        fireEvent.change(screen.getByLabelText(/^New Password$/i), { target: { value: 'newpass' } })
        fireEvent.change(screen.getByLabelText(/Confirm New Password/i), { target: { value: 'newpass' } })
        
        fireEvent.click(screen.getByRole('button', { name: /^Update Password$/i }))
        expect(await screen.findByText(/Password updated successfully!/i)).toBeInTheDocument()
    })

    it('handles deletion process', async () => {
        const onLogout = vi.fn()
        vi.mocked(sdk.loginAccessTokenApiV1LoginAccessTokenPost).mockResolvedValue({ data: { access_token: 'v' } } as any)
        vi.mocked(sdk.readTodosApiV1TodosGet).mockResolvedValue({ data: { data: [] } } as any)
        vi.mocked(sdk.deleteUserApiV1UsersIdDelete).mockResolvedValue({ data: {} } as any)

        render(<MemoryRouter><Profile onLogout={onLogout} /></MemoryRouter>)
        fireEvent.click(await screen.findByText(/Delete My Account/i))
        
        const confirmInput = await screen.findByLabelText(/Confirm Password to Delete/i)
        fireEvent.change(confirmInput, { target: { value: 'pass' } })
        fireEvent.click(screen.getByRole('button', { name: /Verify & Delete/i }))
        
        await waitFor(() => {
            expect(sdk.deleteUserApiV1UsersIdDelete).toHaveBeenCalled()
            expect(onLogout).toHaveBeenCalled()
        })
    })
})
