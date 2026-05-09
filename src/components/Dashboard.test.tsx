import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "./Dashboard";
import * as sdk from "../client/sdk.gen";
import { useAuth, Role } from "../contexts/AuthContext";

// Mock the entire SDK
vi.mock("../client/sdk.gen", () => ({
  getCurrentUserApiV1LoginCurrentUserGet: vi.fn(() =>
    Promise.resolve({ data: {} }),
  ),
  readTodosApiV1TodosGet: vi.fn(() =>
    Promise.resolve({ data: { data: [], count: 0 } }),
  ),
  readUsersApiV1UsersGet: vi.fn(() =>
    Promise.resolve({ data: { items: [], total: 0 } }),
  ),
  createTodoApiV1TodosPost: vi.fn(() => Promise.resolve({ data: {} })),
  deleteTodoApiV1TodosIdDelete: vi.fn(() => Promise.resolve({ data: {} })),
  deleteUserApiV1UsersIdDelete: vi.fn(() => Promise.resolve({ data: {} })),
  updateTodoApiV1TodosIdPatch: vi.fn(() => Promise.resolve({ data: {} })),
  updateUserApiV1UsersIdPatch: vi.fn(() => Promise.resolve({ data: {} })),
  createUserApiV1UsersPost: vi.fn(() => Promise.resolve({ data: {} })),
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

describe("Dashboard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: "user-1",
        email: "user@test.com",
        role: "user",
        full_name: "Normal User",
        is_active: true,
      },
      role: Role.USER,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      hasPermission: vi.fn((r) => r === Role.USER),
      accessDenied: false,
      setAccessDenied: vi.fn(),
      token: "fake-token",
    });
    window.alert = vi.fn();
    window.confirm = vi.fn(() => true);
  });

  const mockUser = {
    id: "user-1",
    email: "user@test.com",
    role: "user",
    full_name: "Normal User",
    is_active: true,
  };
  const mockAdmin = {
    id: "admin-1",
    email: "admin@test.com",
    role: "admin",
    full_name: "Admin User",
    is_active: true,
  };

  it("renders empty states and covers task creation", async () => {
    vi.mocked(sdk.getCurrentUserApiV1LoginCurrentUserGet).mockResolvedValue({
      data: mockUser,
    } as any);
    vi.mocked(sdk.readTodosApiV1TodosGet).mockResolvedValue({
      data: { data: [], count: 0 },
    } as any);
    vi.mocked(sdk.createTodoApiV1TodosPost).mockResolvedValue({
      data: {},
    } as any);

    render(
      <MemoryRouter>
        <Dashboard onLogout={() => {}} />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(screen.getByText(/No tasks found/i)).toBeInTheDocument(),
    );

    // Open the creation form - clicking the main dashboard button
    fireEvent.click(
      screen.getAllByText(/Create Task/i, { selector: "button" })[0],
    );

    const titleInput = await screen.findByLabelText(/Title/i);
    fireEvent.change(titleInput, { target: { value: "New Task" } });
    // Click the submit button inside the form (should be the second one)
    fireEvent.click(screen.getAllByRole("button", { name: /Create Task/i })[1]);
    await waitFor(() =>
      expect(sdk.createTodoApiV1TodosPost).toHaveBeenCalled(),
    );
  });

  it("handles admin management workflow", async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: mockAdmin as any,
      role: Role.ADMIN,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      hasPermission: vi.fn((r) => [Role.USER, Role.ADMIN].includes(r)),
      accessDenied: false,
      setAccessDenied: vi.fn(),
      token: "fake-token",
    });

    const users = [
      { id: "1", email: "a@test.com", role: "user", is_active: true },
    ];
    vi.mocked(sdk.getCurrentUserApiV1LoginCurrentUserGet).mockResolvedValue({
      data: mockAdmin,
    } as any);
    vi.mocked(sdk.readUsersApiV1UsersGet).mockResolvedValue({
      data: { items: users, total: 1 },
    } as any);
    vi.mocked(sdk.createUserApiV1UsersPost).mockResolvedValue({
      data: {},
    } as any);

    render(
      <MemoryRouter>
        <Dashboard onLogout={() => {}} />
      </MemoryRouter>,
    );

    fireEvent.click(await screen.findByText("Users"));

    // Wait for the table to load
    await screen.findByText("a@test.com");

    // Click Provision User
    fireEvent.click(screen.getByText(/Provision User/i));

    const emailInput = await screen.findByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: "new@admin.com" } });
    fireEvent.change(await screen.findByLabelText(/Full Name/i), {
      target: { value: "New User" },
    });
    fireEvent.change(await screen.findByLabelText(/Temporary Password/i), {
      target: { value: "pass" },
    });
    fireEvent.click(
      await screen.findByRole("button", { name: /Create User Account/i }),
    );

    await waitFor(() =>
      expect(sdk.createUserApiV1UsersPost).toHaveBeenCalled(),
    );
  });

  it("handles task editing", async () => {
    const mockTodo = {
      id: "todo-1",
      title: "Test Task",
      status: "pending",
      priority: "medium",
    };
    vi.mocked(sdk.getCurrentUserApiV1LoginCurrentUserGet).mockResolvedValue({
      data: mockUser,
    } as any);
    vi.mocked(sdk.readTodosApiV1TodosGet).mockResolvedValue({
      data: { data: [mockTodo], count: 1 },
    } as any);
    vi.mocked(sdk.updateTodoApiV1TodosIdPatch).mockResolvedValue({
      data: {},
    } as any);

    render(
      <MemoryRouter>
        <Dashboard onLogout={() => {}} />
      </MemoryRouter>,
    );
    await screen.findByText("Test Task");

    // Wait for the button to be ready
    const editButton = await screen.findByTitle(/Edit Task/i);
    fireEvent.click(editButton);

    // Find the input in the modal
    const editTitleInput = await screen.findByDisplayValue("Test Task");
    fireEvent.change(editTitleInput, { target: { value: "Updated" } });
    fireEvent.click(screen.getByRole("button", { name: /Update Task/i }));
    await waitFor(() =>
      expect(sdk.updateTodoApiV1TodosIdPatch).toHaveBeenCalled(),
    );
  });
});
