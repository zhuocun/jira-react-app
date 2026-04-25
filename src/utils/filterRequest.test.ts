import filterRequest from "./filterRequest";

describe("filterRequest", () => {
    it("removes void request values while keeping meaningful falsy and structured values", () => {
        const nested = { active: true };
        const list = ["member-1"];
        const params = {
            missing: undefined,
            empty: "",
            nullable: null,
            notANumber: Number.NaN,
            zero: 0,
            enabled: false,
            search: "roadmap",
            list,
            nested
        };

        const result = filterRequest(params);

        expect(result).toEqual({
            zero: 0,
            enabled: false,
            search: "roadmap",
            list,
            nested
        });
    });

    it("mutates and returns the same object", () => {
        const params = {
            projectName: "Jira clone",
            assigneeId: ""
        };

        const result = filterRequest(params);

        expect(result).toBe(params);
        expect(params).toEqual({ projectName: "Jira clone" });
    });
});
