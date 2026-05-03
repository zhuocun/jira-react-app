import type { Palette } from "./types";

/**
 * Render the runtime CSS custom properties for a palette. The output is a
 * complete CSS string with `:root` / `html[data-color-scheme="light"]` and
 * `html[data-color-scheme="dark"]` blocks. Mounted synchronously in
 * `index.tsx` BEFORE React renders so styled-components see the vars from
 * the very first paint — no flash of the previous palette.
 *
 * Vars defined here are consumed across the codebase:
 *   - `--pulse-bg-page` / `--pulse-text-base` — body background + text
 *   - `--color-copilot-*` — AI gradient stops, badge, pulse animation
 *   - `--glass-*` — frosted-glass surface, border, shine inset
 *   - `--aurora-blob` / `--aurora-blob-strong` — subtle body wash + AI
 *     panel wash; named so a single tint flip propagates everywhere
 */
export const paletteToCss = (p: Palette): string => `
:root,
html[data-color-scheme="light"] {
    --pulse-bg-page: ${p.page.bgLight};
    --pulse-text-base: ${p.page.textLight};

    --color-copilot-grad-start: ${p.aurora.deep};
    --color-copilot-grad-mid: ${p.aurora.mid};
    --color-copilot-grad-end: ${p.aurora.light};
    --color-copilot-bg-subtle: rgba(${p.accent.rgb}, 0.04);
    --color-copilot-bg-medium: rgba(${p.accent.rgb}, 0.14);
    --color-copilot-badge: ${p.brand.primary};
    --color-copilot-badge-bg: rgba(${p.accent.rgb}, 0.12);
    --color-copilot-pulse: rgba(${p.accent.rgb}, 0.45);

    --glass-surface: rgba(255, 255, 255, 0.68);
    --glass-surface-strong: rgba(255, 255, 255, 0.82);
    --glass-surface-subtle: rgba(255, 255, 255, 0.50);
    --glass-border: rgba(15, 23, 42, 0.06);
    --glass-border-strong: rgba(${p.accent.rgb}, 0.22);
    --glass-shine: inset 0 1px 0 rgba(255, 255, 255, 0.55);

    --aurora-blob: rgba(${p.accent.rgb}, 0.10);
    --aurora-blob-strong: rgba(${p.accent.rgb}, 0.20);
    --aurora-blob-faint: rgba(${p.accent.rgb}, 0.06);
}

html[data-color-scheme="dark"] {
    --pulse-bg-page: ${p.page.bgDark};
    --pulse-text-base: ${p.page.textDark};

    --color-copilot-grad-start: ${p.brand.primaryDark};
    --color-copilot-grad-mid: ${p.aurora.light};
    --color-copilot-grad-end: ${p.aurora.mid};
    --color-copilot-bg-subtle: rgba(${p.accent.rgbDark}, 0.08);
    --color-copilot-bg-medium: rgba(${p.accent.rgbDark}, 0.18);
    --color-copilot-badge: ${p.brand.primaryDark};
    --color-copilot-badge-bg: rgba(${p.accent.rgbDark}, 0.16);
    --color-copilot-pulse: rgba(${p.accent.rgbDark}, 0.5);

    --glass-surface: rgba(10, 12, 8, 0.55);
    --glass-surface-strong: rgba(10, 12, 8, 0.74);
    --glass-surface-subtle: rgba(10, 12, 8, 0.35);
    --glass-border: rgba(255, 255, 255, 0.08);
    --glass-border-strong: rgba(${p.accent.rgbDark}, 0.30);
    --glass-shine: inset 0 1px 0 rgba(255, 255, 255, 0.06);

    --aurora-blob: rgba(${p.accent.rgbDark}, 0.14);
    --aurora-blob-strong: rgba(${p.accent.rgbDark}, 0.24);
    --aurora-blob-faint: rgba(${p.accent.rgbDark}, 0.08);
}
`;
