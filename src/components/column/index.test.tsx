import { fireEvent, render, screen } from "@testing-library/react";
import { Modal } from "antd";
import type { ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import useReactMutation from "../../utils/hooks/useReactMutation";
import useTaskModal from "../../utils/hooks/useTaskModal";
import { TaskSearchParam } from "../taskSearchPanel";

import Column from ".";

jest.mock("../../utils/hooks/useReactMutation");
jest.mock("../../utils/hooks/useTaskModal");

type DragMockProps = {
    children: ReactNode;
    draggableId: string;
    isDragDisabled?: boolean;
};

type DropMockProps = {
    children: ReactNode;
    droppableId: string;
};

type TaskCreatorMockProps = {
    columnId?: string;
    disabled?: boolean;
};

type DropdownMenuItem = {
    key?: string | number;
    label?: ReactNode;
};

type DropdownMockProps = {
    children: ReactNode;
    menu?: {
        items?: DropdownMenuItem[];
    };
};

jest.mock("../dragAndDrop", () => ({
    Drag: ({ children, draggableId, isDragDisabled }: DragMockProps) => (
        <div data-disabled={String(isDragDisabled)} data-testid={draggableId}>
            {children}
        </div>
    ),
    Drop: ({ children, droppableId }: DropMockProps) => (
        <div data-testid={`drop-${droppableId}`}>{children}</div>
    ),
    DropChild: ({ children }: { children: ReactNode }) => <div>{children}</div>
}));

jest.mock("../taskCreator", () => ({
    __esModule: true,
    default: ({ columnId, disabled }: TaskCreatorMockProps) => (
        <div
            data-column-id={columnId}
            data-disabled={String(disabled)}
            data-testid="task-creator"
        />
    )
}));

jest.mock("antd", () => {
    const actual = jest.requireActual("antd");
    const React = jest.requireActual("react");

    return {
        ...actual,
        Dropdown: ({ children, menu }: DropdownMockProps) =>
            React.createElement(
                "div",
                null,
                children,
                React.createElement(
                    "div",
                    { "data-testid": "dropdown-menu" },
                    menu?.items?.map((item) =>
                        React.createElement(
                            "div",
                            { key: item.key },
                            item.label
                        )
                    )
                )
            )
    };
});

const mockedUseReactMutation = useReactMutation as jest.Mock;
const mockedUseTaskModal = useTaskModal as jest.Mock;

const column = (overrides: Partial<IColumn> = {}): IColumn => ({
    _id: "column-1",
    columnName: "Todo",
    index: 0,
    projectId: "project-1",
    ...overrides
});

const task = (overrides: Partial<ITask> = {}): ITask => ({
    _id: "task-1",
    columnId: "column-1",
    coordinatorId: "member-1",
    epic: "Feature",
    index: 0,
    note: "No note",
    projectId: "project-1",
    storyPoints: 1,
    taskName: "Build task",
    type: "Task",
    ...overrides
});

const defaultParam: TaskSearchParam = {
    coordinatorId: "",
    taskName: "",
    type: ""
};

const removeColumn = jest.fn();
const startEditing = jest.fn();

const renderColumn = ({
    boardColumn = column(),
    isDragDisabled = false,
    param = defaultParam,
    tasks = [
        task(),
        task({
            _id: "task-2",
            coordinatorId: "member-2",
            taskName: "Fix bug",
            type: "Bug"
        }),
        task({
            _id: "mock",
            taskName: "Optimistic task"
        })
    ]
}: {
    boardColumn?: IColumn;
    isDragDisabled?: boolean;
    param?: TaskSearchParam;
    tasks?: ITask[];
} = {}) => {
    mockedUseReactMutation.mockReturnValue({ mutate: removeColumn });
    mockedUseTaskModal.mockReturnValue({ startEditing });

    return render(
        <MemoryRouter initialEntries={["/projects/project-1/board"]}>
            <Routes>
                <Route
                    path="/projects/:projectId/board"
                    element={
                        <Column
                            column={boardColumn}
                            isDragDisabled={isDragDisabled}
                            param={param}
                            tasks={tasks}
                        />
                    }
                />
            </Routes>
        </MemoryRouter>
    );
};

describe("Column", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders the column title, matching task cards, and TaskCreator state", () => {
        renderColumn({
            isDragDisabled: true,
            param: {
                coordinatorId: "member-2",
                taskName: "Fix",
                type: "Bug"
            }
        });

        expect(screen.getByRole("heading", { name: "Todo" })).toHaveStyle({
            textTransform: "uppercase"
        });
        expect(screen.getByText("Fix bug")).toBeInTheDocument();
        expect(screen.queryByText("Build task")).not.toBeInTheDocument();
        expect(screen.getByAltText("Type icon")).toBeInTheDocument();
        expect(screen.getByTestId("task-creator")).toHaveAttribute(
            "data-disabled",
            "true"
        );
        expect(screen.getByTestId("task-creator")).toHaveAttribute(
            "data-column-id",
            "column-1"
        );
    });

    it("starts editing non-mock tasks but ignores mock tasks", () => {
        renderColumn();

        fireEvent.click(screen.getByText("Build task"));
        fireEvent.click(screen.getByText("Optimistic task"));

        expect(startEditing).toHaveBeenCalledTimes(1);
        expect(startEditing).toHaveBeenCalledWith("task-1");
    });

    it("uses the task name as the drag key fallback when a task id is empty", () => {
        renderColumn({
            tasks: [
                task({
                    _id: "",
                    taskName: "Unsaved task"
                })
            ]
        });

        expect(screen.getByText("Unsaved task")).toBeInTheDocument();
        expect(screen.getByTestId("task")).toHaveAttribute(
            "data-disabled",
            "false"
        );
    });

    it("confirms column deletion before calling the delete mutation", () => {
        const confirmSpy = jest
            .spyOn(Modal, "confirm")
            .mockImplementation((config) => {
                config.onOk?.();
                return {
                    destroy: jest.fn(),
                    update: jest.fn()
                } as ReturnType<typeof Modal.confirm>;
            });
        renderColumn();

        fireEvent.click(screen.getByRole("button", { name: "Delete" }));

        expect(confirmSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                content: "This action cannot be undone",
                title: "Are you sure to delete this column?"
            })
        );
        expect(removeColumn).toHaveBeenCalledWith({ columnId: "column-1" });

        confirmSpy.mockRestore();
    });

    it("disables delete for the optimistic mock column", () => {
        const confirmSpy = jest.spyOn(Modal, "confirm");
        renderColumn({ boardColumn: column({ _id: "mock" }) });

        expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();
        fireEvent.click(screen.getByRole("button", { name: "Delete" }));

        expect(confirmSpy).not.toHaveBeenCalled();
        expect(removeColumn).not.toHaveBeenCalled();

        confirmSpy.mockRestore();
    });
});
