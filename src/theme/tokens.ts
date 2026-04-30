/**
 * Single source of truth for spacing, color, typography, radius, motion, and
 * z-index across the app. Components MUST import from this module instead of
 * hand-rolling rems or hex literals so a future theme change is one edit.
 *
 * The numeric values are in CSS pixels (the project intentionally drops the
 * old `html { font-size: 62.5% }` hack — see docs/ui-ux-optimization-plan.md
 * §1.1.1 and §Phase 1.1).
 */

export const space = {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
} as const;

export const radius = {
    sm: 4,
    md: 6,
    lg: 8,
    pill: 999
} as const;

export const fontSize = {
    xs: 12,
    sm: 13,
    base: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32
} as const;

export const fontWeight = {
    regular: 400,
    medium: 500,
    semibold: 600
} as const;

export const lineHeight = {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.65
} as const;

/**
 * Brand colors. Surface / status colors come from AntD's algorithm so dark
 * mode flips cleanly; only the brand stays constant.
 */
export const brand = {
    primary: "#2684FF",
    primaryHover: "#1f6fd1",
    primaryActive: "#1559b6"
} as const;

/**
 * Motion durations in ms. Long, medium, short follow Material 3 buckets so
 * `prefers-reduced-motion` can cut all of them to zero in one place.
 */
export const motion = {
    short: 100,
    medium: 200,
    long: 300
} as const;

export const zIndex = {
    sticky: 10,
    dropdown: 1050,
    drawer: 1000,
    modal: 1100,
    toast: 1200
} as const;

/**
 * Touch target minimum (CSS px). 24 px satisfies WCAG 2.5.8 (AA); we lift to
 * 44 px on `pointer: coarse` viewports via the AntD `controlHeight` token.
 */
export const touchTargetMin = 24;
export const touchTargetCoarse = 44;

/**
 * Maximum readable line length for body copy (in `ch`). Applied to chat
 * messages, brief descriptions, modal notes.
 */
export const maxLineLengthCh = 75;

/**
 * Standard board column width (in rem). Reused by the board page skeleton so
 * the loading layout matches the real columns.
 */
export const columnMinWidthRem = 29.5;

/**
 * Breakpoints (CSS px). Keep this list short — anything more granular should
 * be a one-off in the affected component.
 */
export const breakpoints = {
    sm: 480,
    md: 768,
    lg: 1024
} as const;
