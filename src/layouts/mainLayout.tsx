import styled from "@emotion/styled";
import { Outlet } from "react-router";

import Header from "../components/header";
import ProjectModal from "../components/projectModal";

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
            <Header />
            <Main>
                <Outlet />
            </Main>
            <ProjectModal />
        </Container>
    );
};

export default MainLayout;
