import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

import * as chatEngine from "../ai/chatEngine";

import useAiChat from "./useAiChat";
import useAuth from "./useAuth";

jest.mock("./useAuth");

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const mockApi = jest.fn();

jest.mock("./useApi", () => ({
    __esModule: true,
    default: () => mockApi
}));

const chatCtx = (): Parameters<typeof useAiChat>[0] => ({
    engine: {
        columns: [{ _id: "c1", columnName: "Todo", index: 0, projectId: "p1" }],
        members: [{ _id: "m1", email: "a@b.c", username: "Alice" }],
        project: { _id: "p1", projectName: "Roadmap" },
        tasks: [
            {
                _id: "taskid123456",
                columnId: "c1",
                coordinatorId: "m1",
                epic: "Auth",
                index: 0,
                note: "Note",
                projectId: "p1",
                storyPoints: 3,
                taskName: "Fix login",
                type: "Bug"
            }
        ]
    },
    execution: {
        knownColumnIds: new Set(["c1"]),
        knownMemberIds: new Set(["m1"]),
        knownProjectIds: new Set(["p1"]),
        knownTaskIds: new Set(["taskid123456"]),
        projectId: "p1"
    }
});

const wrapper =
    (queryClient: QueryClient) =>
    ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <MemoryRouter>{children}</MemoryRouter>
        </QueryClientProvider>
    );

describe("useAiChat", () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } }
        });
        localStorage.removeItem("boardCopilot:disabledProjectIds");
        mockedUseAuth.mockReturnValue({
            logout: jest.fn(),
            refreshUser: jest.fn(),
            token: null,
            user: undefined
        });
        mockApi.mockImplementation(async (endpoint: string) => {
            if (endpoint === "projects") {
                return [
                    {
                        _id: "p1",
                        createdAt: "0",
                        managerId: "m1",
                        organization: "Org",
                        projectName: "Roadmap"
                    }
                ];
            }
            if (endpoint === "users/members") {
                return [{ _id: "m1", email: "a@b.c", username: "Alice" }];
            }
            if (endpoint === "boards") {
                return [
                    { _id: "c1", columnName: "Todo", index: 0, projectId: "p1" }
                ];
            }
            if (endpoint === "tasks") {
                return [
                    {
                        _id: "taskid123456",
                        columnId: "c1",
                        coordinatorId: "m1",
                        epic: "Auth",
                        index: 0,
                        note: "",
                        projectId: "p1",
                        storyPoints: 3,
                        taskName: "Fix login",
                        type: "Bug"
                    }
                ];
            }
            return [];
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
        mockApi.mockReset();
    });

    it("does not send and sets error when project AI is disabled", async () => {
        localStorage.setItem(
            "boardCopilot:disabledProjectIds",
            JSON.stringify(["p1"])
        );
        const { result } = renderHook(() => useAiChat(chatCtx()), {
            wrapper: wrapper(queryClient)
        });

        await act(async () => {
            await result.current.send("Hello");
        });

        expect(result.current.messages).toEqual([]);
        expect(result.current.error?.message).toMatch(
            /disabled for this project/i
        );
        expect(mockApi).not.toHaveBeenCalled();
    });

    it("returns a board-style answer from the local engine without calling the API", async () => {
        const { result } = renderHook(() => useAiChat(chatCtx()), {
            wrapper: wrapper(queryClient)
        });

        await act(async () => {
            await result.current.send("Summarize the board");
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });
        expect(mockApi).not.toHaveBeenCalled();
        const assistant = result.current.messages.filter(
            (m) => m.role === "assistant"
        );
        expect(assistant.length).toBe(1);
        expect(assistant[0].content).toMatch(/task on the board/i);
    });

    it("runs listProjects and appends tool output then a final assistant message", async () => {
        const { result } = renderHook(() => useAiChat(chatCtx()), {
            wrapper: wrapper(queryClient)
        });

        await act(async () => {
            await result.current.send("What projects do we have?");
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });
        expect(mockApi).toHaveBeenCalledWith(
            "projects",
            expect.objectContaining({ method: "GET" })
        );
        expect(result.current.messages.some((m) => m.role === "tool")).toBe(
            true
        );
        expect(
            result.current.messages.filter((m) => m.role === "assistant").length
        ).toBeGreaterThanOrEqual(1);
    });

    it("does nothing when user text is blank or context is null", async () => {
        const { result } = renderHook(() => useAiChat(chatCtx()), {
            wrapper: wrapper(queryClient)
        });
        await act(async () => {
            await result.current.send("   ");
        });
        expect(result.current.messages).toEqual([]);

        const nullCtx = renderHook(() => useAiChat(null), {
            wrapper: wrapper(queryClient)
        });
        await act(async () => {
            await nullCtx.result.current.send("Hello");
        });
        expect(nullCtx.result.current.messages).toEqual([]);
    });

    it("shows a fallback assistant message when the model returns tool_calls with no calls", async () => {
        jest.spyOn(chatEngine, "chatAssistantTurn").mockReturnValueOnce({
            kind: "tool_calls",
            toolCalls: []
        });

        const { result } = renderHook(() => useAiChat(chatCtx()), {
            wrapper: wrapper(queryClient)
        });

        await act(async () => {
            await result.current.send("Anything");
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });
        const lastAssistant = [...result.current.messages]
            .reverse()
            .find((m) => m.role === "assistant");
        expect(lastAssistant?.content).toMatch(/unexpected response/i);
    });

    it("clears error state when dismissError is called", async () => {
        const { result } = renderHook(() => useAiChat(chatCtx()), {
            wrapper: wrapper(queryClient)
        });

        act(() => {
            result.current.dismissError();
        });
        expect(result.current.error).toBeNull();
    });
});
