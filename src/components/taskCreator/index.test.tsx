import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import TaskCreator from ".";

const member = (overrides: Partial<IMember> = {}): IMember => ({
    _id: "member-1",
    email: "alice@example.com",
    username: "Alice",
    ...overrides
});

const user = (overrides: Partial<IUser> = {}): IUser => ({
    ...member(),
    jwt: "token",
    likedProjects: [],
    ...overrides
});

const response = (body: unknown, ok = true) =>
    ({
        json: jest.fn().mockResolvedValue(body),
        ok,
        status: ok ? 200 : 400
    }) as unknown as Response;

const renderCreator = ({
    disabled = false,
    boardAiOn = true
}: { disabled?: boolean; boardAiOn?: boolean } = {}) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            mutations: { retry: false },
            queries: { retry: false }
        }
    });
    queryClient.setQueryData(["users"], user());

    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={["/projects/project-1/board"]}>
                <Routes>
                    <Route
                        path="/projects/:projectId/board"
                        element={
                            <TaskCreator
                                boardAiOn={boardAiOn}
                                columnId="column-1"
                                disabled={disabled}
                            />
                        }
                    />
                </Routes>
            </MemoryRouter>
        </QueryClientProvider>
    );
};

describe("TaskCreator", () => {
    const fetchMock = jest.spyOn(global, "fetch");

    beforeAll(() => {
        Object.defineProperty(window, "matchMedia", {
            writable: true,
            value: () => ({
                addEventListener: jest.fn(),
                addListener: jest.fn(),
                dispatchEvent: jest.fn(),
                matches: false,
                media: "",
                onchange: null,
                removeEventListener: jest.fn(),
                removeListener: jest.fn()
            })
        });
    });

    beforeEach(() => {
        fetchMock.mockReset();
        fetchMock.mockResolvedValue(
            response({
                _id: "task-1",
                taskName: "New task"
            })
        );
    });

    afterAll(() => {
        fetchMock.mockRestore();
    });

    it("starts in link mode, exits on blur, and clears draft text", () => {
        renderCreator();

        fireEvent.click(screen.getByText("+ Create task"));
        fireEvent.change(
            screen.getByPlaceholderText("What needs to be done?"),
            {
                target: { value: "Draft task" }
            }
        );
        fireEvent.blur(screen.getByPlaceholderText("What needs to be done?"));

        expect(screen.getByText("+ Create task")).toBeInTheDocument();

        fireEvent.click(screen.getByText("+ Create task"));

        expect(
            screen.getByPlaceholderText("What needs to be done?")
        ).toHaveValue("");
    });

    it("creates a task with route, column, current user, and default fields", async () => {
        renderCreator();

        fireEvent.click(screen.getByText("+ Create task"));
        fireEvent.change(
            screen.getByPlaceholderText("What needs to be done?"),
            {
                target: { value: "Investigate outage" }
            }
        );
        fireEvent.keyDown(
            screen.getByPlaceholderText("What needs to be done?"),
            {
                charCode: 13,
                code: "Enter",
                key: "Enter"
            }
        );

        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
        expect(fetchMock.mock.calls[0][0]).toContain("/api/v1/tasks");
        expect(JSON.parse(fetchMock.mock.calls[0][1]?.body as string)).toEqual({
            columnId: "column-1",
            coordinatorId: "member-1",
            epic: "New Feature",
            note: "No note yet",
            projectId: "project-1",
            storyPoints: 1,
            taskName: "Investigate outage",
            type: "Task"
        });
        expect(fetchMock.mock.calls[0][1]).toEqual(
            expect.objectContaining({ method: "POST" })
        );
        expect(screen.getByText("+ Create task")).toBeInTheDocument();
    });

    it("disables the input when the parent column is disabled", () => {
        renderCreator({ disabled: true });

        fireEvent.click(screen.getByText("+ Create task"));

        expect(
            screen.getByPlaceholderText("What needs to be done?")
        ).toBeDisabled();
    });

    it("hides Draft with AI when boardAiOn is false", () => {
        renderCreator({ boardAiOn: false });
        expect(
            screen.queryByLabelText("Draft a task with Board Copilot")
        ).not.toBeInTheDocument();
    });

    it("opens the Board Copilot draft modal from the Draft with AI button", async () => {
        renderCreator();
        fireEvent.click(
            screen.getByLabelText("Draft a task with Board Copilot")
        );
        await waitFor(() =>
            expect(screen.getByLabelText("Task prompt")).toBeInTheDocument()
        );
    });
});
