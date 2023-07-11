import { Typography } from "antd";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ErrorBox: React.FC<{ error: Error | IError | null | any }> = ({
    error
}) => {
    if (error instanceof Error) {
        return (
            <Typography.Text type="danger">
                {error.message || "Operation failed"}
            </Typography.Text>
        );
    }
    if (error?.error != null) {
        if (typeof error.error === "string") {
            return (
                <Typography.Text type="danger">{error.error}</Typography.Text>
            );
        }
        return (
            <Typography.Text type="danger">
                {error.error[0].msg || "Operation failed"}
            </Typography.Text>
        );
    }
    return null;
};

export default ErrorBox;
