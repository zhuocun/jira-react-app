import { act, renderHook } from "@testing-library/react";

import useReducedMotion from "./useReducedMotion";

type MediaListener = (event: MediaQueryListEvent) => void;

const installMatchMedia = (initiallyReduced: boolean) => {
    const listeners = new Set<MediaListener>();
    const matchMedia = jest.fn((query: string) => ({
        addEventListener: (
            _type: "change",
            listener: MediaListener
        ) => {
            listeners.add(listener);
        },
        removeEventListener: (
            _type: "change",
            listener: MediaListener
        ) => {
            listeners.delete(listener);
        },
        addListener: (listener: MediaListener) => {
            listeners.add(listener);
        },
        removeListener: (listener: MediaListener) => {
            listeners.delete(listener);
        },
        dispatchEvent: jest.fn(),
        matches: initiallyReduced,
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

describe("useReducedMotion", () => {
    it("reports the initial OS preference", () => {
        installMatchMedia(true);
        const { result } = renderHook(() => useReducedMotion());
        expect(result.current).toBe(true);
    });

    it("flips when the OS preference changes", () => {
        const media = installMatchMedia(false);
        const { result } = renderHook(() => useReducedMotion());
        expect(result.current).toBe(false);

        act(() => media.emit(true));
        expect(result.current).toBe(true);

        act(() => media.emit(false));
        expect(result.current).toBe(false);
    });
});
