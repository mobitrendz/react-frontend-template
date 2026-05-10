import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import AdminDashboardView from "./AdminDashboardView";
import * as sdk from "../../client/sdk.gen";
import { useAuth, Role } from "../../contexts/AuthContext";

vi.mock("../../client/sdk.gen", () => ({
  updateUserApiV1UsersIdPatch: vi.fn(),
  deleteUserApiV1UsersIdDelete: vi.fn(),
  createUserApiV1UsersPost: vi.fn(),
}));

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: vi.fn(),
  Role: {
    SUPER: "SUPER",
    ADMIN: "ADMIN",
    USER: "USER",
  },
}));

// Mock sub-components
vi.mock("./AdminUserTable", () => ({
  default: ({ onToggleStatus, onDeleteUser }: any) => (
    <div data-testid="admin-user-table">
      <button onClick={() => onToggleStatus({ id: "1", is_active: false })}>
        Toggle User
      </button>
      <button onClick={() => onDeleteUser({ id: "2" })}>Delete User</button>
    </div>
  ),
}));
vi.mock("./CreateAdminForm", () => ({
  default: ({ onSubmit, onClose }: any) => (
    <div data-testid="create-admin-form">
      <form onSubmit={onSubmit} aria-label="create-form">
        <button type="submit">Submit Form</button>
      </form>
      <button onClick={onClose}>Close Form</button>
    </div>
  ),
}));
vi.mock("./DeleteUserConfirmModal", () => ({
  default: ({ onConfirm, onClose }: any) => (
    <div data-testid="delete-confirm-modal">
      <button onClick={onConfirm}>Confirm Delete</button>
      <button onClick={onClose}>Cancel Delete</button>
    </div>
  ),
}));
vi.mock("./dashboard/SuperAdminDashboard", () => ({
  default: () => <div data-testid="super-admin-dashboard" />,
}));
vi.mock("./activity/AdminActivityDashboard", () => ({
  default: () => <div data-testid="admin-activity-dashboard" />,
}));

