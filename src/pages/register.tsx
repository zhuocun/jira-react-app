import { Divider } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router";

import ErrorBox from "../components/errorBox";
import { NoPaddingButton } from "../components/projectList";
import RegisterForm from "../components/registerForm";
import { AuthTitle } from "../layouts/authLayout";
import useAuth from "../utils/hooks/useAuth";

const RegisterPage = () => {
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [error, setError] = useState<Error | null>(null);
    const handleSwitch = () => {
        navigate("/login");
    };

    if (user && token) {
        return null;
    }
    return (
        <>
            <AuthTitle>Register for an account</AuthTitle>
            <ErrorBox error={error} />
            <RegisterForm onError={setError} />
            <Divider />
            <NoPaddingButton onClick={handleSwitch}>
                Log in to your account
            </NoPaddingButton>
        </>
    );
};

export default RegisterPage;
