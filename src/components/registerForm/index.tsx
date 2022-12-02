import { Form, Input } from "antd";
import { AuthButton } from "../../layouts/authLayout";
import { useNavigate } from "react-router";
import useReactMutation from "../../utils/hooks/useReactMutation";

const RegisterForm: React.FC<{
    onError: React.Dispatch<React.SetStateAction<Error | null>>;
}> = ({ onError }) => {
    const navigate = useNavigate();
    const { mutateAsync, isLoading } = useReactMutation(
        "auth/register",
        "POST",
        undefined,
        undefined,
        undefined,
        false
    );
    const handleSubmit = async (input: {
        username: string;
        email: string;
        password: string;
    }) => {
        await mutateAsync(input)
            .then(() => navigate("/login"))
            .catch(onError);
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
                name={"username"}
                rules={[{ required: true, message: "Enter your username" }]}
            >
                <Input
                    onChange={() => onError(null)}
                    placeholder={"Username"}
                    type={"text"}
                    id={"username"}
                />
            </Form.Item>
            <Form.Item
                name={"password"}
                rules={[{ required: true, message: "Enter your password" }]}
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
                    Register
                </AuthButton>
            </Form.Item>
        </Form>
    );
};

export default RegisterForm;
