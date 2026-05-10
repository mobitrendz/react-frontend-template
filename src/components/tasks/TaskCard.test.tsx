import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import TaskCard from "./TaskCard";

describe("TaskCard", () => {
  const mockTodo = {
    id: "1",
    title: "Test Task",
    description: "This is a test task",
    priority: "high" as any,
    status: "pending" as any,
    due_date_time: "2023-12-31T23:59:59Z",
    owner_id: "user1",
  };

  const mockOnToggle = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders task details correctly", () => {
    render(
      <TaskCard
        todo={mockTodo}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText("Test Task")).toBeInTheDocument();
    expect(screen.getByText("This is a test task")).toBeInTheDocument();
    expect(screen.getByText("high")).toBeInTheDocument();
    expect(screen.getByText("pending")).toBeInTheDocument();
    const expectedDate = new Date("2023-12-31T23:59:59Z").toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    expect(screen.getByText(expectedDate)).toBeInTheDocument();
  });

  it("renders fallback text if no description provided", () => {
    const todoWithoutDesc = { ...mockTodo, description: null };
    render(
      <TaskCard
        todo={todoWithoutDesc}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText("No description provided.")).toBeInTheDocument();
  });

  it("calls onToggle when circle button is clicked", () => {
    render(
      <TaskCard
        todo={mockTodo}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // The button wraps the lucide icon. Let's find it by role or inside structure.
    const toggleButtons = screen.getAllByRole("button");
    // Usually the first button is toggle, second is edit, third is delete.
    fireEvent.click(toggleButtons[0]);
    expect(mockOnToggle).toHaveBeenCalledWith(mockTodo);
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it("calls onEdit when edit button is clicked", () => {
    render(
      <TaskCard
        todo={mockTodo}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editBtn = screen.getByLabelText("Edit Task");
    fireEvent.click(editBtn);
    expect(mockOnEdit).toHaveBeenCalledWith(mockTodo);
  });

  it("calls onDelete when delete button is clicked", () => {
    render(
      <TaskCard
        todo={mockTodo}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteBtn = screen.getByLabelText("Delete Task");
    fireEvent.click(deleteBtn);
    expect(mockOnDelete).toHaveBeenCalledWith("1");
  });

  it("renders correctly when task is completed", () => {
    const completedTodo = { ...mockTodo, status: "completed" as any };
    render(
      <TaskCard
        todo={completedTodo}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText("completed")).toBeInTheDocument();
  });
});
