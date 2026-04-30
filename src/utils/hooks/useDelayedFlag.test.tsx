import { act, renderHook } from "@testing-library/react";

import useDelayedFlag from "./useDelayedFlag";

describe("useDelayedFlag", () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("returns false until the flag stays true past the delay", () => {
        const { result, rerender } = renderHook(
            ({ flag }) => useDelayedFlag(flag, 250),
            { initialProps: { flag: false } }
        );

        expect(result.current).toBe(false);

        rerender({ flag: true });
        expect(result.current).toBe(false);

        act(() => {
            jest.advanceTimersByTime(249);
        });
        expect(result.current).toBe(false);

        act(() => {
            jest.advanceTimersByTime(2);
        });
        expect(result.current).toBe(true);
    });

    it("resets to false when the flag drops before the delay elapses", () => {
        const { result, rerender } = renderHook(
            ({ flag }) => useDelayedFlag(flag, 250),
            { initialProps: { flag: true } }
        );

        act(() => {
            jest.advanceTimersByTime(100);
        });
        rerender({ flag: false });
        expect(result.current).toBe(false);

        act(() => {
            jest.advanceTimersByTime(500);
        });
        expect(result.current).toBe(false);
    });
});
