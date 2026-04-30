import { Divider } from "antd";
import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router";

import ErrorBox from "../components/errorBox";
import { NoPaddingButton } from "../components/projectList";
import RegisterForm from "../components/registerForm";
import { AuthTitle } from "../layouts/authLayout";
import useAuth from "../utils/hooks/useAuth";

const RegisterPage = () => {
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [error, setError] = useState<Error | null | IError>(null);
    const errorRef = useRef<HTMLDivElement | null>(null);
    const handleSwitch = () => {
        navigate("/login");
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
            <AuthTitle>Register for an account</AuthTitle>
            <ErrorBox error={error} ref={errorRef} />
            <RegisterForm onError={setError} />
            <Divider />
            <NoPaddingButton onClick={handleSwitch} type="link">
                Log in to your account
            </NoPaddingButton>
        </>
    );
};

export default RegisterPage;
