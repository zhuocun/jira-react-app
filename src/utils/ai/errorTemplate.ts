/**
 * Standardized AI error template (PRD v3 §9.2 X-R5).
 *
 * Every AI surface must render errors with the same shape: a plain-language
 * heading, optional one-sentence context, and a primary "Try again" action.
 * Raw `error.message` strings or HTTP status codes never reach the user.
 *
 * This module centralizes the mapping from a thrown {@link Error} to the UI
 * payload so individual surfaces don't reinvent the messaging each time.
 */

import {
    AgentAuthError,
    AgentRateLimitError,
    AgentTransportError
} from "./agentClient";

export interface AiErrorView {
    /** Heading shown as the alert title. */
    heading: string;
    /** Optional second line of context. Empty string when not applicable. */
    body: string;
    /** True when the user should be encouraged to retry. */
    retryable: boolean;
    /** Hint surfaces use to pick an icon / tone. */
    severity: "error" | "warning" | "info";
}

const DEFAULT_VIEW: AiErrorView = {
    heading: "Board Copilot hit an error",
    body: "Try again, or reload the page if the problem persists.",
    retryable: true,
    severity: "warning"
};

/**
 * Map an error (or unknown thrown value) to the UI shape the PRD requires.
 *
 * @param error  Any caught value. Falsy / unknown shapes resolve to the
 *               default warning template.
 * @param fallbackHeading  Override for the surface-specific lead, e.g.
 *                         `"Couldn't generate the brief"`.
 */
export const aiErrorView = (
    error: unknown,
    fallbackHeading?: string
): AiErrorView => {
    if (!error)
        return {
            ...DEFAULT_VIEW,
            heading: fallbackHeading ?? DEFAULT_VIEW.heading
        };

    if (error instanceof AgentRateLimitError) {
        const seconds = Math.max(1, Math.round(error.retryAfterSeconds ?? 30));
        return {
            heading: "Board Copilot is at capacity",
            body: `Please try again in ${seconds} seconds.`,
            retryable: false,
            severity: "info"
        };
    }
    if (error instanceof AgentAuthError) {
        return {
            heading: "You're signed out",
            body: "Sign in again, then retry.",
            retryable: false,
            severity: "warning"
        };
    }
    if (error instanceof AgentTransportError) {
        return {
            heading:
                fallbackHeading ?? "Board Copilot couldn't reach the agent",
            body: "Check your connection, then try again.",
            retryable: true,
            severity: "warning"
        };
    }
    if (error instanceof DOMException && error.name === "AbortError") {
        return {
            heading: "Stopped",
            body: "",
            retryable: true,
            severity: "info"
        };
    }
    return {
        ...DEFAULT_VIEW,
        heading: fallbackHeading ?? DEFAULT_VIEW.heading
    };
};
