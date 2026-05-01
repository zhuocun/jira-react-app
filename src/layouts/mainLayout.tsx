import styled from "@emotion/styled";
import { Outlet } from "react-router";

import Header from "../components/header";
import ProjectModal from "../components/projectModal";
import { fontSize, fontWeight, radius, space } from "../theme/tokens";

const Container = styled.div`
    background: var(--ant-color-bg-layout, #f7f8fb);
    color: var(--ant-color-text, rgba(15, 23, 42, 0.92));
    display: grid;
    grid-template-rows: auto 1fr;
    min-height: 100vh;
    min-height: 100dvh;
`;

const Main = styled.main`
    display: flex;
    flex-direction: column;
    min-height: 0;
`;

/**
 * Skip-to-content link. Hidden until focused, then renders a high-contrast
 * pill at the top of the viewport so keyboard users can bypass the header
 * and land on the routed page content (WCAG 2.4.1 Bypass Blocks).
 */
const SkipLink = styled.a`
    background: var(--ant-color-primary, #5e6ad2);
    border-radius: ${radius.md}px;
    color: #fff;
    font-size: ${fontSize.sm}px;
    font-weight: ${fontWeight.semibold};
    left: ${space.sm}px;
    padding: ${space.xs}px ${space.md}px;
    position: absolute;
    text-decoration: none;
    top: ${space.sm}px;
    transform: translateY(-200%);
    transition: transform 120ms ease-out;
    z-index: 9999;

    &:focus,
    &:focus-visible {
        outline: 2px solid #fff;
        outline-offset: 2px;
        transform: translateY(0);
    }
`;

/**
 * Application shell. Header + outlet + always-mounted ProjectModal drawer.
 *
 * The previous version hard-coded `min-width: 1024px`, `max-height: 1440px`,
 * and `overflow: scroll` on `<main>`, which blocked mobile/tablet entirely
 * and produced double scrollbars (the inner column container scrolls too).
 * We now let the inner regions own scroll and let the page reflow at any
 * width down to 320px (WCAG 1.4.10).
 */
const MainLayout = () => {
    return (
        <Container>
            <SkipLink href="#main-content">Skip to main content</SkipLink>
            <Header />
            <Main id="main-content" tabIndex={-1}>
                <Outlet />
            </Main>
            <ProjectModal />
        </Container>
    );
};

export default MainLayout;
