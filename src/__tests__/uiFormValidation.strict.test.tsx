/**
 * Strict form validation tests (TDD harness).
 *
 * Forms across the app currently use only the AntD `required: true` rule
 * for required fields. That rule passes whitespace-only values, lets a
 * 1-character password through on Register, and never trims user input
 * before persisting.
 *
 * The optimization plan §2.A.1 ("Forms") and §3.1 ("Microcopy") together
 * spell out the contract every form must satisfy:
 *
 *   - Required fields reject whitespace-only values (use `whitespace: true`
 *     on the AntD rule, or trim before validation).
 *   - String fields are persisted trimmed — leading / trailing whitespace
 *     never survives a save.
 *   - Register-side passwords have a minimum length (8 chars per the §3.3.8
 *     accessible-authentication guidance).
 *
 * Each test pins one expectation. A failing test means that surface still
 * accepts (and persists) bad input.
 */
/* eslint-disable global-require */
import "@testing-library/jest-dom";

import {
    act,
    fireEvent,
    render,
    screen,
    waitFor
} from "@testing-library/react";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, MemoryRouter, Route, Routes } from "react-router-dom";

import ProjectModal from "../components/projectModal";
import RegisterForm from "../components/registerForm";
import TaskModal from "../components/taskModal";
import { microcopy } from "../constants/microcopy";
import { store } from "../store";
import { projectActions } from "../store/reducers/projectModalSlice";
import useReactMutation from "../utils/hooks/useReactMutation";
import useReactQuery from "../utils/hooks/useReactQuery";
import useTaskModal from "../utils/hooks/useTaskModal";

jest.mock("../utils/hooks/useReactMutation");
jest.mock("../utils/hooks/useReactQuery");
jest.mock("../utils/hooks/useTaskModal");

const mockedUseReactMutation = useReactMutation as jest.MockedFunction<
    typeof useReactMutation
>;
const mockedUseReactQuery = useReactQuery as jest.MockedFunction<
    typeof useReactQuery
>;
const mockedUseTaskModal = useTaskModal as jest.MockedFunction<
    typeof useTaskModal
>;

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

const stubMutation = (mutateAsync: jest.Mock) =>
    ({
        error: null,
        isLoading: false,
        mutate: jest.fn(),
        mutateAsync
    }) as unknown as ReturnType<typeof useReactMutation<unknown>>;

const stubQuery = (data: unknown) =>
    ({
        data,
        error: null,
        isLoading: false,
        isSuccess: true,
        refetch: jest.fn()
    }) as unknown as ReturnType<typeof useReactQuery<unknown>>;

beforeAll(() => {
    installAntdBrowserMocks();
});

const silenceExpectedReactWarnings = () =>
    jest.spyOn(console, "error").mockImplementation((...args) => {
        const message = args.map(String).join(" ");
        // The forms intentionally trigger AntD validation messages from
        // synchronous click handlers; AntD sometimes flushes those updates
        // outside `act`. Suppress only that specific warning so real
        // regressions still surface.
        if (
            message.includes("not wrapped in act") ||
            message.includes("Warning: An update to")
        ) {
            return;
        }
        throw new Error(`Unexpected console.error: ${message}`);
    });

