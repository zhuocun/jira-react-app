import { Divider, Typography } from "antd";
import LoginForm from "../components/loginForm";
import Link from "antd/lib/typography/Link";
import { AuthTitle } from "../layouts/authLayout";
import { useState } from "react";
import { useNavigate } from "react-router";
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
                {error ? (
                    <Typography.Text type={"danger"}>
                        {error.message || "Failed to login"}
                    </Typography.Text>
                ) : null}
                <LoginForm onError={setError} />
                <Divider />
                <Link onClick={handleSwitch}>Register for an account</Link>
            </>
        );
    }
};

export default LoginPage;
