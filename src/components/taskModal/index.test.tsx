import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Modal } from "antd";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

import TaskModal from ".";

const member = (overrides: Partial<IMember> = {}): IMember => ({
    _id: "member-1",
    email: "alice@example.com",
    username: "Alice",
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
    storyPoints: 3,
    taskName: "Build task",
    type: "Task",
    ...overrides
});

const members = [
    member(),
    member({
        _id: "member-2",
        email: "bob@example.com",
        username: "Bob"
    })
];

const tasks = [
    task(),
    task({
        _id: "task-2",
        coordinatorId: "member-2",
        taskName: "Fix bug",
        type: "Bug"
    })
];

const response = (body: unknown, ok = true) =>
    ({
        json: jest.fn().mockResolvedValue(body),
        ok,
        status: ok ? 200 : 400
    } as unknown as Response);

const installAntdBrowserMocks = () => {
    Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: (query: string) => ({
            addEventListener: jest.fn(),
            addListener: jest.fn(),
            dispatchEvent: jest.fn(),
            matches: false,
            media: query,
            onchange: null,
            removeEventListener: jest.fn(),
            removeListener: jest.fn()
        })
    });

    class ResizeObserverMock {
        observe = jest.fn();

        unobserve = jest.fn();

        disconnect = jest.fn();
    }

    Object.defineProperty(window, "ResizeObserver", {
        writable: true,
        value: ResizeObserverMock
    });
};

const LocationProbe = () => {
    const location = useLocation();

    return <div data-testid="location">{location.search}</div>;
};

const renderModal = (
    options: {
        initialTasks?: ITask[] | undefined;
        route?: string;
    } = {}
) => {
    const route =
        options.route ?? "/projects/project-1/board?editingTaskId=task-1";
    const initialTasks = Object.prototype.hasOwnProperty.call(
        options,
        "initialTasks"
    )
        ? options.initialTasks
        : tasks;
    const queryClient = new QueryClient({
        defaultOptions: {
            mutations: { retry: false },
            queries: { retry: false }
        }
    });
    queryClient.setQueryData("users/members", members);

    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={[route]}>
                <Routes>
                    <Route
                        path="/projects/:projectId/board"
                        element={
                            <>
                                <TaskModal tasks={initialTasks} />
                                <LocationProbe />
                            </>
                        }
                    />
                </Routes>
            </MemoryRouter>
        </QueryClientProvider>
    );
};

describe("TaskModal", () => {
    const fetchMock = jest.spyOn(global, "fetch");

    beforeAll(() => {
        installAntdBrowserMocks();
    });

    beforeEach(() => {
        fetchMock.mockReset();
        fetchMock.mockResolvedValue(response({ _id: "task-1" }));
    });

    afterAll(() => {
        fetchMock.mockRestore();
    });

    it("opens from the URL, populates fields, and renders cached select options", async () => {
        renderModal();

        expect(await screen.findByText("Edit Task")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Build task")).toBeInTheDocument();

        fireEvent.mouseDown(screen.getAllByRole("combobox")[0]);
        expect((await screen.findAllByText("Alice")).length).toBeGreaterThan(0);
        expect((await screen.findAllByText("Bob")).length).toBeGreaterThan(0);

        fireEvent.mouseDown(screen.getAllByRole("combobox")[1]);
        expect((await screen.findAllByText("Task")).length).toBeGreaterThan(0);
        expect((await screen.findAllByText("Bug")).length).toBeGreaterThan(0);
    });

    it("closes without mutation when submitted values are unchanged", async () => {
        renderModal();

        expect(
            await screen.findByDisplayValue("Build task")
        ).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "Submit" }));

        await waitFor(() =>
            expect(screen.getByTestId("location")).toHaveTextContent("")
        );
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("updates a changed task and clears the modal URL state", async () => {
        renderModal();
        const taskNameInput = await screen.findByDisplayValue("Build task");

        fireEvent.change(taskNameInput, {
            target: { value: "Build task details" }
        });
        fireEvent.click(screen.getByRole("button", { name: "Submit" }));

        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
        expect(fetchMock.mock.calls[0][0]).toContain("/api/v1/tasks");
        expect(fetchMock.mock.calls[0][1]).toEqual(
            expect.objectContaining({ method: "PUT" })
        );
        expect(JSON.parse(fetchMock.mock.calls[0][1]?.body as string)).toEqual(
            expect.objectContaining({
                _id: "task-1",
                coordinatorId: "member-1",
                taskName: "Build task details",
                type: "Task"
            })
        );
        await waitFor(() =>
            expect(screen.getByTestId("location")).toHaveTextContent("")
        );
    });

    it("resets and clears the URL when cancelled", async () => {
        renderModal();

        expect(
            await screen.findByDisplayValue("Build task")
        ).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

        await waitFor(() =>
            expect(screen.getByTestId("location")).toHaveTextContent("")
        );
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("confirms before deleting the editing task", async () => {
        const confirmSpy = jest
            .spyOn(Modal, "confirm")
            .mockImplementation((config) => {
                config.onOk?.();
                return {
                    destroy: jest.fn(),
                    update: jest.fn()
                } as ReturnType<typeof Modal.confirm>;
            });
        renderModal();

        expect(
            await screen.findByDisplayValue("Build task")
        ).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "Delete" }));

        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
        expect(confirmSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                content: "This action cannot be undone",
                title: "Are you sure to delete this task?"
            })
        );
        expect(fetchMock.mock.calls[0][0]).toContain(
            "/api/v1/tasks?taskId=task-1"
        );
        expect(fetchMock.mock.calls[0][1]).toEqual(
            expect.objectContaining({ method: "DELETE" })
        );

        confirmSpy.mockRestore();
    });

    it("disables delete when there is no second task or the editing task is mock", async () => {
        const { unmount } = renderModal({ initialTasks: [task()] });

        expect(
            await screen.findByDisplayValue("Build task")
        ).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();

        unmount();
        renderModal({
            initialTasks: [
                task({
                    _id: "mock",
                    taskName: "Optimistic"
                }),
                task({ _id: "task-2" })
            ],
            route: "/projects/project-1/board?editingTaskId=mock"
        });

        expect(
            await screen.findByDisplayValue("Optimistic")
        ).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();
    });

    it("disables delete when the task list is unavailable", async () => {
        renderModal({ initialTasks: undefined });

        expect(await screen.findByText("Edit Task")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();
    });
});
