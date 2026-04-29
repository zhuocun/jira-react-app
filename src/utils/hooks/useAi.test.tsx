import { act, renderHook } from "@testing-library/react";

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

describe("useAi local engine", () => {
    beforeEach(() => {
        localStorage.removeItem("boardCopilot:disabledProjectIds");
    });

    it("resolves a task draft locally", async () => {
        const { result } = renderHook(() =>
            useAi<IDraftTaskSuggestion>({ route: "task-draft" })
        );

        let suggestion: IDraftTaskSuggestion | undefined;
        await act(async () => {
            suggestion = await result.current.run({
                draft: {
                    prompt: "Investigate flaky login on Safari",
                    context: localContext()
                }
            });
        });

        expect(suggestion?.taskName.length).toBeGreaterThan(0);
        expect(result.current.data).toEqual(suggestion);
        expect(result.current.error).toBeNull();
        expect(result.current.isLoading).toBe(false);
    });

    it("validates suggestions against the cached context", async () => {
        const { result } = renderHook(() =>
            useAi<IDraftTaskSuggestion>({ route: "task-draft" })
        );

        await act(async () => {
            await result.current.run({
                draft: {
                    prompt: "Generic task",
                    columnId: "ghost-column",
                    coordinatorId: "ghost-member",
                    context: localContext()
                }
            });
        });

        expect(result.current.data?.columnId).toBe("col-1");
        expect(result.current.data?.coordinatorId).toBe("m1");
    });

    it("supports breakdown, estimate, readiness, and brief routes", async () => {
        const breakdown = renderHook(() =>
            useAi<ITaskBreakdownSuggestion>({ route: "task-breakdown" })
        );
        await act(async () => {
            await breakdown.result.current.run({
                draft: { prompt: "Build dashboard", context: localContext() }
            });
        });
        expect(breakdown.result.current.data?.items.length).toBeGreaterThan(0);

        const estimateHook = renderHook(() =>
            useAi<IEstimateSuggestion>({ route: "estimate" })
        );
        await act(async () => {
            await estimateHook.result.current.run({
                estimate: {
                    taskName: "Login regression",
                    tasks: localContext().tasks,
                    context: localContext()
                }
            });
        });
        expect(estimateHook.result.current.data?.storyPoints).toBeDefined();

        const readinessHook = renderHook(() =>
            useAi<IReadinessReport>({ route: "readiness" })
        );
        await act(async () => {
            await readinessHook.result.current.run({
                readiness: {
                    taskName: "X",
                    context: localContext()
                }
            });
        });
        expect(
            readinessHook.result.current.data?.issues.length
        ).toBeGreaterThan(0);

        const briefHook = renderHook(() =>
            useAi<IBoardBrief>({ route: "board-brief" })
        );
        await act(async () => {
            await briefHook.result.current.run({
                brief: { context: localContext() }
            });
        });
        expect(briefHook.result.current.data?.headline.length).toBeGreaterThan(
            0
        );
    });

    it("resolves semantic search for tasks locally", async () => {
        const { result } = renderHook(() =>
            useAi<ISearchResult>({ route: "search" })
        );
        await act(async () => {
            await result.current.run({
                search: {
                    kind: "tasks",
                    query: "login bug",
                    projectContext: localContext()
                }
            });
        });
        expect(result.current.data?.ids).toContain("t1");
        expect(result.current.error).toBeNull();
    });

    it("resolves semantic search for projects locally", async () => {
        const { result } = renderHook(() =>
            useAi<ISearchResult>({ route: "search" })
        );
        await act(async () => {
            await result.current.run({
                search: {
                    kind: "projects",
                    query: "roadmap product",
                    projectsContext: {
                        projects: [
                            {
                                _id: "p1",
                                createdAt: "2026-01-01",
                                managerId: "m1",
                                organization: "Product",
                                projectName: "Roadmap app"
                            }
                        ],
                        members: localContext().members
                    }
                }
            });
        });
        expect(result.current.data?.ids).toEqual(["p1"]);
    });

    it("throws when project AI is disabled for that context", async () => {
        localStorage.setItem(
            "boardCopilot:disabledProjectIds",
            JSON.stringify(["p1"])
        );
        const { result } = renderHook(() =>
            useAi<IDraftTaskSuggestion>({ route: "task-draft" })
        );

        await expect(
            act(async () => {
                await result.current.run({
                    draft: {
                        prompt: "x",
                        context: localContext()
                    }
                });
            })
        ).rejects.toThrow(/disabled for this project/i);
    });

    it("resets state on demand", async () => {
        const { result } = renderHook(() =>
            useAi<IDraftTaskSuggestion>({ route: "task-draft" })
        );

        await act(async () => {
            await result.current.run({
                draft: { prompt: "first", context: localContext() }
            });
        });
        act(() => result.current.reset());
        expect(result.current.data).toBeUndefined();
        expect(result.current.error).toBeNull();
        expect(result.current.isLoading).toBe(false);
    });

    it("rejects on missing payload for each route", async () => {
        for (const route of [
            "task-draft",
            "task-breakdown",
            "estimate",
            "readiness",
            "board-brief",
            "search"
        ] as const) {
            const { result } = renderHook(() => useAi({ route }));
            await expect(
                act(async () => result.current.run({}))
            ).rejects.toBeInstanceOf(Error);
        }
    });

    it("rejects unknown routes through the local resolver", async () => {
        const { result } = renderHook(() => useAi({ route: "ghost" as never }));
        await expect(
            act(async () => result.current.run({}))
        ).rejects.toBeInstanceOf(Error);
    });
});
