import styled from "@emotion/styled";
import React from "react";

import {
    accent,
    brand,
    fontSize,
    fontWeight,
    letterSpacing,
    radius,
    shadow,
    space
} from "../../theme/tokens";

/**
 * Sanitize a React `useId()` value so it is safe to embed in an SVG
 * element id. Strips the leading colons React emits in development mode
 * (e.g. `:r0:` → `r0`) which are not valid first characters in an HTML
 * id and break `url(#…)` references.
 */
const sanitizeId = (raw: string): string => raw.replace(/[^a-zA-Z0-9_-]/g, "");

interface BrandMarkProps {
    /** When true, renders a larger glyph + wordmark suited for hero / auth surfaces. */
    size?: "sm" | "md" | "lg";
    /** Hide the wordmark and render only the glyph (used when space is tight). */
    glyphOnly?: boolean;
    /** Override the wordmark text. Defaults to the product name. */
    label?: string;
    className?: string;
    style?: React.CSSProperties;
}

const dimensions: Record<
    NonNullable<BrandMarkProps["size"]>,
    {
        glyph: number;
        innerSvg: number;
        wordFontPx: number;
    }
> = {
    sm: { glyph: 28, innerSvg: 16, wordFontPx: fontSize.base },
    md: { glyph: 36, innerSvg: 20, wordFontPx: fontSize.md },
    lg: { glyph: 44, innerSvg: 24, wordFontPx: fontSize.lg }
};

const Wrap = styled.span<{ wordFontPx: number }>`
    align-items: center;
    color: var(--ant-color-text, rgba(15, 23, 42, 0.92));
    display: inline-flex;
    gap: ${space.sm}px;
    font-size: ${(p) => p.wordFontPx}px;
    font-weight: ${fontWeight.semibold};
    letter-spacing: ${letterSpacing.tight};
    line-height: 1;
`;

const Glyph = styled.span<{ glyphPx: number }>`
    align-items: center;
    /* Inverted glyph: a clean white surface with the brand-orange pulse
     * inside, instead of the previous orange-filled tile. The 1 px hairline
     * border keeps the rounded square readable when it sits on top of the
     * page's warm-cream background or any light surface. */
    background: var(--ant-color-bg-elevated, #ffffff);
    border: 1px solid var(--ant-color-border-secondary, rgba(15, 23, 42, 0.08));
    border-radius: ${radius.md}px;
    box-shadow:
        ${shadow.xs},
        inset 0 1px 0 rgba(255, 255, 255, 0.6);
    color: ${brand.primary};
    display: inline-flex;
    flex: 0 0 auto;
    height: ${(p) => p.glyphPx}px;
    justify-content: center;
    width: ${(p) => p.glyphPx}px;
`;

/**
 * Single-source-of-truth brand mark. Replaces the duplicated brand glyph
 * that previously lived inline in `header/index.tsx` and `authLayout.tsx`,
 * so a future brand refresh is one edit. The glyph is rendered as a real
 * SVG (no <img>) so it scales perfectly and inherits text color.
 */
const BrandMark: React.FC<BrandMarkProps> = ({
    size = "sm",
    glyphOnly = false,
    label = "Pulse",
    className,
    style
}) => {
    const { glyph, innerSvg, wordFontPx } = dimensions[size];
    /* Each glyph instance owns its own gradient id so multiple BrandMarks
     * on the same page (e.g. header + auth screen during a transition)
     * don't collide on `url(#…)` references. */
    const gradientId = `brand-pulse-${sanitizeId(React.useId())}`;
    return (
        <Wrap className={className} style={style} wordFontPx={wordFontPx}>
            <Glyph aria-hidden glyphPx={glyph}>
                <svg
                    focusable="false"
                    height={innerSvg}
                    viewBox="0 0 32 32"
                    width={innerSvg}
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <linearGradient
                            id={gradientId}
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                        >
                            <stop offset="0%" stopColor={accent.end} />
                            <stop offset="100%" stopColor={brand.primary} />
                        </linearGradient>
                    </defs>
                    <path
                        d="M9 10.5 L9 21.5 M14 14.5 L14 17.5 M19 10.5 L19 21.5 M24 14.5 L24 17.5"
                        stroke={`url(#${gradientId})`}
                        strokeLinecap="round"
                        strokeWidth="2.6"
                    />
                </svg>
            </Glyph>
            {glyphOnly ? null : <span>{label}</span>}
        </Wrap>
    );
};

export default BrandMark;
