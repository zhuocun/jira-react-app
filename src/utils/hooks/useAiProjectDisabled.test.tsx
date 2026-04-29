import { act, renderHook } from "@testing-library/react";

import { setProjectAiDisabledInStorage } from "../ai/projectAiStorage";

import useAiProjectDisabled from "./useAiProjectDisabled";

describe("useAiProjectDisabled", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("reflects localStorage for the given project id", () => {
        setProjectAiDisabledInStorage("proj-a", true);
        const { result } = renderHook(() => useAiProjectDisabled("proj-a"));
        expect(result.current.disabled).toBe(true);
    });

    it("updates when another hook instance toggles the same project", () => {
        const a = renderHook(() => useAiProjectDisabled("proj-b"));
        const b = renderHook(() => useAiProjectDisabled("proj-b"));
        expect(a.result.current.disabled).toBe(false);
        act(() => {
            a.result.current.setDisabled(true);
        });
        expect(b.result.current.disabled).toBe(true);
    });

    it("does not toggle when projectId is missing", () => {
        const { result } = renderHook(() => useAiProjectDisabled(null));
        act(() => {
            result.current.setDisabled(true);
        });
        expect(result.current.disabled).toBe(false);
    });
});
