import { act, renderHook, waitFor } from "@testing-library/react";

jest.mock("../../constants/env", () => ({
    __esModule: true,
    default: {
        aiBaseUrl: "https://copilot.example",
        aiEnabled: true,
        aiUseLocalEngine: false,
        apiBaseUrl: "/api/v1"
    }
}));

// eslint-disable-next-line simple-import-sort/imports
import useAi from "./useAi";

const localContext = (): {
    columns: IColumn[];
    members: IMember[];
    tasks: ITask[];
    project: { _id: string; projectName: string };
} => ({
    columns: [{ _id: "col-1", columnName: "Todo", index: 0, projectId: "p1" }],
    members: [{ _id: "m1", email: "a@b.c", username: "Alice" }],
    project: { _id: "p1", projectName: "Roadmap" },
    tasks: [
        {
            _id: "t1",
            columnId: "col-1",
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
});

describe("useAi remote transport", () => {
    let fetchSpy: jest.SpyInstance;

    beforeEach(() => {
        fetchSpy = jest.spyOn(global, "fetch");
    });

    afterEach(() => {
        fetchSpy.mockRestore();
    });

    it("posts the payload to the configured base URL and validates the response", async () => {
        fetchSpy.mockResolvedValue({
            json: jest.fn().mockResolvedValue({
                columnId: "ghost",
                confidence: 0.9,
                coordinatorId: "ghost",
                epic: "Auth",
                note: "n",
                rationale: "r",
                storyPoints: 3,
                taskName: "Remote draft",
                type: "Task"
            }),
            ok: true,
            status: 200
        } as unknown as Response);

        const { result } = renderHook(() =>
            useAi<IDraftTaskSuggestion>({ route: "task-draft" })
        );

        await act(async () => {
            await result.current.run({
                draft: { prompt: "Hello", context: localContext() }
            });
        });

        expect(fetchSpy).toHaveBeenCalledWith(
            "https://copilot.example/api/ai/task-draft",
            expect.objectContaining({ method: "POST" })
        );
        expect(result.current.data?.taskName).toBe("Remote draft");
        expect(result.current.data?.columnId).toBe("col-1");
        expect(result.current.data?.coordinatorId).toBe("m1");
    });

    it("surfaces remote HTTP errors", async () => {
        fetchSpy.mockResolvedValue({
            json: jest.fn().mockResolvedValue({}),
            ok: false,
            status: 500
        } as unknown as Response);

        const { result } = renderHook(() =>
            useAi<IDraftTaskSuggestion>({ route: "task-draft" })
        );

        let caught: Error | null = null;
        await act(async () => {
            try {
                await result.current.run({
                    draft: { prompt: "Hello", context: localContext() }
                });
            } catch (err) {
                caught = err as Error;
            }
        });
        expect(caught).toBeInstanceOf(Error);
        expect((caught as unknown as Error).message).toMatch(
            /AI request failed/
        );
        await waitFor(() => {
            expect(result.current.error).not.toBeNull();
        });
    });

    it("aborts an in-flight remote request on unmount", async () => {
        fetchSpy.mockImplementation(
            ((_url: string, init?: { signal?: AbortSignal }) =>
                new Promise((_resolve, reject) => {
                    init?.signal?.addEventListener("abort", () =>
                        reject(new DOMException("aborted", "AbortError"))
                    );
                })) as unknown as typeof fetch
        );

        const { result, unmount } = renderHook(() =>
            useAi<IDraftTaskSuggestion>({ route: "task-draft" })
        );
        let promise: Promise<unknown> | undefined;
        act(() => {
            promise = result.current
                .run({ draft: { prompt: "x", context: localContext() } })
                .catch((err) => err);
        });
        unmount();
        const settled = await promise;
        expect((settled as Error).name).toBe("AbortError");
    });

    it("aborts a previous request when run is called again", async () => {
        let pending: Array<{
            resolve: (value: Response) => void;
            signal?: AbortSignal;
        }> = [];
        fetchSpy.mockImplementation(
            ((_url: string, init?: { signal?: AbortSignal }) =>
                new Promise<Response>((resolve, reject) => {
                    pending.push({ resolve, signal: init?.signal });
                    init?.signal?.addEventListener("abort", () =>
                        reject(new DOMException("aborted", "AbortError"))
                    );
                })) as unknown as typeof fetch
        );

        const { result } = renderHook(() =>
            useAi<IDraftTaskSuggestion>({ route: "task-draft" })
        );
        const first = result.current
            .run({ draft: { prompt: "first", context: localContext() } })
            .catch((err) => err);
        const second = result.current
            .run({ draft: { prompt: "second", context: localContext() } })
            .catch((err) => err);
        pending[1].resolve({
            json: jest.fn().mockResolvedValue({
                columnId: "col-1",
                confidence: 0.5,
                coordinatorId: "m1",
                epic: "x",
                note: "n",
                rationale: "r",
                storyPoints: 3,
                taskName: "second",
                type: "Task"
            }),
            ok: true,
            status: 200
        } as unknown as Response);
        await act(async () => {
            await first;
            await second;
        });
        const aborted = (await first) as Error;
        expect(aborted.name).toBe("AbortError");
        expect(result.current.data?.taskName).toBe("second");
        pending = [];
    });
});
