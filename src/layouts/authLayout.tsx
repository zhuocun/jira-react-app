import styled from "@emotion/styled";
import { Button, Card } from "antd";
import { Outlet } from "react-router";

import left from "../assets/left.svg";
import logo from "../assets/logo.svg";
import right from "../assets/right.svg";

const AuthLayout = () => {
    return (
        <Container>
            <Header />
            <Background />
            <ShadowCard>
                <Outlet />
            </ShadowCard>
        </Container>
    );
};

export default AuthLayout;

const Container = styled.div`
    align-items: center;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
`;

export const AuthTitle = styled.h3`
    color: rgb(94, 108, 132);
    margin-bottom: 2.4rem;
`;

const Header = styled.header`
    background: url(${logo}) no-repeat center;
    background-size: 8rem;
    padding: 5rem 0;
    width: 100%;
`;

const Background = styled.div`
    background-attachment: fixed;
    background-image: url(${left}), url(${right});
    background-position: left bottom, right bottom;
    background-repeat: no-repeat;
    background-size: calc(((100vw - 40rem) / 2) - 3.2rem),
        calc(((100vw - 40rem) / 2) - 3.2rem), cover;
    height: 100%;
    position: absolute;
    width: 100%;
`;

const ShadowCard = styled(Card)`
    border-radius: 0.3rem;
    box-shadow: rgba(0, 0, 0, 0.1) 0 0 10px;
    box-sizing: border-box;
    min-height: 56rem;
    padding: 3.2rem 4rem;
    text-align: center;
    width: 40rem;
`;

export const AuthButton = styled(Button)`
    width: 100%;
`;
