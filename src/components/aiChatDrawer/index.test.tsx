import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

import useAuth from "../../utils/hooks/useAuth";

import AiChatDrawer from ".";

jest.mock("../../utils/hooks/useAuth");

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const mockApi = jest.fn();

jest.mock("../../utils/hooks/useApi", () => ({
    __esModule: true,
    default: () => mockApi
}));

const installAntdMocks = () => {
    Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
        configurable: true,
        value: 800
    });
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
};

const project: IProject = {
    _id: "p1",
    createdAt: "0",
    managerId: "m1",
    organization: "Org",
    projectName: "Roadmap"
};

const columns: IColumn[] = [
    { _id: "c1", columnName: "Todo", index: 0, projectId: "p1" }
];

const members: IMember[] = [{ _id: "m1", email: "a@b.c", username: "Alice" }];

const tasks: ITask[] = [
    {
        _id: "t1",
        columnId: "c1",
        coordinatorId: "m1",
        epic: "x",
        index: 0,
        note: "",
        projectId: "p1",
        storyPoints: 3,
        taskName: "Fix thing",
        type: "Task"
    }
];

const renderDrawer = (open = true) => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } }
    });
    const onClose = jest.fn();
    mockedUseAuth.mockReturnValue({
        logout: jest.fn(),
        refreshUser: jest.fn(),
        token: null,
        user: undefined
    });
    mockApi.mockResolvedValue([]);

    const utils = render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter>
                <AiChatDrawer
                    columns={columns}
                    knownProjectIds={["p1"]}
                    members={members}
                    onClose={onClose}
                    open={open}
                    project={project}
                    tasks={tasks}
                />
            </MemoryRouter>
        </QueryClientProvider>
    );
    return { ...utils, onClose };
};

describe("AiChatDrawer", () => {
    beforeAll(() => {
        installAntdMocks();
    });

    beforeEach(() => {
        mockApi.mockReset();
        mockApi.mockResolvedValue([]);
    });

    it("shows the empty hint and sends a message that yields an assistant reply", async () => {
        renderDrawer(true);
        expect(screen.getByText(/ask about this board/i)).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText("Message Board Copilot"), {
            target: { value: "Give me a board summary" }
        });
        fireEvent.click(screen.getByLabelText("Send message"));

        await waitFor(() => {
            expect(screen.getByText(/task on the board/i)).toBeInTheDocument();
        });
        expect(mockApi).not.toHaveBeenCalled();
    });

    it("clears the thread when Clear is clicked", async () => {
        renderDrawer(true);
        fireEvent.change(screen.getByLabelText("Message Board Copilot"), {
            target: { value: "Summarize the board" }
        });
        fireEvent.click(screen.getByLabelText("Send message"));
        await waitFor(() => {
            expect(screen.getByText(/task on the board/i)).toBeInTheDocument();
        });

        const clearBtn = screen.getByLabelText("Clear Board Copilot chat");
        expect(clearBtn).not.toBeDisabled();
        fireEvent.click(clearBtn);

        await waitFor(() => {
            expect(
                screen.getByText(/ask about this board/i)
            ).toBeInTheDocument();
        });
    });

    it("calls onClose and resets input when the drawer is closed", async () => {
        const { onClose } = renderDrawer(true);
        fireEvent.change(screen.getByLabelText("Message Board Copilot"), {
            target: { value: "hello" }
        });

        const closeBtn = document.querySelector(
            ".ant-drawer-close"
        ) as HTMLButtonElement | null;
        expect(closeBtn).toBeTruthy();
        fireEvent.click(closeBtn!);

        expect(onClose).toHaveBeenCalled();
    });

    it("does not send on Shift+Enter", () => {
        renderDrawer(true);
        const input = screen.getByLabelText("Message Board Copilot");
        fireEvent.change(input, { target: { value: "line one" } });
        fireEvent.keyDown(input, {
            key: "Enter",
            code: "Enter",
            shiftKey: true
        });
        expect(screen.getByText(/ask about this board/i)).toBeInTheDocument();
    });
});
