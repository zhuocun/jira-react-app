import { register } from "../../utils/authProvider";
import { Form, Input } from "antd";
import { AuthButton } from "../../layouts/authLayout";

const RegisterForm: React.FC<{
    setIsRegistered: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ setIsRegistered }) => {
    const handleSubmit = (input: { email: string; password: string }) => {
        register(input).then((res) => {
            if (res.ok) {
                setIsRegistered(true);
            }
        });
    };
    return (
        <Form onFinish={handleSubmit}>
            <Form.Item
                name={"email"}
                rules={[
                    { required: true, message: "Enter your email" },
                    {
                        type: "email",
                        message: "Invalid email"
                    }
                ]}
            >
                <Input placeholder={"Email"} type={"text"} id={"email"} />
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
                    Register
                </AuthButton>
            </Form.Item>
        </Form>
    );
};

export default RegisterForm;
