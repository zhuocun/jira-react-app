import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { Form, Input } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router";

import { microcopy } from "../../constants/microcopy";
import { AuthButton } from "../../layouts/authLayout";
import useReactMutation from "../../utils/hooks/useReactMutation";

const LoginForm: React.FC<{
    onError: React.Dispatch<React.SetStateAction<Error | IError | null>>;
}> = ({ onError }) => {
    const navigate = useNavigate();
    const [capsLockOn, setCapsLockOn] = useState(false);
    const { mutateAsync, isLoading } = useReactMutation<IUser>(
        "auth/login",
        "POST",
        "users",
        undefined,
        onError,
        true
    );
    const handleSubmit = async (input: { email: string; password: string }) => {
        try {
            const res = await mutateAsync(input);
            localStorage.setItem("Token", res.jwt);
            navigate("/projects");
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
                    autoComplete="username"
                    enterKeyHint="next"
                    inputMode="email"
                    onChange={() => onError(null)}
                    placeholder="Email"
                    type="email"
                    id="email"
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
                rules={[
                    { required: true, message: "Please enter your password" }
                ]}
            >
                <Input.Password
                    autoComplete="current-password"
                    enterKeyHint="go"
                    iconRender={(visible) =>
                        visible ? (
                            <EyeOutlined
                                aria-label={microcopy.actions.hidePassword}
                            />
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
                    {microcopy.actions.logIn}
                </AuthButton>
            </Form.Item>
        </Form>
    );
};

export default LoginForm;
