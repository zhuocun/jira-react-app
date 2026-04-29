import React from "react";

const AiSparkleIcon: React.FC<{
    style?: React.CSSProperties;
    title?: string;
}> = ({ style, title }) => (
    <svg
        aria-label={title ?? "Board Copilot"}
        fill="none"
        height="1em"
        role="img"
        style={{ verticalAlign: "-0.125em", ...style }}
        viewBox="0 0 24 24"
        width="1em"
    >
        <path
            d="M12 3l1.7 4.6L18 9l-4.3 1.4L12 15l-1.7-4.6L6 9l4.3-1.4L12 3z"
            fill="currentColor"
        />
        <path
            d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z"
            fill="currentColor"
            opacity="0.7"
        />
    </svg>
);

export default AiSparkleIcon;
