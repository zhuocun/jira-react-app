import React from "react";

let gradientId = 0;
const nextId = () => {
    gradientId += 1;
    return `aiSparkleGradient-${gradientId}`;
};

/**
 * AI accent sparkle. Renders a violet→indigo→pink gradient that visually
 * separates AI surfaces from the rest of the brand. Each render gets a
 * unique gradient id so multiple icons on the same page don't collide.
 */
const AiSparkleIcon: React.FC<{
    style?: React.CSSProperties;
    title?: string;
    /**
     * When true, the icon contributes nothing to the accessibility tree
     * and the surrounding labeled control owns the accessible name. This
     * prevents the icon's "Board Copilot" label from leaking into a
     * button's accessible name (e.g. "Board Copilot Search").
     */
    "aria-hidden"?: boolean;
}> = ({ style, title, "aria-hidden": ariaHidden }) => {
    const id = React.useMemo(() => nextId(), []);
    if (ariaHidden) {
        return (
            <svg
                aria-hidden="true"
                fill="none"
                focusable="false"
                height="1em"
                style={{ verticalAlign: "-0.125em", ...style }}
                viewBox="0 0 24 24"
                width="1em"
            >
                <defs>
                    <linearGradient
                        id={id}
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                    >
                        <stop offset="0%" stopColor="#7C5CFF" />
                        <stop offset="60%" stopColor="#5E6AD2" />
                        <stop offset="100%" stopColor="#C084FC" />
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
            height="1em"
            role="img"
            style={{ verticalAlign: "-0.125em", ...style }}
            viewBox="0 0 24 24"
            width="1em"
        >
            <defs>
                <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7C5CFF" />
                    <stop offset="60%" stopColor="#5E6AD2" />
                    <stop offset="100%" stopColor="#C084FC" />
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
