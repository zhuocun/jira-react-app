import { Divider, Typography } from "antd";
import LoginForm from "../components/login";
import Link from "antd/lib/typography/Link";
import { AuthTitle } from "../layouts/authLayout";
import { useState } from "react";
import { useNavigate } from "react-router";

const LoginPage = () => {
    const navigate = useNavigate();
    const [error, setError] = useState<Error | null>(null);
    const handleSwitch = () => {
        navigate("/register");
    };

    return (
        <>
            <AuthTitle>Log in to your account</AuthTitle>
            {error ? (
                <Typography.Text type={"danger"}>
                    {error.message}
                </Typography.Text>
            ) : null}
            <LoginForm onError={setError} />
            <Divider />
            <Link onClick={handleSwitch}>Register for an account</Link>
        </>
    );
};

export default LoginPage;
