import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import TaskForm from "./TaskForm";

describe("TaskForm", () => {
  const defaultProps = {
    title: "Test Title",
    description: "Test Desc",
    priority: "medium" as any,
    status: "pending" as any,
    dueDate: "2023-12-31T10:00",
    isEditing: false,
    isSubmitting: false,
    onClose: vi.fn(),
    onSubmit: vi.fn((e) => e.preventDefault()),
    onTitleChange: vi.fn(),
    onDescriptionChange: vi.fn(),
    onPriorityChange: vi.fn(),
    onStatusChange: vi.fn(),
    onDueDateChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly for creating a task", () => {
    render(<TaskForm {...defaultProps} />);
    expect(screen.getByText("Create New Task")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create Task" }),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test Title")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test Desc")).toBeInTheDocument();
  });

  it("renders correctly for editing a task", () => {
    render(<TaskForm {...defaultProps} isEditing={true} />);
    expect(screen.getByText("Edit Task")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Update Task" }),
    ).toBeInTheDocument();
  });

  it("calls onChange handlers when inputs change", () => {
    render(<TaskForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "New Title" },
    });
    expect(defaultProps.onTitleChange).toHaveBeenCalledWith("New Title");

    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "New Desc" },
    });
    expect(defaultProps.onDescriptionChange).toHaveBeenCalledWith("New Desc");

    fireEvent.change(screen.getByLabelText(/Priority/i), {
      target: { value: "high" },
    });
    expect(defaultProps.onPriorityChange).toHaveBeenCalledWith("high");

    fireEvent.change(screen.getByLabelText(/Status/i), {
      target: { value: "completed" },
    });
    expect(defaultProps.onStatusChange).toHaveBeenCalledWith("completed");

    fireEvent.change(screen.getByLabelText(/Due Date/i), {
      target: { value: "2024-01-01T10:00" },
    });
    expect(defaultProps.onDueDateChange).toHaveBeenCalledWith(
      "2024-01-01T10:00",
    );
  });

  it("calls onClose when cancel or X is clicked", () => {
    render(<TaskForm {...defaultProps} />);

    fireEvent.click(screen.getByText("Cancel"));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);

    // The X button is the first button without text content
    const closeBtn = screen.getAllByRole("button")[0];
    fireEvent.click(closeBtn);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(2);
  });

  it("calls onSubmit when form is submitted", () => {
    render(<TaskForm {...defaultProps} />);
    fireEvent.submit(screen.getByRole("button", { name: "Create Task" }));
    expect(defaultProps.onSubmit).toHaveBeenCalled();
  });

  it("shows processing state when isSubmitting is true", () => {
    render(<TaskForm {...defaultProps} isSubmitting={true} />);
    expect(
      screen.getByRole("button", { name: "Processing..." }),
    ).toBeDisabled();
  });
});
