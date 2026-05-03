import styled from "@emotion/styled";
import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router";

import ErrorBox from "../components/errorBox";
import { NoPaddingButton } from "../components/projectList";
import RegisterForm from "../components/registerForm";
import { microcopy } from "../constants/microcopy";
import { AuthSubtitle, AuthTitle } from "../layouts/authLayout";
import { fontSize, space } from "../theme/tokens";
import useAuth from "../utils/hooks/useAuth";
import useTitle from "../utils/hooks/useTitle";

const SwitchRow = styled.p`
    color: var(--ant-color-text-secondary, rgba(15, 23, 42, 0.6));
    font-size: ${fontSize.sm}px;
    margin: ${space.lg}px 0 0;
    text-align: center;
`;

const RegisterPage = () => {
    useTitle(microcopy.actions.signUp);
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [error, setError] = useState<Error | null | IError>(null);
    const errorRef = useRef<HTMLDivElement | null>(null);
    const handleSwitch = () => {
        navigate("/login", { viewTransition: true });
    };

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
            <AuthTitle>{microcopy.auth.registerTitle}</AuthTitle>
            <AuthSubtitle>{microcopy.auth.registerSubtitle}</AuthSubtitle>
            <ErrorBox error={error} ref={errorRef} />
            <RegisterForm onError={setError} />
            <SwitchRow>
                {microcopy.auth.switchToLogin}{" "}
                <NoPaddingButton onClick={handleSwitch} type="link">
                    {microcopy.actions.loginCta}
                </NoPaddingButton>
            </SwitchRow>
        </>
    );
};

export default RegisterPage;
