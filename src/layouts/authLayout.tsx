import styled from "@emotion/styled";
import { Button, Card } from "antd";
import { Outlet } from "react-router";

import left from "../assets/left.svg";
import logo from "../assets/logo.svg";
import right from "../assets/right.svg";
import { space } from "../theme/tokens";

const Container = styled.div`
    align-items: center;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    min-height: 100dvh;
    padding: ${space.md}px;
    padding-block-start: max(${space.md}px, env(safe-area-inset-top));
`;

/**
 * Page-level heading for auth screens. Rendered as an `h1` for correct
 * document outline (login/register are top-level pages); kept visually at
 * the existing "h3" size to preserve the layout.
 */
export const AuthTitle = styled.h1`
    color: var(--ant-color-text, rgba(0, 0, 0, 0.88));
    font-size: 1.17em;
    font-weight: 600;
    margin-bottom: ${space.lg}px;
    margin-top: 0;
`;

const Header = styled.header`
    background: url(${logo}) no-repeat center;
    background-size: 8rem;
    padding: ${space.xl}px 0 ${space.lg}px;
    width: 100%;
`;

const Background = styled.div`
    background-attachment: fixed;
    background-image: url(${left}), url(${right});
    background-position:
        left bottom,
        right bottom;
    background-repeat: no-repeat;
    background-size: min(40vw, 32rem), min(40vw, 32rem), cover;
    height: 100%;
    pointer-events: none;
    position: absolute;
    width: 100%;
    z-index: -1;

    @media (max-width: 720px) {
        display: none;
    }
`;

const ShadowCard = styled(Card)`
    border-radius: 8px;
    box-shadow: rgba(0, 0, 0, 0.1) 0 0 10px;
    box-sizing: border-box;
    max-width: 40rem;
    padding: ${space.lg}px ${space.xl}px;
    text-align: center;
    width: min(40rem, 100% - ${space.xl}px);
`;

export const AuthButton = styled(Button)`
    width: 100%;
`;

const AuthLayout = () => {
    return (
        <Container>
            <Header aria-hidden="true" />
            <Background aria-hidden="true" />
            <ShadowCard>
                <Outlet />
            </ShadowCard>
        </Container>
    );
};

export default AuthLayout;
