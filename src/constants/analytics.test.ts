import { ANALYTICS_EVENTS, setAnalyticsSink, track } from "./analytics";

describe("ANALYTICS_EVENTS", () => {
    it("maps every key to a unique string value", () => {
        const values = Object.values(ANALYTICS_EVENTS);
        const unique = new Set(values);
        expect(unique.size).toBe(values.length);
        for (const value of values) {
            expect(typeof value).toBe("string");
            expect(value.length).toBeGreaterThan(0);
        }
    });

    it("track returns void without throwing for every known event", () => {
        for (const eventName of Object.values(ANALYTICS_EVENTS)) {
            expect(() => track(eventName, { foo: 1 })).not.toThrow();
            expect(track(eventName)).toBeUndefined();
        }
    });
});

describe("setAnalyticsSink", () => {
    it("forwards every track() call to the configured sink", () => {
        const calls: Array<[string, unknown]> = [];
        const previous = setAnalyticsSink((event, payload) => {
            calls.push([event, payload]);
        });
        try {
            track(ANALYTICS_EVENTS.THUMBS_FEEDBACK, { value: "down" });
            track(ANALYTICS_EVENTS.UNDO_APPLIED);
        } finally {
            setAnalyticsSink(previous);
        }
        expect(calls).toEqual([
            [ANALYTICS_EVENTS.THUMBS_FEEDBACK, { value: "down" }],
            [ANALYTICS_EVENTS.UNDO_APPLIED, undefined]
        ]);
    });

    it("swallows sink exceptions so analytics can never break product UX", () => {
        const previous = setAnalyticsSink(() => {
            throw new Error("network down");
        });
        try {
            expect(() =>
                track(ANALYTICS_EVENTS.COPILOT_BRIEF_OPEN)
            ).not.toThrow();
        } finally {
            setAnalyticsSink(previous);
        }
    });
});
