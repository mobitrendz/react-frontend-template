import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
import Dashboard from "./Dashboard";
import * as sdk from "../client/sdk.gen";

import { useAuth, Role } from "../contexts/AuthContext";

vi.mock("../client/sdk.gen", () => ({
  getCurrentUserApiV1LoginCurrentUserGet: vi.fn(() =>
    Promise.resolve({ data: {} }),
  ),
  readTodosApiV1TodosGet: vi.fn(() =>
    Promise.resolve({ data: { data: [], count: 0 } }),
  ),
  createTodoApiV1TodosPost: vi.fn(() => Promise.resolve({ data: {} })),
  readUsersApiV1UsersGet: vi.fn(() =>
    Promise.resolve({ data: { items: [], total: 0 } }),
  ),
  deleteUserApiV1UsersIdDelete: vi.fn(() => Promise.resolve({ data: {} })),
  updateTodoApiV1TodosIdPatch: vi.fn(() => Promise.resolve({ data: {} })),
  createUserApiV1UsersPost: vi.fn(() => Promise.resolve({ data: {} })),
  updateUserApiV1UsersIdPatch: vi.fn(() => Promise.resolve({ data: {} })),
  deleteTodoApiV1TodosIdDelete: vi.fn(() => Promise.resolve({ data: {} })),
  loginAccessTokenApiV1LoginAccessTokenPost: vi.fn(() =>
    Promise.resolve({ data: {} }),
  ),
}));

vi.mock("../lib/auth", () => ({
  auth: {
    initialize: vi.fn(),
    isAuthenticated: vi.fn(),
    clearToken: vi.fn(),
    getToken: vi.fn(),
    setToken: vi.fn(),
  },
}));

vi.mock("../contexts/AuthContext", () => ({
  useAuth: vi.fn(),
  Role: {
    SUPER: "SUPER",
    ADMIN: "ADMIN",
    USER: "USER",
  },
  AuthProvider: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("./Login", () => ({
  default: ({ onLoginSuccess }: any) => (
    <div>
      Login Page
      <button onClick={onLoginSuccess}>Mock Login</button>
    </div>
  ),
}));

vi.mock("./Profile", () => ({
  default: () => <div>Profile Page</div>,
}));

describe("App routing & auth flow", () => {
  let authState = {
    isAuthenticated: false,
    user: null as any,
    role: null as any,
  };

  const mockLogin = vi.fn((token: string) => {
    authState.isAuthenticated = true;
    authState.user = {
      id: "u1",
      email: "user@x.com",
      role: "user",
      is_active: true,
    };
    authState.role = Role.USER;
  });

  const mockLogout = vi.fn(() => {
    authState.isAuthenticated = false;
    authState.user = null;
    authState.role = null;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    authState = {
      isAuthenticated: false,
      user: null,
      role: null,
    };

    vi.mocked(useAuth).mockImplementation(() => ({
      isAuthenticated: authState.isAuthenticated,
      isLoading: false,
      user: authState.user,
      role: authState.role,
      login: mockLogin,
      logout: mockLogout,
      hasPermission: vi.fn(
        (r) =>
          !authState.role ||
          r === authState.role ||
          authState.role === Role.SUPER ||
          authState.role === Role.ADMIN,
      ),
      accessDenied: false,
      setAccessDenied: vi.fn(),
      token: authState.isAuthenticated ? "fake-token" : null,
    }));
  });

  it("redirects unknown route to login when unauthenticated", async () => {
    const { auth } = await import("../lib/auth");
    vi.mocked(auth.isAuthenticated).mockReturnValue(false);
    window.history.pushState({}, "Test", "/unknown");
    render(<App />);
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("allows access to profile when authenticated", async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: "u1", email: "u@x.com", role: "user", is_active: true },
      role: Role.USER,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: mockLogout,
      hasPermission: vi.fn(() => true),
      accessDenied: false,
      setAccessDenied: vi.fn(),
      token: "valid",
    });
    window.history.pushState({}, "Test", "/profile");
    render(<App />);
    expect(screen.getByText("Profile Page")).toBeInTheDocument();
  });

  it("handles logout from dashboard and returns to login", async () => {
    const mockUser = {
      id: "u1",
      email: "user@x.com",
      role: "user",
      full_name: "User One",
      is_active: true,
    };
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser as any,
      role: Role.USER,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: mockLogout,
      hasPermission: vi.fn(() => true),
      accessDenied: false,
      setAccessDenied: vi.fn(),
      token: "valid",
    });
    (sdk.getCurrentUserApiV1LoginCurrentUserGet as any).mockResolvedValue({
      data: mockUser,
    } as any);
    (sdk.readTodosApiV1TodosGet as any).mockResolvedValue({
      data: { data: [], count: 0 },
    } as any);

    vi.mocked(useAuth).mockReturnValue({
      user: mockUser as any,
      role: Role.USER,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: mockLogout,
      hasPermission: vi.fn(() => true),
      accessDenied: false,
      setAccessDenied: vi.fn(),
      token: "valid",
    });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Dashboard onLogout={mockLogout} />
      </MemoryRouter>,
    );

    await screen.findByText(/Sign Out/i);

    fireEvent.click(screen.getAllByText(/Sign Out/i)[0]);
    expect(mockLogout).toHaveBeenCalled();
  });
});

