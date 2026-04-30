import { Divider } from "antd";
import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router";

import ErrorBox from "../components/errorBox";
import LoginForm from "../components/loginForm";
import { NoPaddingButton } from "../components/projectList";
import { AuthTitle } from "../layouts/authLayout";
import useAuth from "../utils/hooks/useAuth";

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
            <ErrorBox error={error} ref={errorRef} />
            <LoginForm onError={setError} />
            <Divider />
            <NoPaddingButton onClick={handleSwitch} type="link">
                Register for an account
            </NoPaddingButton>
        </>
    );
};

export default LoginPage;
