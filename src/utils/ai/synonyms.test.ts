import { describeExpansions, expandWithSynonyms } from "./synonyms";

describe("expandWithSynonyms", () => {
    it("adds known synonyms to the token set", () => {
        const { expanded, additions } = expandWithSynonyms(
            new Set(["backlog"])
        );
        expect(expanded.has("todo")).toBe(true);
        expect(expanded.has("inbox")).toBe(true);
        expect(expanded.has("queue")).toBe(true);
        expect(additions.get("backlog")).toContain("todo");
    });

    it("does not duplicate tokens already present in the input", () => {
        const { expanded, additions } = expandWithSynonyms(
            new Set(["backlog", "todo"])
        );
        // `backlog` would normally add `todo`, but the user already typed it
        // so the additions list shouldn't double-count.
        expect([...expanded].filter((token) => token === "todo")).toHaveLength(
            1
        );
        const backlogAdds = additions.get("backlog") ?? [];
        expect(backlogAdds).not.toContain("todo");
    });

    it("returns the input unchanged when no synonyms apply", () => {
        const tokens = new Set(["unique", "phrase"]);
        const { expanded, additions } = expandWithSynonyms(tokens);
        expect([...expanded].sort()).toEqual([...tokens].sort());
        expect(additions.size).toBe(0);
    });

    it("expands estimation terms (points → estimate, size, effort)", () => {
        const { expanded } = expandWithSynonyms(new Set(["points"]));
        expect(expanded.has("estimate")).toBe(true);
        expect(expanded.has("size")).toBe(true);
        expect(expanded.has("effort")).toBe(true);
    });
});

describe("describeExpansions", () => {
    it("formats one line per originating term", () => {
        const additions = new Map<string, string[]>([
            ["backlog", ["todo", "inbox"]],
            ["bug", ["defect", "issue"]]
        ]);
        const lines = describeExpansions(additions);
        expect(lines).toEqual(["backlog → todo, inbox", "bug → defect, issue"]);
    });

    it("caps the output at three lines so helper text stays scannable", () => {
        const additions = new Map<string, string[]>([
            ["a", ["x"]],
            ["b", ["x"]],
            ["c", ["x"]],
            ["d", ["x"]],
            ["e", ["x"]]
        ]);
        expect(describeExpansions(additions)).toHaveLength(3);
    });

    it("returns an empty list when there are no additions", () => {
        expect(describeExpansions(new Map())).toEqual([]);
    });
});
