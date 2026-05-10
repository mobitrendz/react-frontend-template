import { render, screen, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React, { useEffect } from "react";
import { AuthProvider, useAuth, Role } from "./AuthContext";
import { auth } from "../lib/auth";
import { client } from "../client/client.gen";
import * as sdk from "../client/sdk.gen";

vi.mock("../lib/auth", () => ({
  auth: {
    initialize: vi.fn(),
    getToken: vi.fn(),
    setToken: vi.fn(),
    clearToken: vi.fn(),
  },
}));

vi.mock("../client/sdk.gen", () => ({
  getCurrentUserApiV1LoginCurrentUserGet: vi.fn(),
}));

vi.mock("jwt-decode", () => ({
  jwtDecode: vi.fn((token) => {
    if (token === "bad-token") throw new Error("Invalid token");
    return {
      sub: "test-user-id",
      email: "test@example.com",
      full_name: "Test User",
      role: "ADMIN",
    };
  }),
}));

const TestComponent = () => {
  const { user, token, role, isAuthenticated, isLoading, login, logout, hasPermission } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? "Authenticated" : "Not Authenticated"}</div>
      <div data-testid="user-role">{role || "No Role"}</div>
      <div data-testid="has-super">{hasPermission(Role.SUPER) ? "Yes" : "No"}</div>
      <div data-testid="has-admin">{hasPermission(Role.ADMIN) ? "Yes" : "No"}</div>
      <div data-testid="has-user">{hasPermission(Role.USER) ? "Yes" : "No"}</div>
      <button onClick={() => login("fake-token")}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (auth.getToken as any).mockReturnValue(null);
  });

  it("provides initial unauthenticated state", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    expect(screen.getByTestId("auth-status")).toHaveTextContent("Not Authenticated");
    expect(screen.getByTestId("user-role")).toHaveTextContent("No Role");
  });

  it("logs in user and fetches profile via API", async () => {
    (sdk.getCurrentUserApiV1LoginCurrentUserGet as any).mockResolvedValue({
      data: {
        id: "123",
        email: "test@example.com",
        full_name: "API User",
        role: "ADMIN",
        is_active: true,
      },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.queryByText("Loading...")).not.toBeInTheDocument());

    act(() => {
      screen.getByText("Login").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent("Authenticated");
      expect(screen.getByTestId("user-role")).toHaveTextContent("ADMIN");
      expect(screen.getByTestId("has-super")).toHaveTextContent("No");
      expect(screen.getByTestId("has-admin")).toHaveTextContent("Yes");
      expect(screen.getByTestId("has-user")).toHaveTextContent("Yes");
    });
  });

  it("logs in user and falls back to JWT if API fails", async () => {
    (sdk.getCurrentUserApiV1LoginCurrentUserGet as any).mockRejectedValue(new Error("API Error"));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.queryByText("Loading...")).not.toBeInTheDocument());

    act(() => {
      screen.getByText("Login").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent("Authenticated");
      expect(screen.getByTestId("user-role")).toHaveTextContent("ADMIN"); // From mocked jwtDecode
    });
  });

  it("logs out user", async () => {
    (auth.getToken as any).mockReturnValue("existing-token");
    (sdk.getCurrentUserApiV1LoginCurrentUserGet as any).mockResolvedValue({
      data: { role: "USER" },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent("Authenticated");
    });

    act(() => {
      screen.getByText("Logout").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent("Not Authenticated");
    });
  });
});
