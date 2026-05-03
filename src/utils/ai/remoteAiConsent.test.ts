import {
    resetRemoteAiConsentForTests,
    acknowledgeRemoteAi,
    hasAcknowledgedRemoteAi
} from "./remoteAiConsent";

describe("remoteAiConsent", () => {
    beforeEach(() => {
        resetRemoteAiConsentForTests();
        try {
            window.localStorage.clear();
        } catch {
            /* ignore */
        }
    });

    it("starts un-acknowledged for any base URL", () => {
        expect(hasAcknowledgedRemoteAi("https://ai.example")).toBe(false);
        expect(hasAcknowledgedRemoteAi("")).toBe(false);
    });

    it("persists acknowledgement per base URL", () => {
        acknowledgeRemoteAi("https://ai.example");
        expect(hasAcknowledgedRemoteAi("https://ai.example")).toBe(true);
        // A different endpoint must re-prompt the user — silently swapping
        // the AI service should not bypass consent (Optimization Plan §3 P0-2).
        expect(hasAcknowledgedRemoteAi("https://other-ai.example")).toBe(false);
    });

    it("treats empty base URL as a stable consent key", () => {
        acknowledgeRemoteAi("");
        expect(hasAcknowledgedRemoteAi("")).toBe(true);
    });

    it("survives a localStorage outage by falling back to memory", () => {
        const originalSetItem = window.localStorage.setItem;
        // Force `localStorage.setItem` to throw so the helper has to fall
        // back to the in-memory map (Safari private mode reproduction).
        window.localStorage.setItem = () => {
            throw new Error("quota exceeded");
        };
        try {
            acknowledgeRemoteAi("https://ai.example");
            expect(hasAcknowledgedRemoteAi("https://ai.example")).toBe(true);
        } finally {
            window.localStorage.setItem = originalSetItem;
        }
    });

    it("resetRemoteAiConsentForTests clears one or all keys", () => {
        acknowledgeRemoteAi("https://ai.example");
        acknowledgeRemoteAi("https://other.example");
        resetRemoteAiConsentForTests("https://ai.example");
        expect(hasAcknowledgedRemoteAi("https://ai.example")).toBe(false);
        expect(hasAcknowledgedRemoteAi("https://other.example")).toBe(true);
        resetRemoteAiConsentForTests();
        expect(hasAcknowledgedRemoteAi("https://other.example")).toBe(false);
    });
});
