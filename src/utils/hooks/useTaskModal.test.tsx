import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";

import useTaskModal from "./useTaskModal";

const TaskModalProbe = () => {
    const { closeModal, editingTaskId, startEditing } = useTaskModal();
    const location = useLocation();

    return (
        <div>
            <span data-testid="editingTaskId">{editingTaskId ?? "null"}</span>
            <span data-testid="search">{location.search}</span>
            <button type="button" onClick={() => startEditing("task-2")}>
                edit
            </button>
            <button type="button" onClick={closeModal}>
                close
            </button>
        </div>
    );
};

const renderTaskModalProbe = (route: string) =>
    render(
        <MemoryRouter initialEntries={[route]}>
            <TaskModalProbe />
        </MemoryRouter>
    );

describe("useTaskModal", () => {
    it("reads the editing task id from the URL", () => {
        renderTaskModalProbe("/projects/p1/board?editingTaskId=task-1");

        expect(screen.getByTestId("editingTaskId")).toHaveTextContent("task-1");
    });

    it("writes and removes the editing task id", async () => {
        renderTaskModalProbe("/projects/p1/board");

        fireEvent.click(screen.getByRole("button", { name: "edit" }));

        await waitFor(() =>
            expect(screen.getByTestId("editingTaskId")).toHaveTextContent(
                "task-2"
            )
        );
        expect(screen.getByTestId("search")).toHaveTextContent(
            "?editingTaskId=task-2"
        );

        fireEvent.click(screen.getByRole("button", { name: "close" }));

        await waitFor(() =>
            expect(screen.getByTestId("editingTaskId")).toHaveTextContent(
                "null"
            )
        );
        expect(screen.getByTestId("search")).toHaveTextContent("");
    });
});
