import { summarizeToolResultForUser } from "./chatEngine";

describe("summarizeToolResultForUser edge cases", () => {
    it("returns error string from object payloads", () => {
        expect(
            summarizeToolResultForUser("listProjects", {
                error: "Upstream failure"
            })
        ).toBe("Upstream failure");
    });

    it("returns no tasks match for empty listTasks arrays", () => {
        expect(summarizeToolResultForUser("listTasks", [])).toBe(
            "No tasks match."
        );
    });

    it("falls back to JSON for malformed listBoard payloads", () => {
        expect(
            summarizeToolResultForUser("listBoard", "not-an-array" as never)
        ).toContain("not-an-array");
    });

    it("falls back for malformed getTask payloads", () => {
        expect(
            summarizeToolResultForUser("getTask", { foo: "bar" } as never)
        ).toContain("foo");
    });

    it("falls back for malformed getProject payloads", () => {
        expect(summarizeToolResultForUser("getProject", [] as never)).toMatch(
            /\[/
        );
    });

    it("falls back for malformed listMembers payloads", () => {
        expect(summarizeToolResultForUser("listMembers", {} as never)).toMatch(
            /\{/
        );
    });

    it("formats getTask without a trailing note line", () => {
        expect(
            summarizeToolResultForUser("getTask", {
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
            })
        ).toMatch(/Work/);
    });
});