describe("AdminDashboardView", () => {
  const mockCurrentUser = {
    id: "admin-1",
    email: "admin@test.com",
    role: "admin",
    is_active: true,
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      role: Role.SUPER,
      user: mockCurrentUser,
    });
  });

  const renderView = (props = {}) => {
    return render(
      <MemoryRouter>
        <AdminDashboardView currentUser={mockCurrentUser} {...props} />
      </MemoryRouter>,
    );
  };

  it("renders Super User Control Center for SUPER role and intelligence tab by default", () => {
    renderView();
    expect(screen.getByText("Super User Control Center")).toBeInTheDocument();
    expect(screen.getByTestId("super-admin-dashboard")).toBeInTheDocument();
  });

  it("renders Identity & Access for ADMIN role and activity tab by default", () => {
    (useAuth as any).mockReturnValue({
      role: Role.ADMIN,
      user: mockCurrentUser,
    });
    renderView();
    expect(screen.getByText("Identity & Access")).toBeInTheDocument();
    expect(screen.getByTestId("admin-activity-dashboard")).toBeInTheDocument();
  });

  it("switches tabs correctly", () => {
    renderView();
    // initially on intelligence
    expect(screen.getByTestId("super-admin-dashboard")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Activity"));
    expect(screen.getByTestId("admin-activity-dashboard")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Users"));
    expect(screen.getByTestId("admin-user-table")).toBeInTheDocument();
  });

  it("opens CreateAdminForm and creates a user", async () => {
    (sdk.createUserApiV1UsersPost as any).mockResolvedValue({});

    renderView({ initialTab: "users" });

    // Open modal
    fireEvent.click(screen.getByText("Provision Admin"));
    expect(screen.getByTestId("create-admin-form")).toBeInTheDocument();

    // Submit form
    fireEvent.submit(screen.getByRole("form", { name: "create-form" }));

    await waitFor(() => {
      expect(sdk.createUserApiV1UsersPost).toHaveBeenCalled();
      expect(screen.queryByTestId("create-admin-form")).not.toBeInTheDocument();
    });
  });

  it("opens CreateAdminForm and closes it", () => {
    renderView({ initialTab: "users" });

    // Open modal
    fireEvent.click(screen.getByText("Provision Admin"));

    // Close modal
    fireEvent.click(screen.getByText("Close Form"));
    expect(screen.queryByTestId("create-admin-form")).not.toBeInTheDocument();
  });

  it("toggles user status from table", async () => {
    (sdk.updateUserApiV1UsersIdPatch as any).mockResolvedValue({});
    renderView({ initialTab: "users" });

    fireEvent.click(screen.getByText("Toggle User"));

    await waitFor(() => {
      expect(sdk.updateUserApiV1UsersIdPatch).toHaveBeenCalledWith({
        path: { id: "1" },
        body: { is_active: true },
      });
    });
  });

  it("opens delete confirm modal and deletes user", async () => {
    (sdk.deleteUserApiV1UsersIdDelete as any).mockResolvedValue({});
    renderView({ initialTab: "users" });

    // Open modal by clicking delete user in table
    fireEvent.click(screen.getByText("Delete User"));
    expect(screen.getByTestId("delete-confirm-modal")).toBeInTheDocument();

    // Confirm delete
    fireEvent.click(screen.getByText("Confirm Delete"));

    await waitFor(() => {
      expect(sdk.deleteUserApiV1UsersIdDelete).toHaveBeenCalledWith({
        path: { id: "2" },
      });
      expect(
        screen.queryByTestId("delete-confirm-modal"),
      ).not.toBeInTheDocument();
    });
  });

  it("closes delete confirm modal without deleting", () => {
    renderView({ initialTab: "users" });

    // Open modal
    fireEvent.click(screen.getByText("Delete User"));

    // Cancel
    fireEvent.click(screen.getByText("Cancel Delete"));

    expect(sdk.deleteUserApiV1UsersIdDelete).not.toHaveBeenCalled();
    expect(
      screen.queryByTestId("delete-confirm-modal"),
    ).not.toBeInTheDocument();
  });

  describe("Error handling and tab reset", () => {
    it("logs error when status toggle fails", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      (sdk.updateUserApiV1UsersIdPatch as any).mockRejectedValueOnce(
        new Error("Update failed"),
      );

      renderView({ initialTab: "users" });
      fireEvent.click(screen.getByText("Toggle User"));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Failed to toggle status:",
          expect.any(Error),
        );
      });
      consoleSpy.mockRestore();
    });

    it("logs error when user deletion fails", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      (sdk.deleteUserApiV1UsersIdDelete as any).mockRejectedValueOnce(
        new Error("Delete failed"),
      );

      renderView({ initialTab: "users" });
      fireEvent.click(screen.getByText("Delete User"));
      fireEvent.click(screen.getByText("Confirm Delete"));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Failed to delete user:",
          expect.any(Error),
        );
      });
      consoleSpy.mockRestore();
    });

    it("handles admin creation error", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      (sdk.createUserApiV1UsersPost as any).mockRejectedValueOnce({
        body: { detail: "Email already exists" },
      });

      renderView({ initialTab: "users" });
      fireEvent.click(screen.getByText("Provision Admin"));
      fireEvent.submit(screen.getByRole("form", { name: "create-form" }));

      // Verification: error state would be in AdminDashboardView, but it's not exposed to mocks.
      // However, the catch block will run.
      await waitFor(() => {
        expect(sdk.createUserApiV1UsersPost).toHaveBeenCalled();
      });
      consoleSpy.mockRestore();
    });

    it("resets active tab when initialTab is missing and location state is missing", () => {
      // Super admin default tab is 'intelligence'
      renderView({ initialTab: undefined });
      expect(screen.getByTestId("super-admin-dashboard")).toBeInTheDocument();

      // ADMIN default tab is 'activity'
      vi.mocked(useAuth).mockReturnValue({
        role: Role.ADMIN,
        user: mockCurrentUser,
      } as any);
      renderView({ initialTab: undefined });
      expect(
        screen.getByTestId("admin-activity-dashboard"),
      ).toBeInTheDocument();
    });
  });
});
