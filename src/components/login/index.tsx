import { useAuth } from "../../utils/context/authContext";
import { Form, Input } from "antd";
import { AuthButton } from "../../layouts/authLayout";
import useAsync from "../../utils/hooks/useAsync";

const LoginForm: React.FC<{
    onError: React.Dispatch<React.SetStateAction<Error | null>>;
}> = ({ onError }) => {
    const { login } = useAuth();
    const { run, isLoading } = useAsync(undefined, { throwOnError: true });
    const handleSubmit = async (input: { email: string; password: string }) => {
        await run(login(input)).catch(onError);
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
