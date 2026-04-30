import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { Form, Input } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router";

import { microcopy } from "../../constants/microcopy";
import { AuthButton } from "../../layouts/authLayout";
import useReactMutation from "../../utils/hooks/useReactMutation";

const inputSize = "large" as const;

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
                    {
                        required: true,
                        message: microcopy.validation.emailRequired
                    },
                    {
                        type: "email",
                        message: microcopy.validation.emailInvalid
                    }
                ]}
            >
                <Input
                    autoComplete="email"
                    enterKeyHint="next"
                    inputMode="email"
                    onChange={() => onError(null)}
                    placeholder="name@example.com"
                    size={inputSize}
                    type="email"
                    id="email"
                />
            </Form.Item>
            <Form.Item
                extra={
                    <span
                        aria-atomic="true"
                        aria-live="polite"
                        role="status"
                        style={{ minHeight: "1.25em", display: "inline-block" }}
                    >
                        {capsLockOn ? microcopy.a11y.capsLockOn : ""}
                    </span>
                }
                label={microcopy.fields.password}
                name="password"
                rules={[
                    {
                        required: true,
                        message: microcopy.validation.passwordRequired
                    }
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
                    size={inputSize}
                    id="password"
                />
            </Form.Item>
            <Form.Item>
                <AuthButton
                    loading={isLoading}
                    htmlType="submit"
                    type="primary"
                >
                    {isLoading
                        ? microcopy.actions.loggingIn
                        : microcopy.actions.logIn}
                </AuthButton>
            </Form.Item>
        </Form>
    );
};

export default LoginForm;
