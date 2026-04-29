import type { AiContextProject } from "../ai/engine";

import { validateResponse } from "./useAi";

const minimalProjectContext = (): AiContextProject => ({
    project: { _id: "p1", projectName: "P" },
    columns: [{ _id: "c1", columnName: "Todo", index: 0, projectId: "p1" }],
    members: [{ _id: "m1", email: "a@b.c", username: "A" }],
    tasks: [
        {
            _id: "t1",
            columnId: "c1",
            coordinatorId: "m1",
            epic: "e",
            index: 0,
            note: "",
            projectId: "p1",
            storyPoints: 1,
            taskName: "T",
            type: "Task"
        }
    ]
});

describe("validateResponse", () => {
    it("returns raw payloads when no validator branch matches", () => {
        const raw = { untouched: true };
        expect(validateResponse("task-draft", raw, {})).toEqual(raw);
    });

    it("validates search results against task ids", () => {
        const ctx = minimalProjectContext();
        const out = validateResponse(
            "search",
            { ids: ["t1", "ghost"], rationale: "ok" },
            {
                search: {
                    kind: "tasks",
                    query: "q",
                    projectContext: ctx
                }
            }
        );
        expect(out).toEqual({ ids: ["t1"], rationale: "ok" });
    });

    it("validates search results against project ids", () => {
        const out = validateResponse(
            "search",
            { ids: ["p1", "x"], rationale: "r" },
            {
                search: {
                    kind: "projects",
                    query: "q",
                    projectsContext: {
                        projects: [
                            {
                                _id: "p1",
                                createdAt: "0",
                                managerId: "m1",
                                organization: "O",
                                projectName: "N"
                            }
                        ],
                        members: []
                    }
                }
            }
        );
        expect(out).toEqual({ ids: ["p1"], rationale: "r" });
    });
});
