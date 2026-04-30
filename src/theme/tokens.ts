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
    xxl: 48,
    xxxl: 64
} as const;

export const radius = {
    xs: 4,
    sm: 6,
    md: 10,
    lg: 14,
    xl: 20,
    pill: 999
} as const;

export const fontSize = {
    xs: 12,
    sm: 13,
    base: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    display: 36
} as const;

export const fontWeight = {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700
} as const;

export const lineHeight = {
    tight: 1.25,
    snug: 1.4,
    normal: 1.5,
    relaxed: 1.65
} as const;

export const letterSpacing = {
    tight: "-0.02em",
    normal: "0",
    wide: "0.04em",
    wider: "0.08em"
} as const;

/**
 * Refined indigo brand. Replaces the old Atlassian Jira blue (#2684FF) with
 * a calmer indigo that feels closer to Linear / Vercel without copying any
 * single product. Hover/active are darker steps in the same hue. AA contrast
 * on white (5.1:1 normal text, 7+ bold/large) and AA on dark surfaces.
 */
export const brand = {
    primary: "#5E6AD2",
    primaryHover: "#4F5BC4",
    primaryActive: "#3F4AAA",
    primaryBg: "#EEF0FF",
    primaryBgDark: "#1C1F3D"
} as const;

/**
 * Accent gradient used for AI surfaces (sparkle icon, badges, highlights).
 * Sits beside the indigo brand without competing with it.
 */
export const accent = {
    start: "#7C5CFF",
    end: "#C084FC",
    glow: "rgba(124, 92, 255, 0.18)"
} as const;

/**
 * Semantic palette aligned with the new brand. We expose explicit hexes here
 * because AntD's defaults (e.g. red-5 = #ff4d4f) are too saturated for the
 * refined neutral surface treatment. Components reading `--ant-color-*`
 * still pick up AntD's auto-derived variants.
 */
export const semantic = {
    success: "#10B981",
    successBg: "#ECFDF5",
    warning: "#F59E0B",
    warningBg: "#FFFBEB",
    error: "#EF4444",
    errorBg: "#FEF2F2",
    info: "#3B82F6",
    infoBg: "#EFF6FF",
    favorite: "#F43F5E"
} as const;

/**
 * Tag color tokens. Used to keep "Bug" / "Task" / story-points / epic chips
 * visually consistent across cards, brief drawer, draft modal.
 */
export const tag = {
    task: "geekblue",
    bug: "magenta",
    epic: "purple",
    points: "default"
} as const;

/**
 * Layered shadow tokens. The old single-flat shadow looked dated; modern
 * cards use two stacked shadows (a tight ambient one and a softer cast) to
 * read as floating without being heavy.
 */
export const shadow = {
    xs: "0 1px 2px rgba(15, 23, 42, 0.06)",
    sm: "0 1px 2px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.08)",
    md: "0 2px 4px rgba(15, 23, 42, 0.06), 0 4px 12px rgba(15, 23, 42, 0.08)",
    lg: "0 8px 16px rgba(15, 23, 42, 0.08), 0 16px 32px rgba(15, 23, 42, 0.10)",
    xl: "0 16px 32px rgba(15, 23, 42, 0.12), 0 32px 64px rgba(15, 23, 42, 0.14)",
    focus: "0 0 0 3px rgba(94, 106, 210, 0.20)",
    inset: "inset 0 1px 0 rgba(255, 255, 255, 0.06)"
} as const;

/**
 * Motion durations in ms. Long, medium, short follow Material 3 buckets so
 * `prefers-reduced-motion` can cut all of them to zero in one place.
 */
export const motion = {
    instant: 60,
    short: 120,
    medium: 200,
    long: 320
} as const;

export const easing = {
    standard: "cubic-bezier(0.2, 0, 0, 1)",
    emphasized: "cubic-bezier(0.3, 0, 0, 1)",
    decelerate: "cubic-bezier(0, 0, 0, 1)"
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
export const columnMinWidthRem = 18;

/**
 * Maximum width (in rem) for routed pages so content doesn't sprawl on
 * ultra-wide monitors. The board page opts out and lets columns scroll.
 */
export const pageMaxWidthRem = 88;

/**
 * Modern sans-serif stack. We load Inter from Google Fonts; the rest is a
 * progressive-enhancement fallback that matches each major OS's UI font.
 */
export const fontFamily = {
    sans: '"Inter", "Inter Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"JetBrains Mono", "SF Mono", Menlo, Consolas, "Liberation Mono", monospace'
} as const;

/**
 * Breakpoints (CSS px). Keep this list short — anything more granular should
 * be a one-off in the affected component.
 */
export const breakpoints = {
    sm: 480,
    md: 768,
    lg: 1024,
    xl: 1280
} as const;
