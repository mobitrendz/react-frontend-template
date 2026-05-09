import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import Dashboard from './Dashboard';
import * as sdk from '../client/sdk.gen';

vi.mock('../client/sdk.gen', () => ({
  getCurrentUserApiV1LoginCurrentUserGet: vi.fn(),
  readTodosApiV1TodosGet: vi.fn(),
  createTodoApiV1TodosPost: vi.fn(),
  readUsersApiV1UsersGet: vi.fn(),
  deleteUserApiV1UsersIdDelete: vi.fn(),
  updateTodoApiV1TodosIdPatch: vi.fn(),
  createUserApiV1UsersPost: vi.fn(),
  updateUserApiV1UsersIdPatch: vi.fn(),
  deleteTodoApiV1TodosIdDelete: vi.fn(),
}));

vi.mock('../lib/auth', () => ({
  auth: {
    initialize: vi.fn(),
    isAuthenticated: vi.fn(),
    clearToken: vi.fn(),
  },
}));

vi.mock('./Login', () => ({
  default: ({ onLoginSuccess }: any) => (
    <div>
      Login Page
      <button onClick={onLoginSuccess}>Mock Login</button>
    </div>
  ),
}));

vi.mock('./Profile', () => ({
  default: () => <div>Profile Page</div>,
}));

describe('App routing & auth flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects unknown route to login when unauthenticated', async () => {
    const { auth } = await import('../lib/auth');
    vi.mocked(auth.isAuthenticated).mockReturnValue(false);
    window.history.pushState({}, 'Test', '/unknown');
    render(<App />);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('allows access to profile when authenticated', async () => {
    const { auth } = await import('../lib/auth');
    vi.mocked(auth.isAuthenticated).mockReturnValue(true);
    window.history.pushState({}, 'Test', '/profile');
    render(<App />);
    expect(screen.getByText('Profile Page')).toBeInTheDocument();
  });

  it('handles logout from dashboard and returns to login', async () => {
    const { auth } = await import('../lib/auth');
    vi.mocked(auth.isAuthenticated).mockReturnValue(true);
    const mockUser = { id: 'u1', email: 'user@x.com', role: 'user', full_name: 'User One', is_active: true };
    (sdk.getCurrentUserApiV1LoginCurrentUserGet as any).mockResolvedValue({ data: mockUser } as any);
    (sdk.readTodosApiV1TodosGet as any).mockResolvedValue({ data: { data: [], count: 0 } } as any);

    window.history.pushState({}, 'Test', '/');
    render(<App />);

    await screen.findByText(/My Tasks/i);
    
    fireEvent.click(screen.getByText(/Sign Out/i));
    expect(auth.clearToken).toHaveBeenCalled();
    await waitFor(() => expect(screen.getByText('Login Page')).toBeInTheDocument());
  });
});

