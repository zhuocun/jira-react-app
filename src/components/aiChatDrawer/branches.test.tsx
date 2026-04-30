import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

import type { AiChatMessage } from "../../utils/ai/chatEngine";
import useAuth from "../../utils/hooks/useAuth";

jest.mock("../../utils/hooks/useAiChat", () => ({
    __esModule: true,
    default: jest.fn()
}));

// eslint-disable-next-line simple-import-sort/imports
import useAiChat from "../../utils/hooks/useAiChat";

import AiChatDrawer from ".";

jest.mock("../../utils/hooks/useAuth");

const mockedUseAiChat = useAiChat as jest.MockedFunction<typeof useAiChat>;
const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const baseChat = () => ({
    abort: jest.fn(),
    dismissError: jest.fn(),
    error: null as Error | null,
    isLoading: false,
    messages: [] as AiChatMessage[],
    reset: jest.fn(),
    send: jest.fn(),
    streamingText: ""
});

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

describe("AiChatDrawer UI branches (mocked chat hook)", () => {
    beforeEach(() => {
        mockedUseAuth.mockReturnValue({
            logout: jest.fn(),
            refreshUser: jest.fn(),
            token: null,
            user: undefined
        });
        Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
            configurable: true,
            value: 800
        });
        Object.defineProperty(HTMLTextAreaElement.prototype, "scrollHeight", {
            configurable: true,
            value: 120
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
    });

    const renderDrawer = () =>
        render(
            <QueryClientProvider
                client={
                    new QueryClient({
                        defaultOptions: { queries: { retry: false } }
                    })
                }
            >
                <MemoryRouter>
                    <AiChatDrawer
                        columns={columns}
                        knownProjectIds={["p1"]}
                        members={members}
                        onClose={jest.fn()}
                        open
                        project={project}
                        tasks={tasks}
                    />
                </MemoryRouter>
            </QueryClientProvider>
        );

    it("shows streaming text while loading", () => {
        mockedUseAiChat.mockReturnValue({
            ...baseChat(),
            isLoading: true,
            streamingText: "Working…"
        });
        renderDrawer();
        expect(screen.getByText("Working…")).toBeInTheDocument();
    });

    it("renders tool rows without an explicit tool name once details are revealed", () => {
        mockedUseAiChat.mockReturnValue({
            ...baseChat(),
            messages: [{ role: "tool", content: "payload" }]
        });
        renderDrawer();
        expect(screen.queryByText("tool")).not.toBeInTheDocument();
        fireEvent.click(screen.getByLabelText("Show tool details"));
        expect(screen.getByText("tool")).toBeInTheDocument();
        expect(screen.getByText("payload")).toBeInTheDocument();
    });
});
