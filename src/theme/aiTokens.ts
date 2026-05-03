/**
 * AI design tokens (PRD v3 §9.5 X-R11). The string values resolve at runtime
 * via CSS custom properties defined in `src/App.css`, so dark mode flips
 * automatically — components never need to read `data-color-scheme`.
 *
 * The numeric tokens (durations, sizes) sit alongside so a single import
 * grabs everything an AI surface needs without pulling the whole token
 * surface area in. Surface-side fallbacks (`accent` from `tokens.ts`) stay
 * for code paths that haven't been migrated yet.
 */

export const aiTokens = {
    gradStart: "var(--color-copilot-grad-start, #0D9488)",
    gradMid: "var(--color-copilot-grad-mid, #14B8A6)",
    gradEnd: "var(--color-copilot-grad-end, #06B6D4)",
    bgSubtle: "var(--color-copilot-bg-subtle, rgba(13, 148, 136, 0.06))",
    bgMedium: "var(--color-copilot-bg-medium, rgba(13, 148, 136, 0.18))",
    badge: "var(--color-copilot-badge, #0D9488)",
    badgeBg: "var(--color-copilot-badge-bg, rgba(13, 148, 136, 0.14))",
    pulse: "var(--color-copilot-pulse, rgba(13, 148, 136, 0.50))"
} as const;

/** Streaming TTFT target in ms. Surfaces measure against this for AGENT_TTFT. */
export const TTFT_TARGET_MS = 700;

/** Max time without a stream chunk before the watchdog aborts (UA-R1). */
export const STREAM_WATCHDOG_MS = 30_000;

/** Toast undo window per PRD §7.4. */
export const UNDO_WINDOW_MS = 10_000;

/** Smart-cache TTL for the board brief per PRD B-R1. */
export const BRIEF_CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Sparkle icon size scale (PRD S-R4). Maps to `width`/`height` in CSS px.
 */
export const sparkleSize = {
    sm: 14,
    md: 18,
    lg: 24
} as const;

export type SparkleSize = keyof typeof sparkleSize;
