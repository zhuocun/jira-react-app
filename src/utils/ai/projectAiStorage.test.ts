import {
    isProjectAiDisabled,
    PROJECT_AI_DISABLED_MESSAGE,
    setProjectAiDisabledInStorage,
    subscribeProjectAiDisabled
} from "./projectAiStorage";

describe("projectAiStorage", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("round-trips disabled project ids", () => {
        expect(isProjectAiDisabled("p1")).toBe(false);
        setProjectAiDisabledInStorage("p1", true);
        expect(isProjectAiDisabled("p1")).toBe(true);
        setProjectAiDisabledInStorage("p1", false);
        expect(isProjectAiDisabled("p1")).toBe(false);
    });

    it("notifies subscribers when storage changes", () => {
        const listener = jest.fn();
        const unsub = subscribeProjectAiDisabled(listener);
        setProjectAiDisabledInStorage("p2", true);
        expect(listener).toHaveBeenCalledTimes(1);
        unsub();
        setProjectAiDisabledInStorage("p2", false);
        expect(listener).toHaveBeenCalledTimes(1);
    });

    it("exports a stable disabled message for hooks", () => {
        expect(PROJECT_AI_DISABLED_MESSAGE).toMatch(
            /disabled for this project/i
        );
    });
});
