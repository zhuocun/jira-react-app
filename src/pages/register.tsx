import { Divider, Typography } from "antd";
import RegisterForm from "../components/register";
import Link from "antd/lib/typography/Link";
import { AuthTitle } from "../layouts/authLayout";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../utils/context/authContext";

const RegisterPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [error, setError] = useState<Error | null>(null);
    const handleSwitch = () => {
        navigate("/login");
    };

    if (user) {
        return null;
    } else {
        return (
            <>
                <AuthTitle>Register for an account</AuthTitle>
                {error ? (
                    <Typography.Text type={"danger"}>
                        {error.message}
                    </Typography.Text>
                ) : null}
                <RegisterForm onError={setError} />
                <Divider />
                <Link onClick={handleSwitch}>Log in to your account</Link>
            </>
        );
    }
};

export default RegisterPage;