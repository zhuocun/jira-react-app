import type { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import App from "../App";
import AppProviders from "../utils/appProviders";

jest.mock("../constants/env", () => ({
    __esModule: true,
    default: {
        apiBaseUrl: "http://localhost:8080/api/v1",
        aiBaseUrl: "",
        aiEnabled: false,
        aiUseLocalEngine: true
    }
}));

type DragDropContextMockProps = {
    children: ReactNode;
    onDragEnd?: unknown;
};

type DraggableProvidedMock = {
    dragHandleProps: Record<string, string>;
    draggableProps: Record<string, string | number>;
    innerRef: jest.Mock;
};

type DraggableMockProps = {
    children: (provided: DraggableProvidedMock) => ReactNode;
    draggableId: string;
    index: number;
    isDragDisabled?: boolean;
};

type DroppableProvidedMock = {
    droppableProps: Record<string, string>;
    innerRef: jest.Mock;
    placeholder: ReactNode;
};

type DroppableMockProps = {
    children: (provided: DroppableProvidedMock) => ReactNode;
    droppableId: string;
};

jest.mock("@hello-pangea/dnd", () => {
    const React = jest.requireActual("react");

    return {
        DragDropContext: ({
            children,
            onDragEnd
        }: DragDropContextMockProps) => (
            <div data-has-drag-end={String(Boolean(onDragEnd))}>{children}</div>
        ),
        Draggable: ({
            children,
            draggableId,
            index,
            isDragDisabled
        }: DraggableMockProps) =>
            children({
                dragHandleProps: {
                    "data-drag-handle-id": draggableId
                },
                draggableProps: {
                    "data-drag-disabled": String(Boolean(isDragDisabled)),
                    "data-draggable-id": draggableId,
                    "data-draggable-index": index
                },
                innerRef: jest.fn()
            }),
        Droppable: ({ children, droppableId }: DroppableMockProps) =>
            children({
                droppableProps: {
                    "data-droppable-id": droppableId
                },
                innerRef: jest.fn(),
                placeholder: React.createElement("span", {
                    "data-testid": `placeholder-${droppableId}`
                })
            })
    };
});

const mockJsonResponse = (body: unknown, ok = true, status = ok ? 200 : 400) =>
    Promise.resolve({
        ok,
        status,
        json: () => Promise.resolve(body)
    } as Response);

const member = (overrides: Partial<IMember> = {}): IMember => ({
    _id: "u1",
    username: "Alice",
    email: "alice@example.com",
    ...overrides
});

const testProject = (overrides: Partial<IProject> = {}): IProject => ({
    _id: "p1",
    projectName: "Alpha",
    managerId: "u1",
    organization: "Eng",
    createdAt: "2026-04-25T00:00:00.000Z",
    ...overrides
});

const testColumn = (overrides: Partial<IColumn> = {}): IColumn => ({
    _id: "c1",
    columnName: "Todo",
    projectId: "p1",
    index: 0,
    ...overrides
});

const testTask = (overrides: Partial<ITask> = {}): ITask => ({
    _id: "t1",
    columnId: "c1",
    coordinatorId: "u1",
    epic: "E1",
    taskName: "First task",
    type: "story",
    note: "",
    projectId: "p1",
    storyPoints: 1,
    index: 0,
    ...overrides
});

const testUser = (): IUser => ({
    ...member(),
    likedProjects: [],
    jwt: "jwt-integration"
});

describe("App integration (full providers + routes)", () => {
    const fetchMock = global.fetch as jest.Mock;

    const renderAppAt = (path: string) => {
        window.history.pushState({}, "Integration", path);
        return render(
            <AppProviders>
                <App />
            </AppProviders>
        );
    };

    beforeAll(() => {
        process.env.REACT_APP_API_URL = "http://localhost:8080";
        process.env.REACT_APP_AI_ENABLED = "false";
    });

    beforeEach(() => {
        fetchMock.mockReset();
        localStorage.clear();
        window.history.pushState({}, "Reset", "/");
    });

    const setupAuthenticatedSessionMocks = () => {
        const user = testUser();
        const proj = testProject();
        const col = testColumn();
        const task = testTask();

        fetchMock.mockImplementation((input: RequestInfo) => {
            const url = typeof input === "string" ? input : input.url;
            const u = new URL(url);
            const path = u.pathname;

            if (path.endsWith("/auth/login")) {
                return mockJsonResponse(user);
            }
            if (path.endsWith("/users") && !path.includes("/members")) {
                return mockJsonResponse(user);
            }
            if (path.endsWith("/users/members")) {
                return mockJsonResponse([member()]);
            }
            if (path.endsWith("/projects")) {
                const projectId = u.searchParams.get("projectId");
                if (projectId === "p1") {
                    return mockJsonResponse(proj);
                }
                return mockJsonResponse([proj]);
            }
            if (path.endsWith("/boards")) {
                return mockJsonResponse([col]);
            }
            if (path.endsWith("/tasks")) {
                return mockJsonResponse([task]);
            }

            return mockJsonResponse({ error: `Unhandled: ${url}` }, false, 404);
        });

        return { user, proj, col, task };
    };

    it("redirects / to /login and shows the login screen", async () => {
        setupAuthenticatedSessionMocks();
        renderAppAt("/");

        await waitFor(() => {
            expect(window.location.pathname).toBe("/login");
        });

        expect(
            screen.getByRole("heading", { name: /log in to your account/i })
        ).toBeInTheDocument();
    });

    it("logs in and navigates to the project list with live data", async () => {
        setupAuthenticatedSessionMocks();
        const user = userEvent.setup();
        renderAppAt("/login");

        await user.type(
            screen.getByPlaceholderText("Email"),
            "alice@example.com"
        );
        await user.type(screen.getByPlaceholderText("Password"), "secret");
        await user.click(screen.getByRole("button", { name: /^log in$/i }));

        await waitFor(() => {
            expect(window.location.pathname).toBe("/projects");
        });

        expect(localStorage.getItem("Token")).toBe("jwt-integration");

        await waitFor(() => {
            expect(
                screen.getByRole("heading", { name: /project list/i })
            ).toBeInTheDocument();
        });

        expect(
            await screen.findByRole(
                "link",
                { name: "Alpha" },
                { timeout: 5000 }
            )
        ).toBeInTheDocument();

        const loginCalls = fetchMock.mock.calls.filter(([req]) =>
            (typeof req === "string" ? req : req.url).includes("/auth/login")
        );
        expect(loginCalls.length).toBeGreaterThanOrEqual(1);
    });

    it("opens the board for a project from the list", async () => {
        setupAuthenticatedSessionMocks();
        const user = userEvent.setup();
        renderAppAt("/login");

        await user.type(
            screen.getByPlaceholderText("Email"),
            "alice@example.com"
        );
        await user.type(screen.getByPlaceholderText("Password"), "secret");
        await user.click(screen.getByRole("button", { name: /^log in$/i }));

        await waitFor(() => {
            expect(window.location.pathname).toBe("/projects");
        });

        await user.click(
            await screen.findByRole(
                "link",
                { name: "Alpha" },
                { timeout: 5000 }
            )
        );

        await waitFor(() => {
            expect(window.location.pathname).toBe("/projects/p1/board");
        });

        await waitFor(() => {
            expect(
                screen.getByRole("heading", { name: /alpha board/i })
            ).toBeInTheDocument();
        });

        expect(screen.getByText("First task")).toBeInTheDocument();
    });

    it("logs out from the header and returns to login", async () => {
        setupAuthenticatedSessionMocks();
        const user = userEvent.setup();
        renderAppAt("/login");

        await user.type(
            screen.getByPlaceholderText("Email"),
            "alice@example.com"
        );
        await user.type(screen.getByPlaceholderText("Password"), "secret");
        await user.click(screen.getByRole("button", { name: /^log in$/i }));

        await waitFor(() => {
            expect(window.location.pathname).toBe("/projects");
        });

        await user.click(
            await screen.findByRole("button", {
                name: /account menu for alice/i
            })
        );

        await user.click(
            await screen.findByRole("button", { name: /^log out$/i })
        );

        await waitFor(() => {
            expect(window.location.pathname).toBe("/login");
        });

        expect(localStorage.getItem("Token")).toBeNull();
    });
});
