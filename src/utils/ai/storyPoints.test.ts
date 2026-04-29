import { clampToFibonacci, FIBONACCI_POINTS } from "./storyPoints";

describe("storyPoints", () => {
    it("snaps any positive number to the nearest Fibonacci value", () => {
        expect(clampToFibonacci(1)).toBe(1);
        expect(clampToFibonacci(1.4)).toBe(1);
        expect(clampToFibonacci(2.4)).toBe(2);
        expect(clampToFibonacci(2.6)).toBe(3);
        expect(clampToFibonacci(4)).toBe(3);
        expect(clampToFibonacci(6)).toBe(5);
        expect(clampToFibonacci(10)).toBe(8);
        expect(clampToFibonacci(100)).toBe(13);
    });

    it("returns 1 for non-finite or non-positive input", () => {
        expect(clampToFibonacci(0)).toBe(1);
        expect(clampToFibonacci(-5)).toBe(1);
        expect(clampToFibonacci(Number.NaN)).toBe(1);
        expect(clampToFibonacci(Number.POSITIVE_INFINITY)).toBe(1);
    });

    it("exposes the canonical Fibonacci scale", () => {
        expect(FIBONACCI_POINTS).toEqual([1, 2, 3, 5, 8, 13]);
    });
});
