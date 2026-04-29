import {
    chatAssistantFinalizeAfterTools,
    chatAssistantTurn
} from "./chatEngine";

const context = {
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
});
