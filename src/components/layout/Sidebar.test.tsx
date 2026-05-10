import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth, Role } from "../../contexts/AuthContext";

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: vi.fn(),
  Role: {
    SUPER: "SUPER",
    ADMIN: "ADMIN",
    USER: "USER",
  },
}));

describe("Sidebar", () => {
  const mockOnLogout = vi.fn();
  const mockOnViewChange = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      hasPermission: vi.fn().mockReturnValue(true),
    });
  });

  const renderSidebar = (props = {}) => {
    return render(
      <MemoryRouter>
        <Sidebar
          userRole="user"
          userName="Test User"
          onLogout={mockOnLogout}
          onViewChange={mockOnViewChange}
          isOpen={true}
          onClose={mockOnClose}
          {...props}
        />
      </MemoryRouter>
    );
  };

  it("renders correctly with user details", () => {
    renderSidebar();
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("user")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("calls onClose when mobile overlay is clicked", () => {
    renderSidebar();
    // The mobile overlay is a div. To find it, let's look for an element with class fixed inset-0
    const overlay = document.querySelector(".fixed.inset-0.bg-black\\/50");
    if (overlay) fireEvent.click(overlay);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("toggles collapse state when collapse button is clicked", () => {
    renderSidebar();
    const collapseBtn = screen.getByText("Collapse Sidebar");
    fireEvent.click(collapseBtn);
    
    // Once collapsed, the text "Collapse Sidebar" should disappear (it's hidden when isCollapsed is true)
    expect(screen.queryByText("Collapse Sidebar")).not.toBeInTheDocument();
    
    // Find the button again (it's the only one with hidden lg:flex... and ChevronRight icon inside)
    // The easiest way is to find it by role or inside the actions div
    const toggleBtns = screen.getAllByRole("button");
    const toggleBtn = toggleBtns.find(btn => btn.className.includes("hidden lg:flex"));
    if (toggleBtn) fireEvent.click(toggleBtn);
    
    // Now it should be back
    expect(screen.getByText("Collapse Sidebar")).toBeInTheDocument();
  });

  it("calls onViewChange and onClose when a link is clicked", () => {
    renderSidebar({ userRole: "SUPER" });
    const usersLink = screen.getByText("Identity & Access");
    fireEvent.click(usersLink);

    expect(mockOnViewChange).toHaveBeenCalledWith("admin");
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("calls onLogout when Sign Out is clicked", () => {
    renderSidebar();
    const signOutBtn = screen.getByText("Sign Out");
    fireEvent.click(signOutBtn);
    expect(mockOnLogout).toHaveBeenCalled();
  });

  it("renders super admin specific name", () => {
    renderSidebar({ userRole: "SUPER" });
    expect(screen.getByText("Super User Control Center")).toBeInTheDocument();
  });

  it("handles missing userName with fallback 'U'", () => {
    renderSidebar({ userName: undefined });
    expect(screen.getByText("U")).toBeInTheDocument();
  });

  it("does not call onViewChange when a link without view is clicked", () => {
    renderSidebar();
    const profileLink = screen.getByText("My Profile");
    fireEvent.click(profileLink);

    expect(mockOnViewChange).not.toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });
});
