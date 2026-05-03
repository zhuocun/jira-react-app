import React, { useId } from "react";

import { sparkleSize, type SparkleSize } from "../../theme/aiTokens";

/**
 * AI accent sparkle. Renders a violet→indigo→pink gradient that visually
 * separates AI surfaces from the rest of the brand.
 *
 * SSR safety (PRD v3 S-R1): the gradient id is sourced from React's
 * `useId()` so multiple instances on the same page don't collide and
 * server-rendered output matches the hydrated DOM. The previous
 * module-level counter crashed on SSR and produced duplicate IDs after
 * Vite HMR.
 *
 * Theming (S-R2): each gradient stop binds to a CSS custom property
 * (`--color-copilot-grad-*`) declared in `App.css`. Dark-mode shifts the
 * hue toward lavender so the icon stays readable on dark surfaces.
 *
 * Accessibility (S-R3, S-R4): when `aria-hidden` is true the icon
 * contributes nothing to the AX tree. When the icon is meaningful, an
 * explicit `aria-label` is rendered with `role="img"`.
 */
interface AiSparkleIconProps {
    /**
     * Optional sizing token (S-R4). `sm` ≈ 14 px, `md` ≈ 18 px, `lg` ≈ 24 px.
     * Without this prop the icon scales to the surrounding font (`1em`).
     */
    size?: SparkleSize;
    style?: React.CSSProperties;
    /**
     * Accessible name when the icon stands alone as a meaningful image.
     * If omitted (or `aria-hidden` is true) the icon is treated as
     * decorative.
     */
    title?: string;
    /**
     * When true, the icon contributes nothing to the accessibility tree
     * and the surrounding labeled control owns the accessible name. This
     * prevents the icon's "Board Copilot" label from leaking into a
     * button's accessible name (e.g. "Board Copilot Search").
     */
    "aria-hidden"?: boolean;
}

const AiSparkleIcon: React.FC<AiSparkleIconProps> = ({
    size,
    style,
    title,
    "aria-hidden": ariaHidden
}) => {
    const id = useId();
    const dim = size ? sparkleSize[size] : undefined;
    const sizeProps =
        dim !== undefined
            ? { height: dim, width: dim }
            : { height: "1em", width: "1em" };
    const baseStyle: React.CSSProperties = {
        verticalAlign: "-0.125em",
        ...style
    };
    if (ariaHidden) {
        return (
            <svg
                aria-hidden="true"
                fill="none"
                focusable="false"
                style={baseStyle}
                viewBox="0 0 24 24"
                {...sizeProps}
            >
                <defs>
                    <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop
                            offset="0%"
                            stopColor="var(--color-copilot-grad-start, #EA580C)"
                        />
                        <stop
                            offset="60%"
                            stopColor="var(--color-copilot-grad-mid, #EA580C)"
                        />
                        <stop
                            offset="100%"
                            stopColor="var(--color-copilot-grad-end, #F97316)"
                        />
                    </linearGradient>
                </defs>
                <path
                    d="M12 3l1.7 4.6L18 9l-4.3 1.4L12 15l-1.7-4.6L6 9l4.3-1.4L12 3z"
                    fill={`url(#${id})`}
                />
                <path
                    d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z"
                    fill={`url(#${id})`}
                    opacity="0.7"
                />
            </svg>
        );
    }
    return (
        <svg
            aria-label={title ?? "Board Copilot"}
            fill="none"
            role="img"
            style={baseStyle}
            viewBox="0 0 24 24"
            {...sizeProps}
        >
            <defs>
                <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop
                        offset="0%"
                        stopColor="var(--color-copilot-grad-start, #EA580C)"
                    />
                    <stop
                        offset="60%"
                        stopColor="var(--color-copilot-grad-mid, #EA580C)"
                    />
                    <stop
                        offset="100%"
                        stopColor="var(--color-copilot-grad-end, #F97316)"
                    />
                </linearGradient>
            </defs>
            <path
                d="M12 3l1.7 4.6L18 9l-4.3 1.4L12 15l-1.7-4.6L6 9l4.3-1.4L12 3z"
                fill={`url(#${id})`}
            />
            <path
                d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z"
                fill={`url(#${id})`}
                opacity="0.7"
            />
        </svg>
    );
};

export default AiSparkleIcon;
