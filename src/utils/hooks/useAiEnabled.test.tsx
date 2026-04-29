import { act, renderHook } from "@testing-library/react";

import useAiEnabled from "./useAiEnabled";

const STORAGE_KEY = "boardCopilot:enabled";

describe("useAiEnabled", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("defaults to enabled and persists changes to localStorage", () => {
        const { result } = renderHook(() => useAiEnabled());
        expect(result.current.enabled).toBe(true);
        expect(result.current.available).toBe(true);

        act(() => {
            result.current.setEnabled(false);
        });
        expect(localStorage.getItem(STORAGE_KEY)).toBe("false");
        expect(result.current.enabled).toBe(false);

        act(() => {
            result.current.setEnabled(true);
        });
        expect(localStorage.getItem(STORAGE_KEY)).toBe("true");
        expect(result.current.enabled).toBe(true);
    });

    it("respects an existing localStorage value", () => {
        localStorage.setItem(STORAGE_KEY, "false");
        const { result } = renderHook(() => useAiEnabled());
        expect(result.current.enabled).toBe(false);
    });

    it("notifies sibling consumers via the toggle event", () => {
        const { result: a } = renderHook(() => useAiEnabled());
        const { result: b } = renderHook(() => useAiEnabled());
        act(() => {
            a.current.setEnabled(false);
        });
        expect(b.current.enabled).toBe(false);
    });

    it("syncs from a storage-backed toggle event without calling setEnabled", () => {
        const { result } = renderHook(() => useAiEnabled());
        expect(result.current.enabled).toBe(true);
        act(() => {
            window.localStorage.setItem(STORAGE_KEY, "false");
            window.dispatchEvent(
                new CustomEvent<boolean>("boardCopilot:toggled", {
                    detail: false
                })
            );
        });
        expect(result.current.enabled).toBe(false);
    });

    it("no-ops setEnabled when window is undefined", () => {
        const originalWindow = global.window;
        // @ts-expect-error simulate non-browser
        delete global.window;

        const { result } = renderHook(() => useAiEnabled());
        act(() => {
            result.current.setEnabled(false);
        });

        global.window = originalWindow;
    });
});
