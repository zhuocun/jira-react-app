import React, { useId } from "react";

import { accent, brand, semantic } from "../../theme/tokens";

type EmptyIllustrationVariant = "tasks" | "projects" | "search" | "members";

interface EmptyIllustrationProps {
    variant?: EmptyIllustrationVariant;
    /** Icon size in CSS px. Defaults to 56 to match the previous AntD glyph. */
    size?: number;
}

/**
 * Branded empty-state illustration. Replaces AntD's grey outline drawing
 * with a subtle indigo→violet glyph on a soft halo so empty states feel
 * intentional rather than "data missing". The variant picks the inner
 * silhouette so a no-projects screen and a no-results-from-search screen
 * read differently at a glance.
 *
 * Each instance derives its gradient ids from React's `useId()` so multiple
 * illustrations on the same page never collide and SSR output matches the
 * hydrated DOM.
 */
const EmptyIllustration: React.FC<EmptyIllustrationProps> = ({
    variant = "tasks",
    size = 56
}) => {
    const haloId = useId();
    const fillId = useId();
    return (
        <svg
            aria-hidden
            focusable="false"
            height={size}
            viewBox="0 0 96 96"
            width={size}
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <radialGradient cx="50%" cy="50%" id={haloId} r="50%">
                    <stop
                        offset="0%"
                        stopColor={accent.start}
                        stopOpacity="0.35"
                    />
                    <stop
                        offset="60%"
                        stopColor={brand.primary}
                        stopOpacity="0.16"
                    />
                    <stop
                        offset="100%"
                        stopColor={brand.primary}
                        stopOpacity="0"
                    />
                </radialGradient>
                <linearGradient id={fillId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={accent.start} />
                    <stop offset="100%" stopColor={brand.primary} />
                </linearGradient>
            </defs>
            <circle cx="48" cy="48" fill={`url(#${haloId})`} r="46" />
            {variant === "projects" ? (
                <g
                    fill="none"
                    stroke={`url(#${fillId})`}
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                >
                    <rect height="44" rx="6" width="56" x="20" y="28" />
                    <path d="M20 38 H 76" />
                    <path d="M28 32.5 h 6" strokeLinecap="round" />
                    <circle
                        cx="32"
                        cy="54"
                        fill={`url(#${fillId})`}
                        r="3"
                        stroke="none"
                    />
                    <circle
                        cx="32"
                        cy="64"
                        fill={`url(#${fillId})`}
                        r="3"
                        stroke="none"
                    />
                    <path d="M40 54 h 26 M40 64 h 18" strokeLinecap="round" />
                </g>
            ) : variant === "search" ? (
                <g
                    fill="none"
                    stroke={`url(#${fillId})`}
                    strokeLinecap="round"
                    strokeWidth="3"
                >
                    <circle cx="44" cy="44" r="16" />
                    <path d="M56 56 L 70 70" />
                </g>
            ) : variant === "members" ? (
                <g>
                    <circle
                        cx="36"
                        cy="40"
                        fill={`url(#${fillId})`}
                        opacity="0.85"
                        r="11"
                    />
                    <circle
                        cx="60"
                        cy="40"
                        fill={`url(#${fillId})`}
                        opacity="0.55"
                        r="11"
                    />
                    <path
                        d="M22 70 c 0-9 6-15 14-15 s 14 6 14 15"
                        fill="none"
                        stroke={`url(#${fillId})`}
                        strokeLinecap="round"
                        strokeWidth="2.5"
                    />
                    <path
                        d="M44 70 c 0-9 6-15 14-15 s 14 6 14 15"
                        fill="none"
                        opacity="0.55"
                        stroke={`url(#${fillId})`}
                        strokeLinecap="round"
                        strokeWidth="2.5"
                    />
                </g>
            ) : (
                <g
                    fill="none"
                    stroke={`url(#${fillId})`}
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                >
                    <rect height="50" rx="6" width="40" x="28" y="24" />
                    <path d="M40 24 v -3 a 4 4 0 0 1 4-4 h 8 a 4 4 0 0 1 4 4 v 3" />
                    <path
                        d="M36 44 l 6 6 l 14-14"
                        stroke={semantic.success}
                        strokeLinecap="round"
                        strokeWidth="3"
                    />
                </g>
            )}
        </svg>
    );
};

export default EmptyIllustration;
