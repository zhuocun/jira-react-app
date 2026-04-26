import {
    act,
    fireEvent,
    render,
    screen,
    waitFor
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

import {
    ProjectModalStoreContext,
    projectModalStore
} from "../../store/projectModalStore";

import ProjectModal from ".";

const member = (overrides: Partial<IMember> = {}): IMember => ({
    _id: "member-1",
    email: "alice@example.com",
    username: "Alice",
    ...overrides
});

const project = (overrides: Partial<IProject> = {}): IProject => ({
    _id: "project-1",
    createdAt: "2026-04-25T00:00:00.000Z",
    managerId: "member-1",
    organization: "Product",
    projectName: "Roadmap",
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

const response = (body: unknown, ok = true) =>
    ({
        json: jest.fn().mockResolvedValue(body),
        ok,
        status: ok ? 200 : 400
    }) as unknown as Response;

const silenceExpectedConsoleErrors = (expectedMessages: string[][]) => {
    return jest
        .spyOn(console, "error")
        .mockImplementation((...args: Parameters<typeof console.error>) => {
            const message = args.map(String).join(" ");

            if (
                expectedMessages.some((fragments) =>
                    fragments.every((fragment) => message.includes(fragment))
                )
            ) {
                return;
            }

            throw new Error(`Unexpected console.error: ${message}`);
        });
};

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

const renderProjectModal = (route: string) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            mutations: { retry: false },
            queries: { retry: false }
        }
    });

    return render(
        <ProjectModalStoreContext.Provider value={projectModalStore}>
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={[route]}>
                    <Routes>
                        <Route
                            path="/projects"
                            element={
                                <>
                                    <ProjectModal />
                                    <LocationProbe />
                                </>
                            }
                        />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        </ProjectModalStoreContext.Provider>
    );
};

describe("ProjectModal", () => {
    const fetchMock = jest.spyOn(global, "fetch");
    let consoleErrorSpy: jest.SpyInstance;

    beforeAll(() => {
        installAntdBrowserMocks();
        consoleErrorSpy = silenceExpectedConsoleErrors([
            ["Warning: An update to", "null", "not wrapped in act"],
            ["Warning: An update to", "Field", "not wrapped in act"]
        ]);
    });

    beforeEach(() => {
        projectModalStore.closeModalMobX();
        fetchMock.mockReset();
        fetchMock.mockImplementation((input, init) => {
            const url = String(input);
            const method = init?.method?.toUpperCase() ?? "GET";

            if (url.includes("users/members")) {
                return Promise.resolve(response(members));
            }
            if (url.includes("projects?projectId=project-1")) {
                return Promise.resolve(response(project()));
            }
            if (url.includes("projects") && method === "POST") {
                return Promise.resolve(
                    response({
                        _id: "project-2",
                        ...(JSON.parse(init?.body as string) as object)
                    })
                );
            }
            if (url.includes("projects") && method === "PUT") {
                return Promise.resolve(
                    response(JSON.parse(init?.body as string))
                );
            }

            return Promise.resolve(response({}));
        });
    });

    afterAll(() => {
        consoleErrorSpy.mockRestore();
        fetchMock.mockRestore();
    });

    it("validates required create fields", async () => {
        renderProjectModal("/projects?modal=on");

        expect(await screen.findByText("Create Project")).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "Submit" }));

        expect(
            await screen.findByText("Please enter the project name")
        ).toBeInTheDocument();
        expect(
            screen.getByText("Please enter the organization")
        ).toBeInTheDocument();
        expect(screen.getByText("Please select a manager")).toBeInTheDocument();
    });

    it("creates a project and clears modal URL state on success", async () => {
        renderProjectModal("/projects?modal=on");

        expect(await screen.findByText("Create Project")).toBeInTheDocument();
        fireEvent.change(screen.getByPlaceholderText("Project Name"), {
            target: { value: "Billing" }
        });
        fireEvent.change(screen.getByPlaceholderText("Organization"), {
            target: { value: "Finance" }
        });
        fireEvent.mouseDown(screen.getByRole("combobox"));
        fireEvent.click(await screen.findByText("Alice"));
        fireEvent.click(screen.getByRole("button", { name: "Submit" }));

        await waitFor(() =>
            expect(
                fetchMock.mock.calls.some(
                    ([url, init]) =>
                        String(url).includes("/api/v1/projects") &&
                        init?.method === "POST" &&
                        JSON.parse(init.body as string).projectName ===
                            "Billing"
                )
            ).toBe(true)
        );
        await waitFor(() =>
            expect(screen.getByTestId("location")).toHaveTextContent("")
        );
    });

    it("closes and resets the drawer from the close button", async () => {
        renderProjectModal("/projects?modal=on");

        expect(await screen.findByText("Create Project")).toBeInTheDocument();
        fireEvent.change(screen.getByPlaceholderText("Project Name"), {
            target: { value: "Draft" }
        });
        fireEvent.click(screen.getByRole("button", { name: "Close" }));

        await waitFor(() =>
            expect(screen.getByTestId("location")).toHaveTextContent("")
        );
    });

    it("shows edit loading, populates the form, and updates the project", async () => {
        let resolveProject: (value: Response) => void = () => undefined;
        fetchMock.mockImplementation((input, init) => {
            const url = String(input);
            const method = init?.method?.toUpperCase() ?? "GET";

            if (url.includes("users/members")) {
                return Promise.resolve(response(members));
            }
            if (url.includes("projects?projectId=project-1")) {
                return new Promise<Response>((resolve) => {
                    resolveProject = resolve;
                });
            }
            if (url.includes("projects") && method === "PUT") {
                return Promise.resolve(
                    response(JSON.parse(init?.body as string))
                );
            }

            return Promise.resolve(response({}));
        });
        renderProjectModal("/projects?editingProjectId=project-1");

        await waitFor(() =>
            expect(document.body.querySelector(".ant-spin")).toBeInTheDocument()
        );
        await act(async () => {
            resolveProject(response(project()));
        });

        expect(await screen.findByText("Edit Project")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Roadmap")).toBeInTheDocument();
        fireEvent.change(screen.getByDisplayValue("Product"), {
            target: { value: "Platform" }
        });
        fireEvent.click(screen.getByRole("button", { name: "Submit" }));

        await waitFor(() =>
            expect(
                fetchMock.mock.calls.some(
                    ([url, init]) =>
                        String(url).includes("/api/v1/projects") &&
                        init?.method === "PUT" &&
                        JSON.parse(init.body as string).organization ===
                            "Platform"
                )
            ).toBe(true)
        );
    });
});
