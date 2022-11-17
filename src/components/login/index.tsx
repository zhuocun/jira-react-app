import { useAuth } from "../../utils/context/authContext";
import { Button, Form, Input } from "antd";

const Login: React.FC = () => {
    const { login } = useAuth();
    const handleSubmit = (input: { username: string, password: string }) => {
        login(input);
    };
    return (
        <Form onFinish={handleSubmit}>
            <Form.Item name={"username"} rules={[{ required: true, message: "Please input username" }]}>
                <Input placeholder={"Username"} type={"text"} id={"username"} />
            </Form.Item>
            <Form.Item name={"password"} rules={[{ required: true, message: "Please input password" }]}>
                <Input placeholder={"Password"} type={"password"} id={"password"} />
            </Form.Item>
            <Form.Item>
                <Button htmlType={"submit"} type={"primary"}>Login</Button>
            </Form.Item>
        </Form>
    );
};

export default Login;
