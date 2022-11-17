import { register } from "../../utils/authProvider";
import { Button, Form, Input } from "antd";

const Register: React.FC<{
    setIsRegistered: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ setIsRegistered }) => {
    const handleSubmit = (input: { username: string; password: string }) => {
        register(input).then((res) => {
            if (res.ok) {
                setIsRegistered(true);
            }
        });
    };
    return (
        <Form onFinish={handleSubmit}>
            <Form.Item
                name={"username"}
                rules={[{ required: true, message: "Please input username" }]}
            >
                <Input placeholder={"Username"} type={"text"} id={"username"} />
            </Form.Item>
            <Form.Item
                name={"password"}
                rules={[{ required: true, message: "Please input password" }]}
            >
                <Input
                    placeholder={"Password"}
                    type={"password"}
                    id={"password"}
                />
            </Form.Item>
            <Form.Item>
                <Button htmlType={"submit"} type={"primary"}>
                    Register
                </Button>
            </Form.Item>
        </Form>
    );
};

export default Register;
