import { useAuth } from "../../utils/context/authContext";
import { Form, Input } from "antd";
import { AuthButton } from "../../layouts/authLayout";

const LoginForm: React.FC = () => {
    const { login } = useAuth();
    const handleSubmit = (input: { username: string; password: string }) => {
        login(input);
    };
    return (
        <Form onFinish={handleSubmit}>
            <Form.Item
                name={"username"}
                rules={[{ required: true, message: "Enter your username" }]}
            >
                <Input placeholder={"Username"} type={"text"} id={"username"} />
            </Form.Item>
            <Form.Item
                name={"password"}
                rules={[{ required: true, message: "Enter your password" }]}
            >
                <Input
                    placeholder={"Password"}
                    type={"password"}
                    id={"password"}
                />
            </Form.Item>
            <Form.Item>
                <AuthButton htmlType={"submit"} type={"primary"}>
                    Log in
                </AuthButton>
            </Form.Item>
        </Form>
    );
};

export default LoginForm;
