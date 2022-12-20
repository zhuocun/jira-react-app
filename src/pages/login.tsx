import { Divider } from "antd";
import Link from "antd/lib/typography/Link";
import { useState } from "react";
import { useNavigate } from "react-router";

import ErrorBox from "../components/errorBox";
import LoginForm from "../components/loginForm";
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
    } else {
        return (
            <>
                <AuthTitle>Log in to your account</AuthTitle>
                <ErrorBox error={error} />
                <LoginForm onError={setError} />
                <Divider />
                <Link onClick={handleSwitch}>Register for an account</Link>
            </>
        );
    }
};

export default LoginPage;
