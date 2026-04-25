import { act, renderHook } from "@testing-library/react";

import useDebounce from "./useDebounce";

describe("useDebounce", () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it("returns the initial value immediately", () => {
        const { result } = renderHook(() => useDebounce("roadmap", 500));

        expect(result.current).toBe("roadmap");
    });

    it("updates only after the configured delay", () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value, 500),
            {
                initialProps: {
                    value: "roadmap"
                }
            }
        );

        rerender({ value: "billing" });

        expect(result.current).toBe("roadmap");

        act(() => {
            jest.advanceTimersByTime(499);
        });

        expect(result.current).toBe("roadmap");

        act(() => {
            jest.advanceTimersByTime(1);
        });

        expect(result.current).toBe("billing");
    });

    it("cancels the previous timeout when the value changes quickly", () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value, 500),
            {
                initialProps: {
                    value: "roadmap"
                }
            }
        );

        rerender({ value: "billing" });
        act(() => {
            jest.advanceTimersByTime(300);
        });
        rerender({ value: "checkout" });

        act(() => {
            jest.advanceTimersByTime(499);
        });

        expect(result.current).toBe("roadmap");

        act(() => {
            jest.advanceTimersByTime(1);
        });

        expect(result.current).toBe("checkout");
    });
});
