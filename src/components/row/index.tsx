import styled from "@emotion/styled";

/**
 * Lightweight horizontal flex row used by headers and toolbars.
 *
 * `gap` mirrors the original API: `gap={true}` applies a `2rem` gap,
 * `gap={n}` applies `n` rem, and unset disables the gap.
 *
 * `marginBottom` is in rems and is only emitted when defined, so
 * unset callers do not produce the invalid CSS `margin-bottom: undefinedrem`.
 */
const Row = styled.div<{
    gap?: number | boolean;
    between?: boolean;
    marginBottom?: number;
}>`
    align-items: center;
    display: flex;
    justify-content: ${(props) =>
        props.between ? "space-between" : undefined};
    ${(props) =>
        typeof props.marginBottom === "number"
            ? `margin-bottom: ${props.marginBottom}rem;`
            : ""}

    > * {
        margin-top: 0 !important;
        margin-bottom: 0 !important;
        margin-right: ${(props) => {
            if (typeof props.gap === "number") return `${props.gap}rem`;
            if (props.gap) return "2rem";
            return undefined;
        }};
    }
`;

export default Row;
