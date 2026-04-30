import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { Form, Input } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router";

import { microcopy } from "../../constants/microcopy";
import { AuthButton } from "../../layouts/authLayout";
import useReactMutation from "../../utils/hooks/useReactMutation";

const RegisterForm: React.FC<{
    onError: React.Dispatch<React.SetStateAction<Error | null | IError>>;
}> = ({ onError }) => {
    const navigate = useNavigate();
    const [capsLockOn, setCapsLockOn] = useState(false);
    const { mutateAsync, isLoading } = useReactMutation(
        "auth/register",
        "POST",
        undefined,
        undefined,
        onError,
        false
    );
    const handleSubmit = async (input: {
        username: string;
        email: string;
        password: string;
    }) => {
        try {
            await mutateAsync(input);
            navigate("/login");
        } catch {
            // Error state is set by useReactMutation's onError callback.
        }
    };
    return (
        <Form layout="vertical" onFinish={handleSubmit}>
            <Form.Item
                label={microcopy.fields.email}
                name="email"
                rules={[
                    { required: true, message: "Please enter an email" },
                    {
                        type: "email",
                        message: "Please enter a valid email address"
                    }
                ]}
            >
                <Input
                    autoComplete="email"
                    enterKeyHint="next"
                    inputMode="email"
                    onChange={() => onError(null)}
                    placeholder="Email"
                    type="email"
                    id="email"
                />
            </Form.Item>
            <Form.Item
                label={microcopy.fields.username}
                name="username"
                rules={[{ required: true, message: "Enter your username" }]}
            >
                <Input
                    autoComplete="username"
                    enterKeyHint="next"
                    onChange={() => onError(null)}
                    placeholder="Username"
                    type="text"
                    id="username"
                />
            </Form.Item>
            <Form.Item
                extra={
                    capsLockOn ? (
                        <span role="status">Caps Lock is on</span>
                    ) : null
                }
                label={microcopy.fields.password}
                name="password"
                rules={[{ required: true, message: "Enter your password" }]}
            >
                <Input.Password
                    autoComplete="new-password"
                    enterKeyHint="go"
                    iconRender={(visible) =>
                        visible ? (
                            <EyeOutlined aria-label={microcopy.actions.hidePassword} />
                        ) : (
                            <EyeInvisibleOutlined
                                aria-label={microcopy.actions.showPassword}
                            />
                        )
                    }
                    onChange={() => onError(null)}
                    onKeyUp={(event) =>
                        setCapsLockOn(
                            "getModifierState" in event &&
                                event.getModifierState("CapsLock")
                        )
                    }
                    placeholder="Password"
                    id="password"
                />
            </Form.Item>
            <Form.Item>
                <AuthButton
                    loading={isLoading}
                    htmlType="submit"
                    type="primary"
                >
                    {microcopy.actions.signUp}
                </AuthButton>
            </Form.Item>
        </Form>
    );
};

export default RegisterForm;
