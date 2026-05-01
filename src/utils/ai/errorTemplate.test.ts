import {
    AgentAuthError,
    AgentRateLimitError,
    AgentTransportError
} from "./agentClient";
import { aiErrorView } from "./errorTemplate";

describe("aiErrorView", () => {
    it("returns the default template for plain Errors", () => {
        const view = aiErrorView(new Error("boom"));
        expect(view.heading).toBe("Board Copilot hit an error");
        expect(view.retryable).toBe(true);
    });

    it("uses the surface-specific fallback heading", () => {
        const view = aiErrorView(new Error("boom"), "Couldn't generate brief");
        expect(view.heading).toBe("Couldn't generate brief");
    });

    it("explains rate limits with a wait", () => {
        const err = new AgentRateLimitError(45, "rate limited");
        const view = aiErrorView(err);
        expect(view.heading).toBe("Board Copilot is at capacity");
        expect(view.body).toContain("45");
        expect(view.retryable).toBe(false);
        expect(view.severity).toBe("info");
    });

    it("prompts re-auth for AgentAuthError", () => {
        const view = aiErrorView(new AgentAuthError());
        expect(view.heading).toBe("You're signed out");
        expect(view.retryable).toBe(false);
    });

    it("uses transport heading for AgentTransportError", () => {
        const view = aiErrorView(new AgentTransportError("fetch failed"));
        expect(view.heading).toContain("couldn't reach");
        expect(view.retryable).toBe(true);
    });

    it("treats abort as a passive 'Stopped' state, not a failure", () => {
        const abortError = new DOMException("aborted", "AbortError");
        const view = aiErrorView(abortError);
        expect(view.heading).toBe("Stopped");
        expect(view.severity).toBe("info");
    });

    it("never surfaces raw error.message text", () => {
        const view = aiErrorView(new Error("HTTP 500: NullPointerException"));
        expect(view.heading).not.toContain("500");
        expect(view.body).not.toContain("Null");
    });
});
