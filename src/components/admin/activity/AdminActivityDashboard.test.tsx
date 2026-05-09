import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AdminActivityDashboard from "./AdminActivityDashboard";
import { useAuth, Role } from "../../../contexts/AuthContext";
import * as sdk from "../../../client/sdk.gen";

// Mock the AuthContext
vi.mock("../../../contexts/AuthContext", () => ({
  useAuth: vi.fn(),
  Role: {
    SUPER: "super",
    ADMIN: "admin",
    USER: "user",
  },
}));

// Mock the SDK
vi.mock("../../../client/sdk.gen", () => ({
  readAdminDashboardStatsApiV1AdminDashboardStatsGet: vi.fn(),
}));

describe("AdminActivityDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders access restricted for non-admin users", () => {
    vi.mocked(useAuth).mockReturnValue({
      role: Role.USER,
      token: "fake-token",
      hasPermission: (r: any) => r === Role.USER,
    } as any);

    render(<AdminActivityDashboard />);
    expect(screen.getByText(/Access Restricted/i)).toBeInTheDocument();
  });

  it("fetches and displays data for admin users", async () => {
    const mockData = {
      total_regular_users: 1250,
      total_activities_24h: 342,
      daily_trends: [
        { date: "May 01", count: 120 },
        { date: "May 02", count: 150 },
      ],
      top_active_users: [
        { email: "user1@example.com", name: "User One", count: 45 },
      ],
    };

    vi.mocked(sdk.readAdminDashboardStatsApiV1AdminDashboardStatsGet).mockResolvedValueOnce({
      data: mockData,
      error: null,
    } as any);

    vi.mocked(useAuth).mockReturnValue({
      role: Role.ADMIN,
      token: "fake-token",
      hasPermission: (r: any) => r === Role.ADMIN || r === Role.USER,
    } as any);

    render(<AdminActivityDashboard />);

    await waitFor(() => expect(screen.getByText("1,250")).toBeInTheDocument());
    expect(screen.getByText("Platform Pulse")).toBeInTheDocument();
    expect(screen.getByText("342")).toBeInTheDocument();
    expect(screen.getByText("User One")).toBeInTheDocument();
  });

  it("displays empty state when trends are missing", async () => {
    const mockData = {
      total_regular_users: 10,
      total_activities_24h: 0,
      daily_trends: [],
      top_active_users: [],
    };

    vi.mocked(sdk.readAdminDashboardStatsApiV1AdminDashboardStatsGet).mockResolvedValueOnce({
      data: mockData,
      error: null,
    } as any);

    vi.mocked(useAuth).mockReturnValue({
      role: Role.ADMIN,
      token: "fake-token",
      hasPermission: (r: any) => r === Role.ADMIN || r === Role.USER,
    } as any);

    render(<AdminActivityDashboard />);

    await waitFor(() =>
      expect(screen.getByText(/No Recent Activity/i)).toBeInTheDocument(),
    );
  });
});
