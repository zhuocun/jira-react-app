import { Divider } from "antd";
import RegisterForm from "../components/registerForm";
import Link from "antd/lib/typography/Link";
import { AuthTitle } from "../layouts/authLayout";
import { useState } from "react";
import { useNavigate } from "react-router";
import useAuth from "../utils/hooks/useAuth";
import ErrorBox from "../components/errorBox";

const RegisterPage = () => {
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [error, setError] = useState<Error | null>(null);
    const handleSwitch = () => {
        navigate("/login");
    };

    if (user && token) {
        return null;
    } else {
        return (
            <>
                <AuthTitle>Register for an account</AuthTitle>
                <ErrorBox error={error} />
                <RegisterForm onError={setError} />
                <Divider />
                <Link onClick={handleSwitch}>Log in to your account</Link>
            </>
        );
    }
};

export default RegisterPage;
