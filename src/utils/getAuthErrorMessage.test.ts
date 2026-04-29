import getAuthErrorMessage from "./getAuthErrorMessage";

describe("getAuthErrorMessage", () => {
    it("prefers the first validation msg when error is an array", () => {
        expect(
            getAuthErrorMessage({
                error: [{ msg: "Email taken" }]
            })
        ).toBe("Email taken");
    });

    it("falls back to nested message extraction", () => {
        expect(
            getAuthErrorMessage({
                message: "Expired session"
            })
        ).toBe("Expired session");
    });

    it("handles plain strings", () => {
        expect(getAuthErrorMessage("Bad request")).toBe("Bad request");
    });
});
