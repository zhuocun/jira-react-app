import { Typography } from "antd";

const isErrorPayload = (error: unknown): error is IError =>
    error !== null && typeof error === "object" && "error" in error;

const getApiErrorMessage = (
    error: IError["error"] | string | unknown
): string => {
    if (typeof error === "string") {
        return error || "Operation failed";
    }

    if (Array.isArray(error)) {
        const message = error.find(
            (item): item is { msg?: string } =>
                Boolean(item) && typeof item === "object"
        )?.msg;
        return message || "Operation failed";
    }

    return "Operation failed";
};

const ErrorBox: React.FC<{ error: Error | IError | unknown }> = ({ error }) => {
    if (error instanceof Error) {
        return (
            <Typography.Text type="danger">
                {error.message || "Operation failed"}
            </Typography.Text>
        );
    }
    if (isErrorPayload(error) && error.error != null) {
        return (
            <Typography.Text type="danger">
                {getApiErrorMessage(error.error)}
            </Typography.Text>
        );
    }
    return null;
};

export default ErrorBox;
