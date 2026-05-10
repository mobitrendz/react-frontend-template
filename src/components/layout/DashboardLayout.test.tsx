import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import DashboardLayout from "./DashboardLayout";

// Mock Sidebar to test interactions with it
vi.mock("./Sidebar", () => {
  return {
    default: ({ isOpen, onClose }: any) => (
      <div data-testid="sidebar">
        <span>{isOpen ? "Sidebar Open" : "Sidebar Closed"}</span>
        <button data-testid="close-sidebar" onClick={onClose}>Close Sidebar</button>
      </div>
    )
  };
});

describe("DashboardLayout", () => {
  const mockCurrentUser = {
    id: "1",
    email: "test@test.com",
    full_name: "Test User",
    role: "user" as any,
    is_active: true,
  };

  const mockOnLogout = vi.fn();
  const mockOnViewChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children correctly", () => {
    render(
      <DashboardLayout
        currentUser={mockCurrentUser}
        onLogout={mockOnLogout}
        activeView="user"
        onViewChange={mockOnViewChange}
      >
        <div data-testid="child-content">Child Content</div>
      </DashboardLayout>
    );

    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });

  it("opens sidebar when mobile menu button is clicked and closes it when onClose is called", () => {
    render(
      <DashboardLayout
        currentUser={mockCurrentUser}
        onLogout={mockOnLogout}
        activeView="user"
        onViewChange={mockOnViewChange}
      >
        <div>Content</div>
      </DashboardLayout>
    );

    // Initial state: closed
    expect(screen.getByText("Sidebar Closed")).toBeInTheDocument();

    // Find and click the menu button (which has the lucide Menu icon)
    const menuButtons = screen.getAllByRole("button");
    const mobileMenuButton = menuButtons.find(b => b.className.includes("-ml-2")); // based on className in component
    
    if (mobileMenuButton) {
      fireEvent.click(mobileMenuButton);
    }
    
    // Now it should be open
    expect(screen.getByText("Sidebar Open")).toBeInTheDocument();

    // Trigger close from sidebar
    fireEvent.click(screen.getByTestId("close-sidebar"));

    // Should be closed again
    expect(screen.getByText("Sidebar Closed")).toBeInTheDocument();
  });
});
