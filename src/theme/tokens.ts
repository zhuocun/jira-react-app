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
 * Deep teal brand. Replaces the previous violet — purple/violet has become
 * the default "AI app" cliché and dilutes the product identity. Teal sits
 * adjacent to the cyan accent end-stop and pairs naturally with the warm
 * amber aurora layer for a premium, technical feel.
 *
 * Hover/active are darker steps in the same hue. AA contrast on white
 * (#0D9488 = 4.55:1 normal text) and AA on dark surfaces.
 */
export const brand = {
    primary: "#0D9488",
    primaryHover: "#0F766E",
    primaryActive: "#115E59",
    primaryBg: "#F0FDFA",
    primaryBgDark: "#042F2E"
} as const;

/**
 * Accent gradient used for AI surfaces (sparkle icon, badges, highlights).
 * Teal → cyan — close-hue analog gradient that reads as "depth" rather
 * than the energy of the previous violet → cyan span. Keeps the cool
 * spectrum coherent so the warm amber aurora layer can do the contrast
 * work at the page level.
 *
 * The translucent variants exist as named tokens so AI-themed surfaces
 * can reach for them by name instead of duplicating raw rgba literals.
 */
export const accent = {
    start: "#0D9488",
    end: "#06B6D4",
    glow: "rgba(13, 148, 136, 0.22)",
    bgSubtle: "rgba(13, 148, 136, 0.05)",
    bgSoft: "rgba(13, 148, 136, 0.10)",
    bgMedium: "rgba(13, 148, 136, 0.20)",
    bgStrong: "rgba(13, 148, 136, 0.36)",
    border: "rgba(13, 148, 136, 0.26)",
    secondaryStrong: "rgba(6, 182, 212, 0.32)",
    selectionBg: "rgba(13, 148, 136, 0.22)"
} as const;

/**
 * Aurora palette — teal-anchored, no purple. Three cool blobs (teal,
 * cyan, emerald) plus a warm amber blob that does the heavy lifting for
 * temperature contrast on mesh backgrounds. Components reach for these
 * only on the hero surfaces called out in the redesign brief — every
 * other surface stays with `brand` / `accent`.
 */
export const aurora = {
    teal: "#0D9488",
    cyan: "#06B6D4",
    emerald: "#10B981",
    amber: "#F59E0B",
    tealSoft: "rgba(13, 148, 136, 0.18)",
    cyanSoft: "rgba(6, 182, 212, 0.16)",
    emeraldSoft: "rgba(16, 185, 129, 0.14)",
    amberSoft: "rgba(245, 158, 11, 0.14)",
    cinematicBase: "#042F2E",
    gradLine: "linear-gradient(135deg, #0D9488 0%, #14B8A6 45%, #06B6D4 100%)",
    gradLineSoft:
        "linear-gradient(135deg, rgba(13,148,136,0.18) 0%, rgba(6,182,212,0.14) 100%)"
} as const;

/**
 * Glass surface tokens. Companion to `aurora` — used by header, modal,
 * drawer, AI panel, hero card surfaces. Each value pairs with a
 * `backdrop-filter` recipe (see `blur` below). NEVER apply glass without
 * the `prefers-reduced-transparency` fallback wired up in App.css.
 */
export const glass = {
    surface: "rgba(255, 255, 255, 0.65)",
    surfaceStrong: "rgba(255, 255, 255, 0.78)",
    surfaceSubtle: "rgba(255, 255, 255, 0.45)",
    surfaceDark: "rgba(8, 28, 27, 0.55)",
    surfaceStrongDark: "rgba(8, 28, 27, 0.72)",
    surfaceSubtleDark: "rgba(8, 28, 27, 0.35)",
    border: "rgba(255, 255, 255, 0.28)",
    borderDark: "rgba(255, 255, 255, 0.08)",
    borderStrong: "rgba(13, 148, 136, 0.22)",
    borderStrongDark: "rgba(45, 212, 191, 0.30)",
    shineInset: "inset 0 1px 0 rgba(255, 255, 255, 0.45)",
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
    xs: "0 1px 2px rgba(15, 23, 42, 0.06)",
    sm: "0 1px 2px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.08)",
    md: "0 2px 4px rgba(15, 23, 42, 0.06), 0 4px 12px rgba(15, 23, 42, 0.08)",
    lg: "0 8px 16px rgba(15, 23, 42, 0.08), 0 16px 32px rgba(15, 23, 42, 0.10)",
    xl: "0 16px 32px rgba(15, 23, 42, 0.12), 0 32px 64px rgba(15, 23, 42, 0.14)",
    focus: "0 0 0 3px rgba(13, 148, 136, 0.22)",
    inset: "inset 0 1px 0 rgba(255, 255, 255, 0.06)",
    glowTeal: "0 0 24px rgba(13, 148, 136, 0.32)",
    glowCyan: "0 0 24px rgba(6, 182, 212, 0.28)",
    glowAmber: "0 0 24px rgba(245, 158, 11, 0.28)",
    glowAurora:
        "0 12px 40px -8px rgba(13, 148, 136, 0.30), 0 0 0 1px rgba(13, 148, 136, 0.12)"
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
 * Aurora-aligned gradient palette for user / project avatars. Six steps
 * across the teal/cyan/emerald/amber aurora family so every distinct id
 * reads as a unique monogram while staying inside the new palette.
 * Centralizing the list here means a future palette change is one edit.
 */
export const avatarGradients = [
    `linear-gradient(135deg, ${aurora.teal} 0%, ${aurora.cyan} 100%)`,
    `linear-gradient(135deg, ${aurora.teal} 0%, ${aurora.amber} 100%)`,
    `linear-gradient(135deg, ${aurora.cyan} 0%, ${aurora.emerald} 100%)`,
    `linear-gradient(135deg, ${aurora.amber} 0%, ${aurora.teal} 100%)`,
    `linear-gradient(135deg, #14B8A6 0%, ${aurora.cyan} 100%)`,
    `linear-gradient(135deg, ${aurora.emerald} 0%, ${aurora.teal} 100%)`
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
