import getError from "./getError";

describe("getError", () => {
    it("returns the same Error instance", () => {
        const error = new Error("Request failed");

        expect(getError(error)).toBe(error);
    });

    it("wraps string errors with Object", () => {
        const error = getError("Not allowed");

        expect(error).toBeInstanceOf(String);
        expect(Object.prototype.toString.call(error)).toBe("[object String]");
        expect(error.valueOf()).toBe("Not allowed");
    });

    it("returns object errors through Object without cloning them", () => {
        const error = { error: "Project missing" };

        expect(getError(error)).toBe(error);
    });

    it("wraps null and undefined as empty objects", () => {
        expect(getError(null)).toEqual({});
        expect(getError(undefined)).toEqual({});
    });
});
