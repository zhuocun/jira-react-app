import getError from "./getError";

describe("getError", () => {
    it("returns the same Error instance", () => {
        const error = new Error("Request failed");

        expect(getError(error)).toBe(error);
    });

    it("wraps string errors in Error instances", () => {
        const error = getError("Not allowed");

        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe("Not allowed");
    });

    it("extracts nested API error messages", () => {
        const error = getError({ error: "Project missing" });

        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe("Project missing");
    });

    it("falls back to a generic message for null and undefined", () => {
        expect(getError(null).message).toBe("Operation failed");
        expect(getError(undefined).message).toBe("Operation failed");
    });
});
