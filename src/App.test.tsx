import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import { useAuth, Role } from "./contexts/AuthContext";

vi.mock("./lib/auth", () => ({
  auth: {
    initialize: vi.fn(),
    isAuthenticated: vi.fn(),
    clearToken: vi.fn(),
    getToken: vi.fn(),
    setToken: vi.fn(),
  },
}));

vi.mock("./contexts/AuthContext", () => ({
  useAuth: vi.fn(),
  Role: {
    SUPER: "SUPER",
    ADMIN: "ADMIN",
    USER: "USER",
  },
  AuthProvider: ({ children }: any) => <div>{children}</div>,
}));

// Mock BrowserRouter to use MemoryRouter internally for tests
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    BrowserRouter: ({ children }: any) => <div>{children}</div>,
  };
});

// Mock components to simplify
vi.mock("./components/Login", () => ({
  default: () => {
    const { login } = useAuth();
    return (
      <div>
        Login Page
        <button onClick={() => login("token")}>Mock Login</button>
      </div>
    );
  },
}));

vi.mock("./components/Dashboard", () => ({
  default: () => {
    const { logout } = useAuth();
    return (
      <div>
        Dashboard Page
        <button onClick={logout}>Mock Logout</button>
      </div>
    );
  },
}));

vi.mock("./components/Profile", () => ({
  default: () => <div>Profile Page</div>,
}));

describe("App Component", () => {
  const mockLogin = vi.fn();
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      role: null,
      login: mockLogin,
      logout: mockLogout,
      hasPermission: vi.fn(),
      accessDenied: false,
      setAccessDenied: vi.fn(),
      token: null,
    });
  });

  it("renders login page when not authenticated", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("renders dashboard when authenticated", async () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: "1", email: "t@t.com", role: "USER", is_active: true } as any,
      role: Role.USER,
      login: mockLogin,
      logout: mockLogout,
      hasPermission: vi.fn(() => true),
      accessDenied: false,
      setAccessDenied: vi.fn(),
      token: "t",
    });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Dashboard Page")).toBeInTheDocument();
  });

  it("handles login and logout cycle", async () => {
    const { rerender } = render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();

    // Mock login transition
    fireEvent.click(screen.getByText("Mock Login"));
    expect(mockLogin).toHaveBeenCalledWith("token");

    // Update mock for "authenticated" state
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: "1", email: "t@t.com", role: "USER", is_active: true } as any,
      role: Role.USER,
      login: mockLogin,
      logout: mockLogout,
      hasPermission: vi.fn(() => true),
      accessDenied: false,
      setAccessDenied: vi.fn(),
      token: "t",
    });

    rerender(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Dashboard Page")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Mock Logout"));
    expect(mockLogout).toHaveBeenCalled();
  });
});
