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

    it("throws AbortError when the signal is already aborted", async () => {
        const api = jest.fn();
        const controller = new AbortController();
        controller.abort();
        await expect(
            executeChatToolCall(
                api,
                ctx,
                { arguments: {}, id: "1", name: "listProjects" },
                controller.signal
            )
        ).rejects.toThrow(/aborted/i);
        expect(api).not.toHaveBeenCalled();
    });

    it("calls listMembers for listMembers", async () => {
        const api = jest.fn().mockResolvedValue([{ _id: "m1", username: "A" }]);
        await executeChatToolCall(
            api,
            ctx,
            { arguments: {}, id: "1", name: "listMembers" },
            new AbortController().signal
        );
        expect(api).toHaveBeenCalledWith("users/members", { method: "GET" });
    });

    it("calls boards for listBoard with a known project", async () => {
        const api = jest.fn().mockResolvedValue([]);
        await executeChatToolCall(
            api,
            ctx,
            {
                arguments: { projectId: "p1" },
                id: "1",
                name: "listBoard"
            },
            new AbortController().signal
        );
        expect(api).toHaveBeenCalledWith("boards", {
            data: { projectId: "p1" },
            method: "GET"
        });
    });

    it("calls projects for getProject with a known id", async () => {
        const api = jest
            .fn()
            .mockResolvedValue({ _id: "p1", projectName: "A" });
        await executeChatToolCall(
            api,
            ctx,
            {
                arguments: { projectId: "p1" },
                id: "1",
                name: "getProject"
            },
            new AbortController().signal
        );
        expect(api).toHaveBeenCalledWith("projects", {
            data: { projectId: "p1" },
            method: "GET"
        });
    });

    it("includes columnId in listTasks when the column is known", async () => {
        const api = jest.fn().mockResolvedValue([]);
        await executeChatToolCall(
            api,
            ctx,
            {
                arguments: {
                    filter: { columnId: "col-1", taskName: "x", type: "Bug" },
                    projectId: "p1"
                },
                id: "1",
                name: "listTasks"
            },
            new AbortController().signal
        );
        expect(api).toHaveBeenCalledWith(
            "tasks",
            expect.objectContaining({
                data: expect.objectContaining({
                    columnId: "col-1",
                    projectId: "p1",
                    taskName: "x",
                    type: "Bug"
                })
            })
        );
    });

    it("includes coordinatorId in listTasks when the member is known", async () => {
        const api = jest.fn().mockResolvedValue([]);
        await executeChatToolCall(
            api,
            ctx,
            {
                arguments: {
                    filter: { coordinatorId: "m1" },
                    projectId: "p1"
                },
                id: "1",
                name: "listTasks"
            },
            new AbortController().signal
        );
        expect(api).toHaveBeenCalledWith("tasks", {
            data: { coordinatorId: "m1", projectId: "p1" },
            method: "GET"
        });
    });

    it("returns an error for unknown projectId on listBoard", async () => {
        const api = jest.fn();
        const out = await executeChatToolCall(
            api,
            ctx,
            {
                arguments: { projectId: "ghost" },
                id: "1",
                name: "listBoard"
            },
            new AbortController().signal
        );
        expect(api).not.toHaveBeenCalled();
        expect(out).toEqual({ error: "Unknown or disallowed projectId" });
    });

    it("returns an error for unknown projectId on listTasks", async () => {
        const api = jest.fn();
        const out = await executeChatToolCall(
            api,
            ctx,
            {
                arguments: { projectId: "ghost" },
                id: "1",
                name: "listTasks"
            },
            new AbortController().signal
        );
        expect(api).not.toHaveBeenCalled();
        expect(out).toEqual({ error: "Unknown or disallowed projectId" });
    });

    it("calls tasks for getTask with a known task id", async () => {
        const api = jest.fn().mockResolvedValue({ _id: "t1", taskName: "T" });
        await executeChatToolCall(
            api,
            ctx,
            {
                arguments: { taskId: "t1" },
                id: "1",
                name: "getTask"
            },
            new AbortController().signal
        );
        expect(api).toHaveBeenCalledWith("tasks", {
            data: { taskId: "t1" },
            method: "GET"
        });
    });

    it("returns an error for unknown taskId on getTask", async () => {
        const api = jest.fn();
        const out = await executeChatToolCall(
            api,
            ctx,
            {
                arguments: { taskId: "ghost" },
                id: "1",
                name: "getTask"
            },
            new AbortController().signal
        );
        expect(api).not.toHaveBeenCalled();
        expect(out).toEqual({ error: "Unknown or disallowed taskId" });
    });

    it("returns an error for unsupported tool names", async () => {
        const api = jest.fn();
        const out = await executeChatToolCall(
            api,
            ctx,
            {
                arguments: {},
                id: "1",
                name: "notARealTool" as never
            },
            new AbortController().signal
        );
        expect(out).toEqual({ error: "Unsupported tool: notARealTool" });
    });
});
