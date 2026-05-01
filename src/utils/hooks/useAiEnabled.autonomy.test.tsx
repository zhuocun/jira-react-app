import { act, renderHook } from "@testing-library/react";

import { useAutonomyLevel } from "./useAiEnabled";

const STORAGE_KEY = "boardCopilot:autonomy";

describe("useAutonomyLevel", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("defaults to 'plan' when nothing is stored", () => {
        const { result } = renderHook(() => useAutonomyLevel());
        expect(result.current.level).toBe("plan");
    });

    it("persists changes to localStorage", () => {
        const { result } = renderHook(() => useAutonomyLevel());
        act(() => {
            result.current.setLevel("auto");
        });
        expect(localStorage.getItem(STORAGE_KEY)).toBe("auto");
        expect(result.current.level).toBe("auto");

        act(() => {
            result.current.setLevel("suggest");
        });
        expect(localStorage.getItem(STORAGE_KEY)).toBe("suggest");
        expect(result.current.level).toBe("suggest");
    });

    it("respects an existing stored value", () => {
        localStorage.setItem(STORAGE_KEY, "auto");
        const { result } = renderHook(() => useAutonomyLevel());
        expect(result.current.level).toBe("auto");
    });

    it("falls back to 'plan' for an invalid stored value", () => {
        localStorage.setItem(STORAGE_KEY, "totally-bogus");
        const { result } = renderHook(() => useAutonomyLevel());
        expect(result.current.level).toBe("plan");
    });

    it("syncs sibling consumers via the autonomy event", () => {
        const { result: a } = renderHook(() => useAutonomyLevel());
        const { result: b } = renderHook(() => useAutonomyLevel());
        act(() => {
            a.current.setLevel("auto");
        });
        expect(b.current.level).toBe("auto");
    });

    it("ignores invalid values passed to setLevel", () => {
        const { result } = renderHook(() => useAutonomyLevel());
        act(() => {
            // @ts-expect-error invalid by design — we want to assert it's ignored
            result.current.setLevel("invalid-mode");
        });
        expect(result.current.level).toBe("plan");
    });
});