/* -------------------------------------------------------------------------- */
/* 1. ProjectModal — required fields reject whitespace                        */
/* -------------------------------------------------------------------------- */
describe("UI quality :: ProjectModal field hygiene", () => {
    const mutateAsync = jest.fn();

    const renderOpen = () => {
        const queryClient = new QueryClient({
            defaultOptions: {
                mutations: { retry: false },
                queries: { retry: false }
            }
        });

        return render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter initialEntries={["/projects?modal=on"]}>
                        <Routes>
                            <Route
                                path="/projects"
                                element={<ProjectModal />}
                            />
                        </Routes>
                    </MemoryRouter>
                </QueryClientProvider>
            </Provider>
        );
    };

    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        store.dispatch(projectActions.openModal());
        mutateAsync.mockResolvedValue({});
        mockedUseReactMutation.mockReturnValue(stubMutation(mutateAsync));
        mockedUseReactQuery.mockImplementation((endpoint: string) => {
            if (endpoint === "users/members") {
                return stubQuery([member()]);
            }
            return stubQuery(undefined);
        });
        consoleSpy = silenceExpectedReactWarnings();
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    it("rejects a whitespace-only project name and never fires the create mutation", async () => {
        renderOpen();

        await screen.findByRole("dialog");
        await act(async () => {
            fireEvent.change(screen.getByLabelText(/project name/i), {
                target: { value: "    " }
            });
            fireEvent.change(screen.getByLabelText(/organization/i), {
                target: { value: "Finance" }
            });
        });
        await act(async () => {
            fireEvent.click(
                screen.getByRole("button", {
                    name: microcopy.actions.createProject
                })
            );
        });

        // The validation must surface the canonical "Please enter the
        // project name" message and the mutation must not fire — the
        // current rule (`required: true` only) lets the whitespace pass.
        await waitFor(() => {
            expect(
                screen.getByText(microcopy.validation.projectNameRequired)
            ).toBeInTheDocument();
        });
        expect(mutateAsync).not.toHaveBeenCalled();
    });

    it("rejects a whitespace-only organization", async () => {
        renderOpen();

        await screen.findByRole("dialog");
        await act(async () => {
            fireEvent.change(screen.getByLabelText(/project name/i), {
                target: { value: "Atlas" }
            });
            fireEvent.change(screen.getByLabelText(/organization/i), {
                target: { value: "   " }
            });
        });
        await act(async () => {
            fireEvent.click(
                screen.getByRole("button", {
                    name: microcopy.actions.createProject
                })
            );
        });

        await waitFor(() => {
            expect(
                screen.getByText(microcopy.validation.organizationRequired)
            ).toBeInTheDocument();
        });
        expect(mutateAsync).not.toHaveBeenCalled();
    });
});

/* -------------------------------------------------------------------------- */
/* 2. TaskModal — required fields reject whitespace, save trims              */
/* -------------------------------------------------------------------------- */
describe("UI quality :: TaskModal field hygiene", () => {
    const mutateAsync = jest.fn();

    const renderOpen = () => {
        const queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } }
        });
        queryClient.setQueryData(["users/members"], [member()]);

        return render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter initialEntries={["/projects/p1/board"]}>
                        <Routes>
                            <Route
                                path="/projects/:projectId/board"
                                element={<TaskModal tasks={[task()]} />}
                            />
                        </Routes>
                    </MemoryRouter>
                </QueryClientProvider>
            </Provider>
        );
    };

    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        mutateAsync.mockResolvedValue({});
        mockedUseTaskModal.mockReturnValue({
            closeModal: jest.fn(),
            editingTaskId: "task-1",
            startEditing: jest.fn()
        });
        mockedUseReactMutation.mockReturnValue(stubMutation(mutateAsync));
        mockedUseReactQuery.mockImplementation(() => stubQuery([member()]));
        consoleSpy = silenceExpectedReactWarnings();
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    it("rejects a whitespace-only task name on Save", async () => {
        renderOpen();

        const dialog = await screen.findByRole("dialog");

        // Find the task name input by its display value (preset by the form).
        const taskNameInput = screen.getByDisplayValue(
            "Build task"
        ) as HTMLInputElement;
        await act(async () => {
            fireEvent.change(taskNameInput, { target: { value: "   " } });
        });
        const saveBtn = Array.from(
            dialog.querySelectorAll<HTMLButtonElement>("button")
        ).find(
            (btn) => (btn.textContent ?? "").trim() === microcopy.actions.save
        );
        if (!saveBtn) throw new Error("Save button not found");
        await act(async () => {
            fireEvent.click(saveBtn);
        });

        // The mutation must NOT fire for a whitespace-only task name.
        await waitFor(() => {
            expect(mutateAsync).not.toHaveBeenCalled();
        });
    });

    it("trims leading and trailing whitespace from the persisted task name", async () => {
        renderOpen();

        const dialog = await screen.findByRole("dialog");
        const taskNameInput = screen.getByDisplayValue(
            "Build task"
        ) as HTMLInputElement;
        await act(async () => {
            fireEvent.change(taskNameInput, {
                target: { value: "   Plan v2 release   " }
            });
        });
        const saveBtn = Array.from(
            dialog.querySelectorAll<HTMLButtonElement>("button")
        ).find(
            (btn) => (btn.textContent ?? "").trim() === microcopy.actions.save
        );
        if (!saveBtn) throw new Error("Save button not found");
        await act(async () => {
            fireEvent.click(saveBtn);
        });

        await waitFor(() => {
            expect(mutateAsync).toHaveBeenCalled();
        });
        const last = mutateAsync.mock.calls.at(-1)?.[0] as
            | { taskName?: string }
            | undefined;
        expect(last?.taskName).toBe("Plan v2 release");
    });
});

