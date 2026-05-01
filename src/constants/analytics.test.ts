import { ANALYTICS_EVENTS, track } from "./analytics";

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
