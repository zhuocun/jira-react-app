import styled from "@emotion/styled";
import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router";

import ErrorBox from "../components/errorBox";
import LoginForm from "../components/loginForm";
import { NoPaddingButton } from "../components/projectList";
import { AuthSubtitle, AuthTitle } from "../layouts/authLayout";
import { fontSize, space } from "../theme/tokens";
import useAuth from "../utils/hooks/useAuth";

const SwitchRow = styled.p`
    color: var(--ant-color-text-secondary, rgba(15, 23, 42, 0.6));
    font-size: ${fontSize.sm}px;
    margin: ${space.lg}px 0 0;
    text-align: center;
`;

const LoginPage = () => {
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [error, setError] = useState<Error | IError | null>(null);
    const errorRef = useRef<HTMLDivElement | null>(null);
    const handleSwitch = () => {
        navigate("/register");
    };

    // When a server error appears, move focus to the alert so screen-reader
    // and keyboard users immediately learn what went wrong.
    useEffect(() => {
        if (error) {
            errorRef.current?.focus();
        }
    }, [error]);

    if (user && token) {
        return <Navigate to="/projects" replace />;
    }

    return (
        <>
            <AuthTitle>Log in to your account</AuthTitle>
            <AuthSubtitle>
                Enter your email and password to continue.
            </AuthSubtitle>
            <ErrorBox error={error} ref={errorRef} />
            <LoginForm onError={setError} />
            <SwitchRow>
                Don&apos;t have an account?{" "}
                <NoPaddingButton onClick={handleSwitch} type="link">
                    Register for an account
                </NoPaddingButton>
            </SwitchRow>
        </>
    );
};

export default LoginPage;
