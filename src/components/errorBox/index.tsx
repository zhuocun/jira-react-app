import { Typography } from "antd";

const ErrorBox: React.FC<{ error: Error | unknown | null }> = ({ error }) => {
    if (error instanceof Error) {
        return (
            <Typography.Text type="danger">
                {error.message || "Operation failed"}
            </Typography.Text>
        );
    }
    return null;
};

export default ErrorBox;
