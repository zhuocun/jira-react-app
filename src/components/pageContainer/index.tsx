import styled from "@emotion/styled";

import { space } from "../../theme/tokens";

/**
 * Routed page wrapper. Owns horizontal/vertical padding so individual
 * pages don't reinvent it. Padding shrinks below `md` so narrow
 * viewports don't waste a third of the screen on whitespace, and
 * honours iOS safe-area insets on devices with a notch / gesture bar.
 */
const PageContainer = styled.div`
    padding: ${space.lg}px ${space.md}px;
    padding-block-end: max(${space.lg}px, env(safe-area-inset-bottom));
    padding-inline-start: max(${space.md}px, env(safe-area-inset-left));
    padding-inline-end: max(${space.md}px, env(safe-area-inset-right));
    width: 100%;

    @media (min-width: 768px) {
        padding: ${space.xl}px;
        padding-inline-start: max(${space.xl}px, env(safe-area-inset-left));
        padding-inline-end: max(${space.xl}px, env(safe-area-inset-right));
    }
`;

export default PageContainer;
