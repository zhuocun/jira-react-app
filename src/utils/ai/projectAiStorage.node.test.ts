/**
 * @jest-environment node
 */
import {
    isProjectAiDisabled,
    setProjectAiDisabledInStorage,
    subscribeProjectAiDisabled
} from "./projectAiStorage";

describe("projectAiStorage (Node environment)", () => {
    it("returns a noop unsubscribe when window is undefined", () => {
        const unsub = subscribeProjectAiDisabled(jest.fn());
        expect(unsub()).toBeUndefined();
    });

    it("treats missing window as empty disabled set", () => {
        expect(isProjectAiDisabled("p1")).toBe(false);
    });

    it("no-ops writes when window is undefined", () => {
        setProjectAiDisabledInStorage("p9", true);
        expect(isProjectAiDisabled("p9")).toBe(false);
    });
});
