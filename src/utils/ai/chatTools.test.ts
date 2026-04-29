import { executeChatToolCall } from "./chatTools";

describe("executeChatToolCall", () => {
    const ctx = {
        knownColumnIds: new Set(["col-1"]),
        knownMemberIds: new Set(["m1"]),
        knownProjectIds: new Set(["p1"]),
        knownTaskIds: new Set(["t1"]),
        projectId: "p1"
    };

    it("calls projects list for listProjects", async () => {
        const api = jest
            .fn()
            .mockResolvedValue([{ _id: "p1", projectName: "A" }]);
        const out = await executeChatToolCall(
            api,
            ctx,
            {
                arguments: {},
                id: "1",
                name: "listProjects"
            },
            new AbortController().signal
        );
        expect(api).toHaveBeenCalledWith("projects", {
            data: {},
            method: "GET"
        });
        expect(out).toEqual([{ _id: "p1", projectName: "A" }]);
    });

    it("rejects unknown projectId for getProject", async () => {
        const api = jest.fn();
        const out = await executeChatToolCall(
            api,
            ctx,
            {
                arguments: { projectId: "ghost" },
                id: "1",
                name: "getProject"
            },
            new AbortController().signal
        );
        expect(api).not.toHaveBeenCalled();
        expect(out).toEqual({ error: "Unknown or disallowed projectId" });
    });

    it("filters listTasks coordinatorId to known members only", async () => {
        const api = jest.fn().mockResolvedValue([]);
        await executeChatToolCall(
            api,
            ctx,
            {
                arguments: {
                    filter: { coordinatorId: "ghost" },
                    projectId: "p1"
                },
                id: "1",
                name: "listTasks"
            },
            new AbortController().signal
        );
        expect(api).toHaveBeenCalledWith("tasks", {
            data: { projectId: "p1" },
            method: "GET"
        });
    });
});
