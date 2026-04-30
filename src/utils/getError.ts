const getErrorMessage = (error: unknown): string | null => {
    if (error instanceof Error) return error.message || "Operation failed";
    if (typeof error === "string") return error || "Operation failed";
    if (Array.isArray(error)) {
        return getErrorMessage(error[0]);
    }
    if (error && typeof error === "object") {
        const {
            error: nestedError,
            message,
            msg
        } = error as {
            error?: unknown;
            message?: unknown;
            msg?: unknown;
        };
        return (
            getErrorMessage(nestedError) ??
            getErrorMessage(message) ??
            getErrorMessage(msg)
        );
    }

    return null;
};

const getError = (error: unknown): Error => {
    if (error instanceof Error) return error;
    return new Error(getErrorMessage(error) ?? "Operation failed");
};

export default getError;
