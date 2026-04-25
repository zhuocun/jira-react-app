import { projectActions, projectModalSlice } from "./projectModalSlice";

describe("projectModalSlice", () => {
    it("returns the closed initial state", () => {
        expect(
            projectModalSlice.reducer(undefined, { type: "unknown" })
        ).toEqual({
            isModalOpened: false
        });
    });

    it("opens the modal", () => {
        expect(
            projectModalSlice.reducer(undefined, projectActions.openModal())
        ).toEqual({
            isModalOpened: true
        });
    });

    it("closes the modal", () => {
        const openState = { isModalOpened: true };

        expect(
            projectModalSlice.reducer(openState, projectActions.closeModal())
        ).toEqual({
            isModalOpened: false
        });
    });
});
