import {
    chatAssistantFinalizeAfterTools,
    chatAssistantTurn,
    summarizeToolResultForUser
} from "./chatEngine";

const context = {
    columns: [{ _id: "col-1", columnName: "Todo", index: 0, projectId: "p1" }],
    members: [{ _id: "m1", email: "a@b.c", username: "Alice" }],
    project: { _id: "p1", projectName: "Roadmap" },
    tasks: [
        {
            _id: "taskid123456",
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
};

describe("chatAssistantTurn", () => {
    it("requests listProjects for project-list style prompts", () => {
        const turn = chatAssistantTurn(
            [{ content: "List all projects", role: "user" }],
            context
        );
        expect(turn.kind).toBe("tool_calls");
        if (turn.kind === "tool_calls") {
            expect(turn.toolCalls[0].name).toBe("listProjects");
        }
    });

    it("returns board brief text for generic prompts", () => {
        const turn = chatAssistantTurn(
            [{ content: "Give me a standup summary", role: "user" }],
            context
        );
        expect(turn.kind).toBe("text");
        if (turn.kind === "text") {
            expect(turn.text).toContain("task");
        }
    });

    it("finalizes with tool message content after tools run", () => {
        const text = chatAssistantFinalizeAfterTools([
            { content: "List members", role: "user" },
            { content: "• **Alice** (`m1`)", role: "tool" }
        ]);
        expect(text).toContain("Alice");
    });

    it("handles threads that start without a user message", () => {
        const turn = chatAssistantTurn(
            [{ content: "orphan tool output", role: "tool" }],
            context
        );
        expect(turn.kind).toBe("text");
        if (turn.kind === "text") {
            expect(turn.text.length).toBeGreaterThan(0);
        }
    });

    it("returns empty finalize text when there is no user message", () => {
        expect(chatAssistantFinalizeAfterTools([])).toBe("");
    });

    it("returns a fallback when there are no tool results after the user", () => {
        expect(
            chatAssistantFinalizeAfterTools([
                { content: "Hello", role: "user" }
            ])
        ).toBe("The requested data could not be loaded.");
    });

    it("requests listBoard for board structure prompts", () => {
        const turn = chatAssistantTurn(
            [{ content: "What columns are on the board?", role: "user" }],
            context
        );
        expect(turn.kind).toBe("tool_calls");
        if (turn.kind === "tool_calls") {
            expect(turn.toolCalls[0].name).toBe("listBoard");
        }
    });

    it("requests listMembers for team-style prompts", () => {
        const turn = chatAssistantTurn(
            [{ content: "Who is on the team?", role: "user" }],
            context
        );
        expect(turn.kind).toBe("tool_calls");
        if (turn.kind === "tool_calls") {
            expect(turn.toolCalls[0].name).toBe("listMembers");
        }
    });

    it("requests listTasks for task count style prompts", () => {
        const turn = chatAssistantTurn(
            [{ content: "How many tasks are there?", role: "user" }],
            context
        );
        expect(turn.kind).toBe("tool_calls");
        if (turn.kind === "tool_calls") {
            expect(turn.toolCalls[0].name).toBe("listTasks");
        }
    });

    it("requests getTask when the prompt references a known task id", () => {
        const turn = chatAssistantTurn(
            [
                {
                    content: "Show me task taskid123456 details",
                    role: "user"
                }
            ],
            context
        );
        expect(turn.kind).toBe("tool_calls");
        if (turn.kind === "tool_calls") {
            expect(turn.toolCalls[0].name).toBe("getTask");
        }
    });

    it("extends brief answers with unowned and workload sections when asked", () => {
        const ctx = {
            ...context,
            tasks: [
                ...context.tasks,
                {
                    _id: "t2",
                    columnId: "col-1",
                    coordinatorId: "ghost",
                    epic: "x",
                    index: 1,
                    note: "",
                    projectId: "p1",
                    storyPoints: 2,
                    taskName: "Nobody owns this",
                    type: "Task"
                },
                {
                    _id: "t3",
                    columnId: "col-1",
                    coordinatorId: "m1",
                    epic: "x",
                    index: 2,
                    note: "",
                    projectId: "p1",
                    storyPoints: 8,
                    taskName: "Heavy lift",
                    type: "Task"
                }
            ],
            members: [
                ...context.members,
                { _id: "m2", email: "b@b.c", username: "Bob" }
            ]
        };
        const unownedTurn = chatAssistantTurn(
            [{ content: "Which tasks are unowned?", role: "user" }],
            ctx
        );
        expect(unownedTurn.kind).toBe("text");
        if (unownedTurn.kind === "text") {
            expect(unownedTurn.text).toMatch(/Unowned:/i);
        }

        const workloadTurn = chatAssistantTurn(
            [
                {
                    content:
                        "How is workload and story points distributed across people?",
                    role: "user"
                }
            ],
            ctx
        );
        expect(workloadTurn.kind).toBe("text");
        if (workloadTurn.kind === "text") {
            expect(workloadTurn.text).toMatch(/Workload:/i);
        }
    });
});

describe("summarizeToolResultForUser", () => {
    it("returns a friendly message for empty project lists", () => {
        expect(summarizeToolResultForUser("listProjects", [])).toBe(
            "No projects found."
        );
    });

    it("formats listMembers and getProject payloads", () => {
        expect(
            summarizeToolResultForUser("listMembers", [
                { _id: "m1", email: "a@b.c", username: "Pat" }
            ])
        ).toMatch(/Pat/);
        expect(
            summarizeToolResultForUser("getProject", {
                _id: "p1",
                createdAt: "0",
                managerId: "m1",
                organization: "Org",
                projectName: "Alpha"
            })
        ).toMatch(/Alpha/);
    });

    it("formats listBoard, listTasks, and getTask payloads", () => {
        expect(
            summarizeToolResultForUser("listBoard", [
                { _id: "c1", columnName: "Todo", index: 1, projectId: "p1" },
                { _id: "c2", columnName: "Done", index: 0, projectId: "p1" }
            ])
        ).toMatch(/Todo/);
        expect(
            summarizeToolResultForUser("listTasks", [
                {
                    _id: "t1",
                    columnId: "c1",
                    coordinatorId: "m1",
                    epic: "e",
                    index: 0,
                    note: "",
                    projectId: "p1",
                    storyPoints: 2,
                    taskName: "Work",
                    type: "Task"
                }
            ])
        ).toMatch(/Work/);
        expect(
            summarizeToolResultForUser("getTask", {
                _id: "t1",
                columnId: "c1",
                coordinatorId: "m1",
                epic: "e",
                index: 0,
                note: "Extra",
                projectId: "p1",
                storyPoints: 2,
                taskName: "Work",
                type: "Task"
            })
        ).toMatch(/Extra/);
    });

    it("falls back to JSON for unexpected payloads", () => {
        const payload = { hello: "world" };
        expect(summarizeToolResultForUser("listProjects", payload)).toContain(
            "hello"
        );
    });

    it("truncates very large JSON payloads", () => {
        const huge = { blob: "x".repeat(5000) };
        const text = summarizeToolResultForUser("listProjects", huge);
        expect(text.length).toBeLessThanOrEqual(4100);
        expect(text).toContain("truncated");
    });

    it("falls back when JSON.stringify fails", () => {
        const circular: Record<string, unknown> = {};
        circular.self = circular;
        const text = summarizeToolResultForUser(
            "listProjects",
            circular as unknown
        );
        expect(text.length).toBeGreaterThan(0);
    });
});
