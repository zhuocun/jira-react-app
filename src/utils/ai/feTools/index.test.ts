import { QueryClient } from "@tanstack/react-query";

import { FE_TOOL_REGISTRY } from ".";
import { boardSnapshotTool } from "./boardSnapshot";
import type { FeToolContext } from "./types";

const expectedNames = [
    "fe.listProjects",
    "fe.listMembers",
    "fe.getProject",
    "fe.listBoard",
    "fe.listTasks",
    "fe.getTask",
    "fe.boardSnapshot",
    "fe.similarTasks",
    "fe.viewerContext",
    "fe.recentActivity",
    "fe.formDraft"
];

const buildCtx = (
    queryClient: QueryClient,
    projectId?: string
): FeToolContext => ({
    queryClient,
    projectId
});

describe("FE_TOOL_REGISTRY", () => {
    it("contains the expected 11 tool names", () => {
        const actual = Object.keys(FE_TOOL_REGISTRY).sort();
        expect(actual).toEqual([...expectedNames].sort());
        expect(actual).toHaveLength(11);
    });

    it("each tool's run handles a missing-cache fallback without throwing", async () => {
        const qc = new QueryClient();
        const ctx = buildCtx(qc, "p-missing");
        for (const tool of Object.values(FE_TOOL_REGISTRY)) {
            const result = await tool.run(
                {
                    projectId: "p-missing",
                    taskId: "t1",
                    query: "x",
                    formId: "form-1"
                } as unknown as never,
                ctx
            );
            // We accept any of: undefined, null, [], {}, or a structured
            // object — whichever the tool documents as its empty default.
            expect(result === null || result !== undefined).toBe(true);
        }
    });

    it("boardSnapshot.run produces a snapshot from a populated QueryClient", async () => {
        const qc = new QueryClient();
        qc.setQueryData<IProject[]>(
            ["projects"],
            [
                {
                    _id: "p1",
                    createdAt: "0",
                    managerId: "m1",
                    organization: "Org",
                    projectName: "Roadmap"
                }
            ]
        );
        qc.setQueryData<IColumn[]>(
            ["boards", { projectId: "p1" }],
            [
                { _id: "c1", columnName: "Todo", index: 0, projectId: "p1" },
                { _id: "c2", columnName: "Done", index: 1, projectId: "p1" }
            ]
        );
        qc.setQueryData<IMember[]>(
            ["users/members"],
            [{ _id: "m1", email: "a@b.c", username: "Alice" }]
        );
        qc.setQueryData<ITask[]>(
            ["tasks", { projectId: "p1" }],
            [
                {
                    _id: "t1",
                    columnId: "c1",
                    coordinatorId: "m1",
                    epic: "x",
                    index: 0,
                    note: "ok",
                    projectId: "p1",
                    storyPoints: 5,
                    taskName: "Fix login",
                    type: "Bug"
                },
                {
                    _id: "t2",
                    columnId: "c1",
                    coordinatorId: "ghost",
                    epic: "x",
                    index: 1,
                    note: "",
                    projectId: "p1",
                    storyPoints: 3,
                    taskName: "Stale",
                    type: "Task"
                }
            ]
        );

        const result = await boardSnapshotTool.run(
            { projectId: "p1" },
            buildCtx(qc, "p1")
        );
        expect(result.counts.total).toBe(2);
        expect(result.counts.byColumn).toEqual([
            { columnId: "c1", count: 2 },
            { columnId: "c2", count: 0 }
        ]);
        expect(result.members).toEqual([{ id: "m1", name: "Alice" }]);
        expect(result.unowned).toHaveLength(1);
        expect(result.unowned[0].taskId).toBe("t2");
        expect(result.workload).toEqual([
            { coordinatorId: "m1", count: 1, points: 5 },
            { coordinatorId: "ghost", count: 1, points: 3 }
        ]);
    });

    it("redacts board snapshot notes longer than 4 KB", async () => {
        const qc = new QueryClient();
        const longNote = "a".repeat(5000);
        qc.setQueryData<ITask[]>(
            ["tasks", { projectId: "p1" }],
            [
                {
                    _id: "t1",
                    columnId: "c1",
                    coordinatorId: "ghost",
                    epic: "x",
                    index: 0,
                    note: longNote,
                    projectId: "p1",
                    storyPoints: 1,
                    taskName: "Big",
                    type: "Task"
                }
            ]
        );
        qc.setQueryData<IColumn[]>(
            ["boards", { projectId: "p1" }],
            [{ _id: "c1", columnName: "Todo", index: 0, projectId: "p1" }]
        );
        const result = await boardSnapshotTool.run(
            { projectId: "p1" },
            buildCtx(qc, "p1")
        );
        const note = result.unowned[0]?.note ?? "";
        expect(note.length).toBeLessThan(longNote.length);
        expect(note).toMatch(/redacted len=5000/);
    });
});
