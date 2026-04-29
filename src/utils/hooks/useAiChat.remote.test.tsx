import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

jest.mock("../../constants/env", () => ({
    __esModule: true,
    default: {
        aiBaseUrl: "https://copilot.example",
        aiEnabled: true,
        aiUseLocalEngine: false,
        apiBaseUrl: "/api/v1"
    }
}));

jest.mock("./useAuth");

// eslint-disable-next-line simple-import-sort/imports
import useAiChat from "./useAiChat";
import useAuth from "./useAuth";

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
        tasks: []
    },
    execution: {
        knownColumnIds: new Set(["c1"]),
        knownMemberIds: new Set(["m1"]),
        knownProjectIds: new Set(["p1"]),
        knownTaskIds: new Set(),
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

describe("useAiChat remote transport", () => {
    let queryClient: QueryClient;
    let fetchSpy: jest.SpyInstance;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } }
        });
        mockedUseAuth.mockReturnValue({
            logout: jest.fn(),
            refreshUser: jest.fn(),
            token: null,
            user: undefined
        });
        mockApi.mockResolvedValue([]);
        fetchSpy = jest.spyOn(global, "fetch");
    });

    afterEach(() => {
        fetchSpy.mockRestore();
        mockApi.mockReset();
    });

    it("posts to the remote chat endpoint and renders the assistant reply", async () => {
        fetchSpy.mockResolvedValue({
            json: jest.fn().mockResolvedValue({
                kind: "text",
                text: "Hello from the proxy."
            }),
            ok: true,
            status: 200
        } as unknown as Response);

        const { result } = renderHook(() => useAiChat(chatCtx()), {
            wrapper: wrapper(queryClient)
        });

        await act(async () => {
            await result.current.send("Hi");
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(fetchSpy).toHaveBeenCalledWith(
            "https://copilot.example/api/ai/chat",
            expect.objectContaining({
                method: "POST",
                headers: { "Content-Type": "application/json" }
            })
        );
        const assistant = result.current.messages.filter(
            (m) => m.role === "assistant"
        );
        expect(assistant[assistant.length - 1]?.content).toBe(
            "Hello from the proxy."
        );
    });

    it("surfaces 429 as the busy message", async () => {
        fetchSpy.mockResolvedValue({
            json: jest.fn(),
            ok: false,
            status: 429
        } as unknown as Response);

        const { result } = renderHook(() => useAiChat(chatCtx()), {
            wrapper: wrapper(queryClient)
        });

        await act(async () => {
            await result.current.send("Hi");
        });

        await waitFor(() => {
            expect(result.current.error?.message).toMatch(/busy/i);
        });
    });

    it("surfaces generic HTTP failures from the remote chat endpoint", async () => {
        fetchSpy.mockResolvedValue({
            json: jest.fn(),
            ok: false,
            status: 503
        } as unknown as Response);

        const { result } = renderHook(() => useAiChat(chatCtx()), {
            wrapper: wrapper(queryClient)
        });

        await act(async () => {
            await result.current.send("Hi");
        });

        await waitFor(() => {
            expect(result.current.error?.message).toMatch(/AI request failed/i);
        });
    });
});
