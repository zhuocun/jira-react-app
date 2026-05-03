import {
    clearAiSearchStrengths,
    getAiSearchStrength,
    resetAiSearchStrengthsForTests,
    setAiSearchStrengths
} from "./aiSearchStrength";

describe("aiSearchStrength cache", () => {
    beforeEach(() => {
        resetAiSearchStrengthsForTests();
    });

    it("returns null before any search has run", () => {
        expect(getAiSearchStrength("tasks", "task-1")).toBeNull();
        expect(getAiSearchStrength("projects", "project-1")).toBeNull();
    });

    it("stores per-result strengths from the latest matches", () => {
        setAiSearchStrengths("tasks", [
            { id: "task-1", strength: "strong" },
            { id: "task-2", strength: "moderate" },
            { id: "task-3", strength: "weak" }
        ]);
        expect(getAiSearchStrength("tasks", "task-1")).toBe("strong");
        expect(getAiSearchStrength("tasks", "task-2")).toBe("moderate");
        expect(getAiSearchStrength("tasks", "task-3")).toBe("weak");
    });

    it("treats undefined matches as a clear for that kind", () => {
        setAiSearchStrengths("tasks", [{ id: "task-1", strength: "strong" }]);
        setAiSearchStrengths("tasks", undefined);
        expect(getAiSearchStrength("tasks", "task-1")).toBeNull();
    });

    it("never crosses kinds — projects and tasks with the same id are isolated", () => {
        setAiSearchStrengths("tasks", [
            { id: "shared-id", strength: "strong" }
        ]);
        setAiSearchStrengths("projects", [
            { id: "shared-id", strength: "weak" }
        ]);
        expect(getAiSearchStrength("tasks", "shared-id")).toBe("strong");
        expect(getAiSearchStrength("projects", "shared-id")).toBe("weak");
    });

    it("clears only the requested kind", () => {
        setAiSearchStrengths("tasks", [{ id: "task-1", strength: "strong" }]);
        setAiSearchStrengths("projects", [
            { id: "project-1", strength: "moderate" }
        ]);
        clearAiSearchStrengths("tasks");
        expect(getAiSearchStrength("tasks", "task-1")).toBeNull();
        expect(getAiSearchStrength("projects", "project-1")).toBe("moderate");
    });

    it("replaces stale entries on a fresh search", () => {
        setAiSearchStrengths("tasks", [
            { id: "task-1", strength: "strong" },
            { id: "task-2", strength: "weak" }
        ]);
        setAiSearchStrengths("tasks", [{ id: "task-3", strength: "strong" }]);
        expect(getAiSearchStrength("tasks", "task-1")).toBeNull();
        expect(getAiSearchStrength("tasks", "task-2")).toBeNull();
        expect(getAiSearchStrength("tasks", "task-3")).toBe("strong");
    });
});