/* -------------------------------------------------------------------------- */
/* 3. RegisterForm — minimum password length, username trim                  */
/* -------------------------------------------------------------------------- */
describe("UI quality :: RegisterForm hygiene", () => {
    const mutateAsync = jest.fn();

    const renderForm = () => {
        mockedUseReactMutation.mockReturnValue(stubMutation(mutateAsync));
        render(
            <BrowserRouter>
                <RegisterForm onError={jest.fn()} />
            </BrowserRouter>
        );
    };

    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        mutateAsync.mockResolvedValue({});
        consoleSpy = silenceExpectedReactWarnings();
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    it("rejects a whitespace-only username so we never persist a blank profile", async () => {
        renderForm();

        await act(async () => {
            fireEvent.change(screen.getByLabelText(/^email$/i), {
                target: { value: "alice@example.com" }
            });
            fireEvent.change(screen.getByLabelText(/^username$/i), {
                target: { value: "   " }
            });
            fireEvent.change(screen.getByLabelText(/^password$/i), {
                target: { value: "longenough" }
            });
        });
        await act(async () => {
            fireEvent.click(
                screen.getByRole("button", { name: microcopy.actions.signUp })
            );
        });

        await waitFor(() => {
            expect(mutateAsync).not.toHaveBeenCalled();
        });
    });

    it("rejects a 4-character password — Register must enforce a minimum length", async () => {
        renderForm();

        await act(async () => {
            fireEvent.change(screen.getByLabelText(/^email$/i), {
                target: { value: "alice@example.com" }
            });
            fireEvent.change(screen.getByLabelText(/^username$/i), {
                target: { value: "alice" }
            });
            fireEvent.change(screen.getByLabelText(/^password$/i), {
                target: { value: "abcd" }
            });
        });
        await act(async () => {
            fireEvent.click(
                screen.getByRole("button", { name: microcopy.actions.signUp })
            );
        });

        // Per §3.3.8 (accessible auth) we want at least 8 chars on
        // register; the existing form has no minimum-length rule.
        await waitFor(() => {
            expect(mutateAsync).not.toHaveBeenCalled();
        });
    });

    it("trims leading/trailing whitespace from the email before submitting", async () => {
        renderForm();

        await act(async () => {
            fireEvent.change(screen.getByLabelText(/^email$/i), {
                target: { value: "  alice@example.com  " }
            });
            fireEvent.change(screen.getByLabelText(/^username$/i), {
                target: { value: "alice" }
            });
            fireEvent.change(screen.getByLabelText(/^password$/i), {
                target: { value: "longenough" }
            });
        });
        await act(async () => {
            fireEvent.click(
                screen.getByRole("button", { name: microcopy.actions.signUp })
            );
        });

        await waitFor(() => {
            expect(mutateAsync).toHaveBeenCalled();
        });
        const last = mutateAsync.mock.calls.at(-1)?.[0] as
            | { email?: string }
            | undefined;
        expect(last?.email).toBe("alice@example.com");
    });
});
