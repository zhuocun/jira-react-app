/* eslint-disable global-require */
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

import useAuth from "./useAuth";

jest.mock("./useAuth");

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const mockApi = jest.fn();

jest.mock("./useApi", () => ({
    __esModule: true,
    default: () => mockApi
}));

const chatCtx = (): Parameters<
    typeof import("./useAiChat").default
>[0] => ({
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
                note: "",
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

describe("useAiChat citations on assistant messages", () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } }
        });
        jest.resetModules();
        jest.doMock("../../constants/env", () => ({
            __esModule: true,
            default: {
                aiBaseUrl: "",
                aiEnabled: true,
                aiUseLocalEngine: true,
                apiBaseUrl: "/api/v1"
            }
        }));
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
        jest.resetModules();
        mockApi.mockReset();
    });

    it("attaches deduped citations from tool results to the final assistant message", async () => {
        const useAiChat = require("./useAiChat").default;

        const { result } = renderHook(() => useAiChat(chatCtx()), {
            wrapper: wrapper(queryClient)
        });

        await act(async () => {
            await result.current.send("What projects do we have?");
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        const assistants = result.current.messages.filter(
            (m) => m.role === "assistant"
        );
        expect(assistants.length).toBeGreaterThanOrEqual(1);
        const lastAssistant = assistants[assistants.length - 1];
        expect(lastAssistant?.citations?.length).toBeGreaterThanOrEqual(1);
        expect(lastAssistant?.citations?.[0]).toMatchObject({
            source: "project",
            id: "p1"
        });
    });
});