describe("Dashboard edge cases", () => {
  const mockUser = {
    id: "u1",
    email: "user@x.com",
    role: "user",
    full_name: "User One",
    is_active: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser as any,
      role: Role.USER,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      hasPermission: vi.fn((r) => r === Role.USER),
      accessDenied: false,
      setAccessDenied: vi.fn(),
      token: "valid",
    });
    window.alert = vi.fn();
    window.confirm = vi.fn(() => true);
  });

  it("admin can delete a user and sees confirmation", async () => {
    const adminUser = { ...mockUser, role: "admin" };
    vi.mocked(useAuth).mockReturnValue({
      user: adminUser as any,
      role: Role.ADMIN,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      hasPermission: vi.fn((r) => [Role.USER, Role.ADMIN].includes(r)),
      accessDenied: false,
      setAccessDenied: vi.fn(),
      token: "valid",
    });
    const users = [
      { id: "2", email: "delete@x.com", role: "user", is_active: true },
    ];
    vi.mocked(sdk.getCurrentUserApiV1LoginCurrentUserGet).mockResolvedValue({
      data: adminUser,
    } as any);
    vi.mocked(sdk.readUsersApiV1UsersGet).mockResolvedValue({
      data: { items: users, total: 1 },
    } as any);
    vi.mocked(sdk.deleteUserApiV1UsersIdDelete).mockResolvedValue({
      data: {},
    } as any);

    render(
      <MemoryRouter>
        <Dashboard onLogout={() => {}} initialTab="users" />
      </MemoryRouter>,
    );

    await screen.findByText("delete@x.com");
    fireEvent.click(screen.getByTitle(/Delete User/i));

    // Custom Modal shows up, enter password
    const passwordInput = await screen.findByPlaceholderText(
      /Enter your current password/i,
    );
    fireEvent.change(passwordInput, { target: { value: "password" } });

    // Mock successful password verification
    vi.mocked(sdk.loginAccessTokenApiV1LoginAccessTokenPost).mockResolvedValue({
      data: { access_token: "valid" },
    } as any);

    fireEvent.click(screen.getByRole("button", { name: /Confirm Delete/i }));

    await waitFor(() =>
      expect(sdk.deleteUserApiV1UsersIdDelete).toHaveBeenCalledWith({
        path: { id: "2" },
      }),
    );
  });

  it("user can search for tasks", async () => {
    const tasks = [
      {
        id: "1",
        title: "Task One",
        description: "Description One",
        status: "pending",
        priority: "medium",
      },
      {
        id: "2",
        title: "Task Two",
        description: "Description Two",
        status: "pending",
        priority: "medium",
      },
    ];
    (sdk.getCurrentUserApiV1LoginCurrentUserGet as any).mockResolvedValue({
      data: mockUser,
    } as any);
    (sdk.readTodosApiV1TodosGet as any).mockResolvedValue({
      data: { data: tasks, count: 2 },
    } as any);

    render(
      <MemoryRouter>
        <Dashboard onLogout={() => {}} />
      </MemoryRouter>,
    );

    await screen.findByText(/My Tasks/i);
    expect(screen.getByText("Task One")).toBeInTheDocument();
    expect(screen.getByText("Task Two")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/Search tasks/i), {
      target: { value: "One" },
    });

    expect(screen.getByText("Task One")).toBeInTheDocument();
    expect(screen.queryByText("Task Two")).not.toBeInTheDocument();
  });

  it("user can edit a task", async () => {
    const task = {
      id: "1",
      title: "Old Title",
      description: "Old Desc",
      status: "pending",
      priority: "medium",
    };
    (sdk.getCurrentUserApiV1LoginCurrentUserGet as any).mockResolvedValue({
      data: mockUser,
    } as any);
    (sdk.readTodosApiV1TodosGet as any).mockResolvedValue({
      data: { data: [task], count: 1 },
    } as any);
    (sdk.updateTodoApiV1TodosIdPatch as any).mockResolvedValue({
      data: { ...task, title: "New Title" },
    } as any);

    render(
      <MemoryRouter>
        <Dashboard onLogout={() => {}} />
      </MemoryRouter>,
    );

    await screen.findByText(/My Tasks/i);
    fireEvent.click(await screen.findByTitle(/Edit Task/i));

    fireEvent.change(screen.getByDisplayValue("Old Title"), {
      target: { value: "New Title" },
    });
    fireEvent.change(screen.getByDisplayValue("Old Desc"), {
      target: { value: "New Desc" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Update Task/i }));

    await waitFor(() =>
      expect(sdk.updateTodoApiV1TodosIdPatch).toHaveBeenCalledWith({
        path: { id: "1" },
        body: expect.objectContaining({
          title: "New Title",
          description: "New Desc",
        }),
      }),
    );
  });

  it("admin can create a new admin account", async () => {
    const adminUser = { ...mockUser, role: "admin" };
    vi.mocked(useAuth).mockReturnValue({
      user: adminUser as any,
      role: Role.ADMIN,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      hasPermission: vi.fn((r) => [Role.USER, Role.ADMIN].includes(r)),
      accessDenied: false,
      setAccessDenied: vi.fn(),
      token: "valid",
    });
    vi.mocked(sdk.getCurrentUserApiV1LoginCurrentUserGet).mockResolvedValue({
      data: adminUser,
    } as any);
    vi.mocked(sdk.readUsersApiV1UsersGet).mockResolvedValue({
      data: { items: [], total: 0 },
    } as any);
    (sdk.createUserApiV1UsersPost as any).mockResolvedValue({
      data: {},
    } as any);

    render(
      <MemoryRouter>
        <Dashboard onLogout={() => {}} initialTab="users" />
      </MemoryRouter>,
    );

    await screen.findByText(/Provision User/i);
    fireEvent.click(screen.getByRole("button", { name: /Provision User/i }));

    fireEvent.change(screen.getByPlaceholderText(/user@example\.com/i), {
      target: { value: "newadmin@x.com" },
    });
    fireEvent.change(screen.getByLabelText(/Temporary Password/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Sarah Connor/i), {
      target: { value: "New Admin" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /Create User Account/i }),
    );

    await waitFor(() =>
      expect(sdk.createUserApiV1UsersPost).toHaveBeenCalledWith({
        body: expect.objectContaining({
          email: "newadmin@x.com",
          role: "user",
        }),
      }),
    );
  });

  it("admin can toggle user active status", async () => {
    const adminUser = { ...mockUser, role: "admin" };
    vi.mocked(useAuth).mockReturnValue({
      user: adminUser as any,
      role: Role.ADMIN,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      hasPermission: vi.fn((r) => [Role.USER, Role.ADMIN].includes(r)),
      accessDenied: false,
      setAccessDenied: vi.fn(),
      token: "valid",
    });
    const otherUser = {
      id: "2",
      email: "user2@x.com",
      role: "user",
      is_active: true,
    };
    vi.mocked(sdk.getCurrentUserApiV1LoginCurrentUserGet).mockResolvedValue({
      data: adminUser,
    } as any);
    vi.mocked(sdk.readUsersApiV1UsersGet).mockResolvedValue({
      data: { items: [otherUser], total: 1 },
    } as any);
    (sdk.updateUserApiV1UsersIdPatch as any).mockResolvedValue({
      data: { ...otherUser, is_active: false },
    } as any);

    render(
      <MemoryRouter>
        <Dashboard onLogout={() => {}} />
      </MemoryRouter>,
    );

    fireEvent.click(await screen.findByText("Users"));
    await screen.findByText("user2@x.com");
    const toggleButton = await screen.findByRole("button", { name: /Active/i });
    fireEvent.click(toggleButton);

    await waitFor(() =>
      expect(sdk.updateUserApiV1UsersIdPatch).toHaveBeenCalledWith({
        path: { id: "2" },
        body: expect.objectContaining({ is_active: false }),
      }),
    );
  });
});
