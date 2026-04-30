import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";

jest.mock("../../utils/hooks/useAi", () => ({
    __esModule: true,
    default: jest.fn()
}));

// eslint-disable-next-line simple-import-sort/imports
import useAi from "../../utils/hooks/useAi";

import AiTaskAssistPanel from ".";

const mockedUseAi = useAi as jest.MockedFunction<typeof useAi>;

describe("AiTaskAssistPanel effect error handling", () => {
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
        jest.useFakeTimers();
        // The component renders a warning Alert when `useAi.error` is set, not
        // when `run()` rejects. Mock both so the assertion can see the text.
        mockedUseAi.mockImplementation(() => ({
            abort: jest.fn(),
            data: undefined,
            error: new Error("offline"),
            isLoading: false,
            reset: jest.fn(),
            run: jest.fn().mockRejectedValue(new Error("offline"))
        }));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("keeps the effect resilient and surfaces warnings when estimate and readiness fail", async () => {
        const queryClient = new QueryClient();
        queryClient.setQueryData(
            ["users/members"],
            [{ _id: "m1", email: "a@b.c", username: "Alice" }]
        );
        queryClient.setQueryData(
            ["boards", { projectId: "p1" }],
            [{ _id: "c1", columnName: "Todo", index: 0, projectId: "p1" }]
        );
        queryClient.setQueryData(["tasks", { projectId: "p1" }], []);

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={["/projects/p1/board"]}>
                    <Routes>
                        <Route
                            path="/projects/:projectId/board"
                            element={
                                <AiTaskAssistPanel
                                    onApplyStoryPoints={jest.fn()}
                                    onApplySuggestion={jest.fn()}
                                    onOpenSimilarTask={jest.fn()}
                                    values={{ taskName: "Hello world task" }}
                                />
                            }
                        />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );

        jest.advanceTimersByTime(1000);
        await waitFor(() => {
            expect(mockedUseAi).toHaveBeenCalled();
        });
        expect(screen.getAllByText("offline")).toHaveLength(2);
    });
});
