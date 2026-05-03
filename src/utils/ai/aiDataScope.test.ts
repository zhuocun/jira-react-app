import {
    AI_DATA_SCOPES,
    getAiDataScope,
    sanitizeRemotePayloadForRoute
} from "./aiDataScope";

describe("aiDataScope", () => {
    test("getAiDataScope returns the configured scope per route", () => {
        const draft = getAiDataScope("task-draft");
        expect(draft.sendsNotes).toBe(true);
        expect(draft.items.some((line) => /notes/i.test(line))).toBe(true);

        const brief = getAiDataScope("board-brief");
        expect(brief.sendsNotes).toBe(false);
        expect(brief.items.some((line) => /notes/i.test(line))).toBe(false);
    });

    test("every declared route has a non-empty summary and at least one item", () => {
        for (const [route, scope] of Object.entries(AI_DATA_SCOPES)) {
            expect(scope.summary.length).toBeGreaterThan(0);
            expect(scope.items.length).toBeGreaterThan(0);
            expect(scope.items.every((line) => line.trim().length > 0)).toBe(
                true
            );
            expect(typeof scope.sendsNotes).toBe("boolean");
            // Sanity: route key cannot collide with future literal additions.
            expect(route).toBeTruthy();
        }
    });
});

describe("sanitizeRemotePayloadForRoute", () => {
    const baseTask = {
        _id: "t1",
        taskName: "Investigate flaky login",
        type: "Bug",
        epic: "Auth",
        storyPoints: 3,
        columnId: "c1",
        coordinatorId: "u1",
        note: "Repro on Safari only — see slack thread"
    } as const;

    test("strips note from tasks for routes that don't send notes", () => {
        const payload = {
            brief: {
                context: {
                    project: { _id: "p1", projectName: "Demo" },
                    columns: [],
                    members: [],
                    tasks: [baseTask]
                }
            }
        };
        const sanitized = sanitizeRemotePayloadForRoute("board-brief", payload);
        const task = (
            sanitized.brief as {
                context: { tasks: typeof payload.brief.context.tasks };
            }
        ).context.tasks[0];
        expect("note" in task).toBe(false);
        expect(task._id).toBe("t1");
        // Original payload is untouched (no in-place mutation).
        expect(payload.brief.context.tasks[0].note).toBe(baseTask.note);
    });

    test("preserves note for routes that do send notes", () => {
        const payload = {
            estimate: {
                taskName: "x",
                context: {
                    project: { _id: "p1", projectName: "Demo" },
                    columns: [],
                    members: [],
                    tasks: [baseTask]
                }
            }
        };
        const sanitized = sanitizeRemotePayloadForRoute("estimate", payload);
        const task = (
            sanitized.estimate as {
                context: { tasks: typeof payload.estimate.context.tasks };
            }
        ).context.tasks[0];
        expect(task.note).toBe(baseTask.note);
    });

    test("handles top-level tasks arrays for non-context payloads", () => {
        const payload = {
            search: {
                kind: "tasks",
                query: "login bug",
                tasks: [baseTask]
            }
        };
        // search sends notes, so keep them.
        const passthrough = sanitizeRemotePayloadForRoute("search", payload);
        const task = (
            passthrough.search as { tasks: typeof payload.search.tasks }
        ).tasks[0];
        expect(task.note).toBe(baseTask.note);
    });
});