describe('Dashboard edge cases', () => {
  const mockUser = { id: 'u1', email: 'user@x.com', role: 'user', full_name: 'User One', is_active: true };

  beforeEach(() => {
    vi.clearAllMocks();
    window.alert = vi.fn();
    window.confirm = vi.fn(() => true);
  });

  it('admin can delete a user and sees confirmation', async () => {
    const adminUser = { ...mockUser, role: 'admin' };
    const users = [{ id: '2', email: 'delete@x.com', role: 'user', is_active: true }];
    vi.mocked(sdk.getCurrentUserApiV1LoginCurrentUserGet).mockResolvedValue({ data: adminUser } as any);
    vi.mocked(sdk.readUsersApiV1UsersGet).mockResolvedValue({ data: { items: users, total: 1 } } as any);
    vi.mocked(sdk.deleteUserApiV1UsersIdDelete).mockResolvedValue({ data: {} } as any);

    render(
      <MemoryRouter>
        <Dashboard onLogout={() => {}} />
      </MemoryRouter>
    );

    await screen.findByText(/Identity & Access/i);
    await screen.findByText('delete@x.com');
    fireEvent.click(screen.getByTitle(/Delete User/i));
    
    expect(window.confirm).toHaveBeenCalled();
    await waitFor(() => expect(sdk.deleteUserApiV1UsersIdDelete).toHaveBeenCalledWith({ path: { id: '2' } }));
  });

  it('user can search for tasks', async () => {
    const tasks = [
      { id: '1', title: 'Task One', description: 'Description One', status: 'pending', priority: 'medium' },
      { id: '2', title: 'Task Two', description: 'Description Two', status: 'pending', priority: 'medium' },
    ];
    (sdk.getCurrentUserApiV1LoginCurrentUserGet as any).mockResolvedValue({ data: mockUser } as any);
    (sdk.readTodosApiV1TodosGet as any).mockResolvedValue({ data: { data: tasks, count: 2 } } as any);

    render(
      <MemoryRouter>
        <Dashboard onLogout={() => {}} />
      </MemoryRouter>
    );

    await screen.findByText(/My Tasks/i);
    expect(screen.getByText('Task One')).toBeInTheDocument();
    expect(screen.getByText('Task Two')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/Search tasks/i), { target: { value: 'One' } });
    
    expect(screen.getByText('Task One')).toBeInTheDocument();
    expect(screen.queryByText('Task Two')).not.toBeInTheDocument();
  });

  it('user can edit a task', async () => {
    const task = { id: '1', title: 'Old Title', description: 'Old Desc', status: 'pending', priority: 'medium' };
    (sdk.getCurrentUserApiV1LoginCurrentUserGet as any).mockResolvedValue({ data: mockUser } as any);
    (sdk.readTodosApiV1TodosGet as any).mockResolvedValue({ data: { data: [task], count: 1 } } as any);
    (sdk.updateTodoApiV1TodosIdPatch as any).mockResolvedValue({ data: { ...task, title: 'New Title' } } as any);

    render(
      <MemoryRouter>
        <Dashboard onLogout={() => {}} />
      </MemoryRouter>
    );

    await screen.findByText(/My Tasks/i);
    fireEvent.click(await screen.findByTitle(/Edit Task/i));
    
    fireEvent.change(screen.getByDisplayValue('Old Title'), { target: { value: 'New Title' } });
    fireEvent.change(screen.getByDisplayValue('Old Desc'), { target: { value: 'New Desc' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Update Task/i }));
    
    await waitFor(() => expect(sdk.updateTodoApiV1TodosIdPatch).toHaveBeenCalledWith({
      path: { id: '1' },
      body: expect.objectContaining({ 
        title: 'New Title',
        description: 'New Desc'
      })
    }));
  });

  it('admin can create a new admin account', async () => {
    const adminUser = { ...mockUser, role: 'admin' };
    vi.mocked(sdk.getCurrentUserApiV1LoginCurrentUserGet).mockResolvedValue({ data: adminUser } as any);
    vi.mocked(sdk.readUsersApiV1UsersGet).mockResolvedValue({ data: { items: [], total: 0 } } as any);
    (sdk.createUserApiV1UsersPost as any).mockResolvedValue({ data: {} } as any);

    render(
      <MemoryRouter>
        <Dashboard onLogout={() => {}} />
      </MemoryRouter>
    );

    await screen.findByText(/Identity & Access/i);
    fireEvent.click(screen.getByRole('button', { name: /Provision Admin/i }));
    
    fireEvent.change(screen.getByPlaceholderText(/admin@company\.com/i), { target: { value: 'newadmin@x.com' } });
    fireEvent.change(screen.getByLabelText(/Temporary Password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Sarah Connor/i), { target: { value: 'New Admin' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Create Admin Account/i }));
    
    await waitFor(() => expect(sdk.createUserApiV1UsersPost).toHaveBeenCalledWith({
      body: expect.objectContaining({
        email: 'newadmin@x.com',
        role: 'admin'
      })
    }));
  });

  it('admin can toggle user active status', async () => {
    const adminUser = { ...mockUser, role: 'admin' };
    const otherUser = { id: '2', email: 'user2@x.com', role: 'user', is_active: true };
    vi.mocked(sdk.getCurrentUserApiV1LoginCurrentUserGet).mockResolvedValue({ data: adminUser } as any);
    vi.mocked(sdk.readUsersApiV1UsersGet).mockResolvedValue({ data: { items: [otherUser], total: 1 } } as any);
    (sdk.updateUserApiV1UsersIdPatch as any).mockResolvedValue({ data: { ...otherUser, is_active: false } } as any);

    render(
      <MemoryRouter>
        <Dashboard onLogout={() => {}} />
      </MemoryRouter>
    );

    await screen.findByText(/Identity & Access/i);
    const toggleButton = await screen.findByRole('button', { name: /Active/i });
    fireEvent.click(toggleButton);
    
    await waitFor(() => expect(sdk.updateUserApiV1UsersIdPatch).toHaveBeenCalledWith({
      path: { id: '2' },
      body: expect.objectContaining({ is_active: false })
    }));
  });
});
