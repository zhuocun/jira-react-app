import { Divider } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router";

import ErrorBox from "../components/errorBox";
import LoginForm from "../components/loginForm";
import { NoPaddingButton } from "../components/projectList";
import { AuthTitle } from "../layouts/authLayout";
import useAuth from "../utils/hooks/useAuth";

const LoginPage = () => {
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [error, setError] = useState<Error | null>(null);
    const handleSwitch = () => {
        navigate("/register");
    };

    if (user && token) {
        return null;
    }
    return (
        <>
            <AuthTitle>Log in to your account</AuthTitle>
            <ErrorBox error={error} />
            <LoginForm onError={setError} />
            <Divider />
            <NoPaddingButton onClick={handleSwitch} type="link">
                Register for an account
            </NoPaddingButton>
        </>
    );
};

export default LoginPage;
