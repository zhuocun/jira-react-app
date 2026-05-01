/**
 * Analytics event names used by Board Copilot v2.1 (PRD §10 metrics M1-M15).
 *
 * The constants live in one module so a future analytics sink (Segment,
 * PostHog, in-house) only needs to map the union once. `track` is a no-op
 * stub: production code can re-implement it via a side channel without
 * changing call sites.
 */
export const ANALYTICS_EVENTS = {
    AGENT_TURN_STARTED: "agent.turn.started",
    AGENT_TURN_COMPLETED: "agent.turn.completed",
    AGENT_PROPOSAL_ACCEPTED: "agent.proposal.accepted",
    AGENT_PROPOSAL_REJECTED: "agent.proposal.rejected",
    AGENT_PROPOSAL_UNDONE: "agent.proposal.undone",
    NUDGE_VIEWED: "nudge.viewed",
    NUDGE_ACCEPTED: "nudge.accepted",
    NUDGE_DISMISSED: "nudge.dismissed",
    PALETTE_OPENED: "palette.opened",
    PALETTE_AI_MODE_TOGGLED: "palette.ai_mode_toggled",
    AGENT_HEALTH_DEGRADED: "agent.health.degraded",
    THUMBS_FEEDBACK: "agent.feedback.thumbs",
    CITATION_FLAGGED: "agent.feedback.citation_flagged",
    CITATION_CLICKED: "agent.citation.clicked",
    /* PRD v3 §9.8 (X-R15) — UX surface analytics */
    AGENT_TTFT: "agent.ttft",
    BRIEF_REFRESHED: "brief.refreshed",
    BREAKDOWN_AXIS_CHANGED: "breakdown.axis_changed",
    SEARCH_RESULT_RATIONALE_VIEWED: "search.result_rationale_viewed",
    UNDO_APPLIED: "undo.applied",
    COPILOT_CHAT_SEND: "copilot.chat.send",
    COPILOT_CHAT_REGENERATE: "copilot.chat.regenerate",
    COPILOT_ESTIMATE_APPLY: "copilot.estimate.apply",
    COPILOT_BRIEF_OPEN: "copilot.brief.open",
    COPILOT_DRAFT_SUBMIT: "copilot.draft.submit",
    COPILOT_PALETTE_INVOKE: "copilot.palette.invoke",
    COPILOT_REWRITE_ACCEPT: "copilot.rewrite.accept",
    COPILOT_ONBOARDING_CTA: "copilot.onboarding.cta"
} as const;

export type AnalyticsEvent =
    (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

export const track = (
    event: AnalyticsEvent,
    payload?: Record<string, unknown>
): void => {
    /* no-op hook; concrete sink wires here */
    void event;
    void payload;
};
