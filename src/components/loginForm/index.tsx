import { Form, Input } from "antd";
import { useNavigate } from "react-router";

import { AuthButton } from "../../layouts/authLayout";
import useReactMutation from "../../utils/hooks/useReactMutation";

const LoginForm: React.FC<{
    onError: React.Dispatch<React.SetStateAction<Error | null>>;
}> = ({ onError }) => {
    const navigate = useNavigate();
    const { mutateAsync, isLoading } = useReactMutation<IUser>(
        "auth/login",
        "POST",
        "users",
        undefined,
        onError,
        true
    );
    const handleSubmit = async (input: { email: string; password: string }) => {
        await mutateAsync(input)
            .then((res) => {
                localStorage.setItem("Token", res.jwt);
            })
            .then(() => navigate("/projects"));
    };

    return (
        <Form onFinish={handleSubmit}>
            <Form.Item
                name={"email"}
                rules={[
                    { required: true, message: "Please enter an email" },
                    {
                        type: "email",
                        message: "Please enter a valid email address"
                    }
                ]}
            >
                <Input
                    onChange={() => onError(null)}
                    placeholder={"Email"}
                    type={"text"}
                    id={"email"}
                />
            </Form.Item>
            <Form.Item
                name={"password"}
                rules={[
                    { required: true, message: "Please enter your password" }
                ]}
            >
                <Input
                    onChange={() => onError(null)}
                    placeholder={"Password"}
                    type={"password"}
                    id={"password"}
                />
            </Form.Item>
            <Form.Item>
                <AuthButton
                    loading={isLoading}
                    htmlType={"submit"}
                    type={"primary"}
                >
                    Log in
                </AuthButton>
            </Form.Item>
        </Form>
    );
};

export default LoginForm;
