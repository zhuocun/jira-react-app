import { localResolve } from "./useAi";

describe("useAi localResolve", () => {
    it("throws when task search is missing projectContext", () => {
        expect(() =>
            localResolve("search", {
                search: { kind: "tasks", query: "x" }
            })
        ).toThrow(/projectContext required for task search/i);
    });

    it("throws when project search is missing projectsContext", () => {
        expect(() =>
            localResolve("search", {
                search: { kind: "projects", query: "x" }
            })
        ).toThrow(/projectsContext required for project search/i);
    });

    it("throws when readiness payload is missing", () => {
        expect(() => localResolve("readiness", {})).toThrow(
            /readiness payload required/i
        );
    });

    it("throws when estimate payload is missing", () => {
        expect(() => localResolve("estimate", {})).toThrow(
            /estimate payload required/i
        );
    });
});
