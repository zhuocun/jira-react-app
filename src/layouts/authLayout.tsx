import { useState } from "react";
import RegisterForm from "../components/register";
import LoginForm from "../components/login";
import { Button, Card, Divider } from "antd";
import styled from "@emotion/styled";
import Link from "antd/lib/typography/Link";
import logo from "../assets/logo.svg";
import left from "../assets/left.svg";
import right from "../assets/right.svg";

const AuthLayout = () => {
    const [isRegistered, setIsRegistered] = useState(false);
    return (
        <Container>
            <Header />
            <Background />
            <ShadowCard>
                <Title>{isRegistered ? "Log in to your account" : "Register for an account"}</Title>
                {isRegistered ? (
                    <LoginForm />
                ) : (
                    <RegisterForm setIsRegistered={setIsRegistered} />
                )}
                <Divider />
                <Link onClick={() => setIsRegistered(!isRegistered)}>
                    {isRegistered ? "Register for an account" : "Log in to your account"}
                </Link>
            </ShadowCard>
        </Container>
    );
};

export default AuthLayout;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
`;

const Title = styled.h3`
  margin-bottom: 2.4rem;
  color: rgb(94, 108, 132);
`;

const Header = styled.header`
  background: url(${logo}) no-repeat center;
  padding: 5rem 0;
  background-size: 8rem;
  width: 100%;
`;

const Background = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-position: left bottom, right bottom;
  background-size: calc(((100vw - 40rem) / 2) - 3.2rem), calc(((100vw - 40rem) / 2) - 3.2rem), cover;
  background-image: url(${left}), url(${right});
`;

const ShadowCard = styled(Card)`
  width: 40rem;
  min-height: 56rem;
  padding: 3.2rem 4rem;
  border-radius: 0.3rem;
  box-sizing: border-box;
  box-shadow: rgba(0, 0, 0, 0.1) 0 0 10px;
  text-align: center;
`;

export const AuthButton = styled(Button)`
  width: 100%;
`;
