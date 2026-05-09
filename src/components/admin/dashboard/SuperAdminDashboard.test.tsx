import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SuperAdminDashboard from "./SuperAdminDashboard";
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
  readDashboardStatsApiV1DashboardStatsGet: vi.fn(),
}));

describe("SuperAdminDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders access denied for non-super users", () => {
    vi.mocked(useAuth).mockReturnValue({
      role: Role.ADMIN,
      token: "fake-token",
    } as any);

    render(<SuperAdminDashboard />);
    expect(screen.getByText(/Access Denied/i)).toBeInTheDocument();
  });

  it("fetches and displays data for super users", async () => {
    const mockData = {
      user_stats: {
        total_users: 1000,
        active_24h: 150,
        new_registrations_24h: 10,
        growth_pct: 5,
      },
      server_metrics: {
        cpu_usage: 45,
        memory_usage: 60,
        disk_usage: 30,
        uptime_seconds: 3600,
      },
      activity_analytics: {
        success_rate: 98,
        failure_rate: 2,
        top_endpoints: [{ method: "GET", path: "/api/v1/users", hits: 500 }],
      },
    };

    vi.mocked(
      sdk.readDashboardStatsApiV1DashboardStatsGet,
    ).mockResolvedValueOnce({
      data: mockData,
      error: null,
    } as any);

    vi.mocked(useAuth).mockReturnValue({
      role: Role.SUPER,
      token: "fake-token",
    } as any);

    render(<SuperAdminDashboard />);

    await waitFor(() => expect(screen.getByText("1,000")).toBeInTheDocument());
    expect(screen.getByText("System Intelligence")).toBeInTheDocument();
    expect(screen.getByText("45%")).toBeInTheDocument();
    expect(screen.getByText("/api/v1/users")).toBeInTheDocument();
  });

  it("displays error message on fetch failure", async () => {
    vi.mocked(
      sdk.readDashboardStatsApiV1DashboardStatsGet,
    ).mockResolvedValueOnce({
      data: null,
      error: { status: 500 },
    } as any);

    vi.mocked(useAuth).mockReturnValue({
      role: Role.SUPER,
      token: "fake-token",
    } as any);

    render(<SuperAdminDashboard />);

    await waitFor(() =>
      expect(
        screen.getByText(/Failed to fetch dashboard metrics/i),
      ).toBeInTheDocument(),
    );
  });
});
