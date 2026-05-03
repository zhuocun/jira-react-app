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
 * Deep emerald brand. The simplest, most graceful pairing for an AI-powered
 * app: emerald + white. Echoes Hermès / Tiffany / Rolex green-on-white, a
 * combination universally read as elegant and confident. Distinct from the
 * AI-purple cliché, distinct from the previous teal — this iteration drops
 * every secondary accent and lets a single hue carry the whole identity.
 *
 * Hover/active step deeper into the same hue. AA contrast on white
 * (#047857 = 5.06:1 normal text) and AA on dark surfaces.
 */
export const brand = {
    primary: "#047857",
    primaryHover: "#065F46",
    primaryActive: "#064E3B",
    primaryBg: "#ECFDF5",
    primaryBgDark: "#022C22"
} as const;

/**
 * Accent gradient used for AI surfaces (sparkle icon, badges, highlights).
 * Single-hue emerald range — the gradient now reads as "depth" within one
 * color rather than energy across two. The `secondaryStrong` token is kept
 * for back-compat but resolves to a deeper emerald rather than a foreign hue.
 */
export const accent = {
    start: "#047857",
    end: "#10B981",
    glow: "rgba(4, 120, 87, 0.22)",
    bgSubtle: "rgba(4, 120, 87, 0.04)",
    bgSoft: "rgba(4, 120, 87, 0.08)",
    bgMedium: "rgba(4, 120, 87, 0.16)",
    bgStrong: "rgba(4, 120, 87, 0.32)",
    border: "rgba(4, 120, 87, 0.22)",
    secondaryStrong: "rgba(6, 95, 70, 0.32)",
    selectionBg: "rgba(4, 120, 87, 0.20)"
} as const;

/**
 * Aurora palette — collapsed to a single emerald hue family. The previous
 * multi-hue aurora gave way to a calmer single-color system in service of
 * "graceful and elegant" — every blob and gradient now lives in this hue.
 * The `cinematicBase` is the deepest emerald, used as the dark backdrop on
 * the auth hero rail. Components reach for these tokens only on hero
 * surfaces (auth, AI panels) — every other surface stays with `brand`.
 */
export const aurora = {
    deep: "#047857",
    mid: "#10B981",
    light: "#6EE7B7",
    surface: "#ECFDF5",
    deepSoft: "rgba(4, 120, 87, 0.10)",
    midSoft: "rgba(16, 185, 129, 0.12)",
    cinematicBase: "#022C22",
    gradLine: "linear-gradient(135deg, #047857 0%, #10B981 100%)",
    gradLineSoft:
        "linear-gradient(135deg, rgba(4,120,87,0.10) 0%, rgba(16,185,129,0.06) 100%)"
} as const;

/**
 * Glass surface tokens. Companion to `aurora` — used by header, modal,
 * drawer, AI panel, hero card surfaces. Surfaces stay neutral white-tinted
 * (the elegance comes from white, not from the accent leaking into every
 * pane); only the strong borders pick up the emerald accent. NEVER apply
 * glass without the `prefers-reduced-transparency` fallback wired up in
 * App.css.
 */
export const glass = {
    surface: "rgba(255, 255, 255, 0.68)",
    surfaceStrong: "rgba(255, 255, 255, 0.82)",
    surfaceSubtle: "rgba(255, 255, 255, 0.50)",
    surfaceDark: "rgba(10, 15, 13, 0.55)",
    surfaceStrongDark: "rgba(10, 15, 13, 0.74)",
    surfaceSubtleDark: "rgba(10, 15, 13, 0.35)",
    border: "rgba(15, 23, 42, 0.06)",
    borderDark: "rgba(255, 255, 255, 0.08)",
    borderStrong: "rgba(4, 120, 87, 0.22)",
    borderStrongDark: "rgba(110, 231, 183, 0.30)",
    shineInset: "inset 0 1px 0 rgba(255, 255, 255, 0.55)",
    shineInsetDark: "inset 0 1px 0 rgba(255, 255, 255, 0.06)"
} as const;

/**
 * Backdrop-filter blur ladder (CSS px). Used as
 * `backdrop-filter: saturate(180%) blur(${blur.md}px)`. Higher values are
 * GPU-expensive — keep `lg` and `xl` to ≤2 simultaneously visible surfaces.
 */
export const blur = {
    xs: 8,
    sm: 12,
    md: 20,
    lg: 28,
    xl: 40
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
    xs: "0 1px 2px rgba(15, 23, 42, 0.05)",
    sm: "0 1px 2px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(15, 23, 42, 0.06)",
    md: "0 2px 4px rgba(15, 23, 42, 0.05), 0 4px 12px rgba(15, 23, 42, 0.06)",
    lg: "0 8px 16px rgba(15, 23, 42, 0.06), 0 16px 32px rgba(15, 23, 42, 0.08)",
    xl: "0 16px 32px rgba(15, 23, 42, 0.10), 0 32px 64px rgba(15, 23, 42, 0.12)",
    focus: "0 0 0 3px rgba(4, 120, 87, 0.22)",
    inset: "inset 0 1px 0 rgba(255, 255, 255, 0.06)",
    /* Single emerald glow — replaces the previous multi-hue glow trio. */
    glowEmerald: "0 0 24px rgba(4, 120, 87, 0.28)",
    glowAurora:
        "0 12px 40px -8px rgba(4, 120, 87, 0.24), 0 0 0 1px rgba(4, 120, 87, 0.10)"
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
 * Standard "modal-on-mobile" formula. AntD's Modal reserves ~16 px breathing
 * room on each side of the viewport on phones; we centralize that math so
 * every modal lands at the same width and we don't sprinkle `32` literals
 * through component code.
 */
export const modalGutterPx = space.md * 2; // 16 px each side
export const modalWidthCss = (max: number) =>
    `min(${max}px, calc(100vw - ${modalGutterPx}px))`;

/**
 * Monochromatic emerald gradient palette for user / project avatars. Six
 * variations within the same hue family so every distinct id reads as a
 * unique monogram while staying inside the single-color identity. The
 * variations differ in lightness range (light→mid, mid→deep, full range,
 * etc.) so cards still distinguish at a glance.
 */
export const avatarGradients = [
    `linear-gradient(135deg, ${aurora.light} 0%, ${aurora.mid} 100%)`,
    `linear-gradient(135deg, #34D399 0%, ${aurora.deep} 100%)`,
    `linear-gradient(135deg, ${aurora.mid} 0%, ${aurora.cinematicBase} 100%)`,
    `linear-gradient(135deg, ${aurora.light} 0%, ${aurora.deep} 100%)`,
    `linear-gradient(135deg, #34D399 0%, #065F46 100%)`,
    `linear-gradient(135deg, ${aurora.mid} 0%, ${aurora.deep} 100%)`
] as const;

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
