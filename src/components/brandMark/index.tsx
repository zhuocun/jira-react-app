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
    background: linear-gradient(
        135deg,
        ${accent.start} 0%,
        ${brand.primary} 60%,
        #4f5bc4 100%
    );
    border-radius: ${radius.md}px;
    box-shadow:
        ${shadow.md},
        inset 0 1px 0 rgba(255, 255, 255, 0.18);
    color: #fff;
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
                    <path
                        d="M9 10.5 L9 21.5 M14 14.5 L14 17.5 M19 10.5 L19 21.5 M24 14.5 L24 17.5"
                        stroke="#FFFFFF"
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
