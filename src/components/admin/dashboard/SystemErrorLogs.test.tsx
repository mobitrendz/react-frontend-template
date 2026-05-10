import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import SystemErrorLogs from "./SystemErrorLogs";
import { readSystemLogsApiV1AdminDashboardLogsGet } from "../../../client/sdk.gen";
import { AuthProvider } from "../../../contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the SDK
vi.mock("../../../client/sdk.gen", () => ({
  readSystemLogsApiV1AdminDashboardLogsGet: vi.fn(),
}));

// Mock useAuth
vi.mock("../../../contexts/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    token: "fake-token",
    role: "SUPER",
  })),
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  Role: {
    SUPER: "SUPER",
    ADMIN: "ADMIN",
    USER: "USER",
  },
}));

const mockLogs = {
  data: {
    data: [
      {
        id: "1",
        level: "ERROR",
        message: "Connection failed",
        method: "GET",
        path: "/api/v1/users",
        status_code: 500,
        stack_trace: "Error: Connection failed\n  at index.js:10:5",
        created_at: "2026-05-10T20:00:00Z",
        user_id: "user-123",
      },
      {
        id: "2",
        level: "CRITICAL",
        message: "Database corrupted",
        method: "POST",
        path: "/api/v1/admin/setup",
        status_code: 503,
        stack_trace: "Fatal: Database corrupted",
        created_at: "2026-05-10T21:00:00Z",
      },
    ],
    count: 2,
  },
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
};

describe("SystemErrorLogs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state then logs", async () => {
    vi.mocked(readSystemLogsApiV1AdminDashboardLogsGet).mockResolvedValue(
      mockLogs as any,
    );

    renderWithProviders(<SystemErrorLogs />);

    expect(screen.getByPlaceholderText(/Search logs/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Connection failed")).toBeInTheDocument();
      expect(screen.getByText("Database corrupted")).toBeInTheDocument();
    });

    expect(screen.getByText("ERROR")).toBeInTheDocument();
    expect(screen.getByText("CRITICAL")).toBeInTheDocument();
  });

  it("filters logs by search term", async () => {
    vi.mocked(readSystemLogsApiV1AdminDashboardLogsGet).mockResolvedValue(
      mockLogs as any,
    );

    renderWithProviders(<SystemErrorLogs />);

    await waitFor(() => {
      expect(screen.getByText("Connection failed")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search logs/i);
    fireEvent.change(searchInput, { target: { value: "Database" } });

    expect(screen.queryByText("Connection failed")).not.toBeInTheDocument();
    expect(screen.getByText("Database corrupted")).toBeInTheDocument();
  });

  it("filters logs by level", async () => {
    vi.mocked(readSystemLogsApiV1AdminDashboardLogsGet).mockResolvedValue(
      mockLogs as any,
    );

    renderWithProviders(<SystemErrorLogs />);

    await waitFor(() => {
      expect(screen.getByText("Connection failed")).toBeInTheDocument();
    });

    const levelSelect = screen.getByRole("combobox");
    fireEvent.change(levelSelect, { target: { value: "CRITICAL" } });

    expect(screen.queryByText("Connection failed")).not.toBeInTheDocument();
    expect(screen.getByText("Database corrupted")).toBeInTheDocument();
  });

  it("expands log to show stack trace", async () => {
    vi.mocked(readSystemLogsApiV1AdminDashboardLogsGet).mockResolvedValue(
      mockLogs as any,
    );

    renderWithProviders(<SystemErrorLogs />);

    await waitFor(() => {
      expect(screen.getByText("Connection failed")).toBeInTheDocument();
    });

    // Initially stack trace is hidden
    expect(screen.queryByText(/at index.js:10:5/)).not.toBeInTheDocument();

    // Click to expand
    fireEvent.click(screen.getByText("Connection failed"));

    expect(screen.getByText(/at index.js:10:5/)).toBeInTheDocument();
    expect(screen.getByText("Execution Context")).toBeInTheDocument();
    expect(screen.getByText("User Details")).toBeInTheDocument();
  });

  it("handles refresh", async () => {
    vi.mocked(readSystemLogsApiV1AdminDashboardLogsGet).mockResolvedValue(
      mockLogs as any,
    );

    renderWithProviders(<SystemErrorLogs />);

    await waitFor(() => {
      expect(screen.getByText("Connection failed")).toBeInTheDocument();
    });

    const refreshButton = screen.getByTitle("Refresh Logs");
    fireEvent.click(refreshButton);

    expect(readSystemLogsApiV1AdminDashboardLogsGet).toHaveBeenCalledTimes(2);
  });

  it("displays error message on fetch failure", async () => {
    vi.mocked(readSystemLogsApiV1AdminDashboardLogsGet).mockResolvedValue({
      error: { message: "Failed" },
    } as any);

    renderWithProviders(<SystemErrorLogs />);

    await waitFor(() => {
      expect(
        screen.getByText(/Failed to fetch system logs/i),
      ).toBeInTheDocument();
    });
  });
});
