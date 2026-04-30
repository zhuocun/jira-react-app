import styled from "@emotion/styled";

import { breakpoints, pageMaxWidthRem, space } from "../../theme/tokens";

/**
 * Routed page wrapper. Owns horizontal/vertical padding so individual
 * pages don't reinvent it. Padding shrinks below `md` so narrow
 * viewports don't waste a third of the screen on whitespace, and
 * honours iOS safe-area insets on devices with a notch / gesture bar.
 *
 * `max-width` caps the line length on ultra-wide monitors so headings
 * and tables don't sprawl. The board page opts out (full-bleed columns).
 */
const PageContainer = styled.div`
    margin-inline: auto;
    max-width: ${pageMaxWidthRem}rem;
    padding: ${space.lg}px ${space.md}px;
    padding-block-end: max(${space.lg}px, env(safe-area-inset-bottom));
    padding-inline-start: max(${space.md}px, env(safe-area-inset-left));
    padding-inline-end: max(${space.md}px, env(safe-area-inset-right));
    width: 100%;

    @media (min-width: ${breakpoints.md}px) {
        padding: ${space.xl}px ${space.xl}px ${space.xxl}px;
        padding-inline-start: max(${space.xl}px, env(safe-area-inset-left));
        padding-inline-end: max(${space.xl}px, env(safe-area-inset-right));
    }
`;

export default PageContainer;
