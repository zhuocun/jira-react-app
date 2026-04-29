import { jaccard, tokenize, tokenSet } from "./keywords";

describe("keywords", () => {
    it("tokenizes by stripping stopwords, short tokens, and punctuation", () => {
        expect(tokenize("Fix the flaky login on Safari!")).toEqual([
            "fix",
            "flaky",
            "login",
            "safari"
        ]);
    });

    it("returns an empty array for empty input", () => {
        expect(tokenize("")).toEqual([]);
        expect(tokenize(undefined as unknown as string)).toEqual([]);
    });

    it("builds a token set", () => {
        const set = tokenSet("Fix login Safari login");
        expect(Array.from(set).sort()).toEqual(["fix", "login", "safari"]);
    });

    it("computes Jaccard similarity", () => {
        const a = new Set(["a", "b", "c"]);
        const b = new Set(["b", "c", "d"]);
        expect(jaccard(a, b)).toBeCloseTo(2 / 4);
    });

    it("returns 0 when both sets are empty", () => {
        expect(jaccard(new Set(), new Set())).toBe(0);
    });

    it("returns 0 when union is empty due to filtering", () => {
        const a = new Set<string>();
        const b = new Set<string>();
        expect(jaccard(a, b)).toBe(0);
    });
});
