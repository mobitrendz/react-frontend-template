import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import UserTaskView from "./UserTaskView";
import * as sdk from "../../client/sdk.gen";

vi.mock("../../client/sdk.gen", () => ({
  readTodosApiV1TodosGet: vi.fn(),
  createTodoApiV1TodosPost: vi.fn(),
  updateTodoApiV1TodosIdPatch: vi.fn(),
  deleteTodoApiV1TodosIdDelete: vi.fn(),
}));

describe("UserTaskView", () => {
  const mockTodos = [
    {
      id: "1",
      title: "Task 1",
      description: "Desc 1",
      priority: "high",
      status: "pending",
      due_date_time: "2024-01-01T10:00:00Z",
    },
    {
      id: "2",
      title: "Task 2",
      description: "Desc 2",
      priority: "medium",
      status: "completed",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (sdk.readTodosApiV1TodosGet as any).mockResolvedValue({
      data: { data: mockTodos },
    });
  });

  it("fetches and renders todos on mount", async () => {
    render(<UserTaskView />);

    await waitFor(() => {
      expect(screen.getByText("Task 1")).toBeInTheDocument();
      expect(screen.getByText("Task 2")).toBeInTheDocument();
    });
  });

  it("opens create form when Add Task is clicked", async () => {
    render(<UserTaskView />);
    await waitFor(() => expect(screen.getByText("Task 1")).toBeInTheDocument());

    const addBtn = screen.getByText("Create Task"); // assuming TaskBoard renders this
    fireEvent.click(addBtn);

    expect(screen.getByText("Create New Task")).toBeInTheDocument();
  });

  it("submits a new task successfully", async () => {
    (sdk.createTodoApiV1TodosPost as any).mockResolvedValue({});

    render(<UserTaskView />);
    await waitFor(() => expect(screen.getByText("Task 1")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Create Task"));
    
    // Fill out form
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "New Task Title" } });
    const createBtns = screen.getAllByRole("button", { name: "Create Task" });
    fireEvent.submit(createBtns[createBtns.length - 1]);

    await waitFor(() => {
      expect(sdk.createTodoApiV1TodosPost).toHaveBeenCalledWith({
        body: expect.objectContaining({ title: "New Task Title" }),
      });
      // Should re-fetch
      expect(sdk.readTodosApiV1TodosGet).toHaveBeenCalledTimes(2);
    });
  });

  it("opens edit form and updates a task successfully", async () => {
    (sdk.updateTodoApiV1TodosIdPatch as any).mockResolvedValue({});

    render(<UserTaskView />);
    await waitFor(() => expect(screen.getByText("Task 1")).toBeInTheDocument());

    // Click edit on the first task
    const editBtns = screen.getAllByLabelText("Edit Task");
    fireEvent.click(editBtns[0]);

    expect(screen.getByText("Edit Task")).toBeInTheDocument();
    
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Updated Title" } });
    fireEvent.submit(screen.getByRole("button", { name: "Update Task" }));

    await waitFor(() => {
      expect(sdk.updateTodoApiV1TodosIdPatch).toHaveBeenCalledWith({
        path: { id: "1" },
        body: expect.objectContaining({ title: "Updated Title" }),
      });
    });
  });

  it("toggles task status", async () => {
    (sdk.updateTodoApiV1TodosIdPatch as any).mockResolvedValue({});

    render(<UserTaskView />);
    await waitFor(() => expect(screen.getByText("Task 1")).toBeInTheDocument());

    // Task 1 is pending, so clicking toggle should change it to completed
    // Toggle button is the first button in the TaskCard without aria-label
    // Let's find it by icon or class... or we can just query all buttons and click the first one for Task 1
    const toggleBtn = screen.getAllByRole("button").find(b => b.className.includes("mt-1"));
    if (toggleBtn) fireEvent.click(toggleBtn);

    await waitFor(() => {
      expect(sdk.updateTodoApiV1TodosIdPatch).toHaveBeenCalledWith({
        path: { id: "1" },
        body: { status: "completed" },
      });
    });
  });

  it("deletes a task when confirmed", async () => {
    const originalConfirm = window.confirm;
    window.confirm = vi.fn().mockReturnValue(true);
    (sdk.deleteTodoApiV1TodosIdDelete as any).mockResolvedValue({});

    render(<UserTaskView />);
    await waitFor(() => expect(screen.getByText("Task 1")).toBeInTheDocument());

    const deleteBtns = screen.getAllByLabelText("Delete Task");
    fireEvent.click(deleteBtns[0]);

    await waitFor(() => {
      expect(sdk.deleteTodoApiV1TodosIdDelete).toHaveBeenCalledWith({
        path: { id: "1" },
      });
    });

    window.confirm = originalConfirm;
  });

  it("does not delete if not confirmed", async () => {
    const originalConfirm = window.confirm;
    window.confirm = vi.fn().mockReturnValue(false);

    render(<UserTaskView />);
    await waitFor(() => expect(screen.getByText("Task 1")).toBeInTheDocument());

    const deleteBtns = screen.getAllByLabelText("Delete Task");
    fireEvent.click(deleteBtns[0]);

    expect(sdk.deleteTodoApiV1TodosIdDelete).not.toHaveBeenCalled();

    window.confirm = originalConfirm;
  });
});
