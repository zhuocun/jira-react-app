import { act, renderHook } from "@testing-library/react";

import useColorScheme from "./useColorScheme";

type MediaListener = (event: MediaQueryListEvent) => void;

const installMatchMedia = (initiallyDark: boolean) => {
    const listeners = new Set<MediaListener>();
    const matchMedia = jest.fn((query: string) => ({
        addEventListener: (_type: "change", listener: MediaListener) => {
            listeners.add(listener);
        },
        removeEventListener: (_type: "change", listener: MediaListener) => {
            listeners.delete(listener);
        },
        addListener: (listener: MediaListener) => {
            listeners.add(listener);
        },
        removeListener: (listener: MediaListener) => {
            listeners.delete(listener);
        },
        dispatchEvent: jest.fn(),
        matches: initiallyDark,
        media: query,
        onchange: null
    }));

    Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: matchMedia
    });

    return {
        emit: (matches: boolean) => {
            listeners.forEach((listener) =>
                listener({ matches } as MediaQueryListEvent)
            );
        }
    };
};

describe("useColorScheme", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("falls back to system preference when no choice is stored", () => {
        installMatchMedia(true);
        const { result } = renderHook(() => useColorScheme());
        expect(result.current.preference).toBe("system");
        expect(result.current.scheme).toBe("dark");
    });

    it("honors an explicit user choice over the OS preference", () => {
        installMatchMedia(true);
        localStorage.setItem("ui:colorScheme", "light");
        const { result } = renderHook(() => useColorScheme());
        expect(result.current.scheme).toBe("light");
    });

    it("updates and broadcasts the preference across instances", () => {
        installMatchMedia(false);
        const first = renderHook(() => useColorScheme());
        const second = renderHook(() => useColorScheme());

        act(() => {
            first.result.current.setPreference("dark");
        });

        expect(first.result.current.preference).toBe("dark");
        expect(second.result.current.preference).toBe("dark");
        expect(localStorage.getItem("ui:colorScheme")).toBe("dark");
    });

    it("re-evaluates on OS preference change while preference is system", () => {
        const media = installMatchMedia(false);
        const { result } = renderHook(() => useColorScheme());
        expect(result.current.scheme).toBe("light");

        act(() => media.emit(true));
        expect(result.current.scheme).toBe("dark");
    });
});
