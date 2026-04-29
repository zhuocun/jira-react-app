const nestedMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    if (Array.isArray(error)) {
        return nestedMessage(error[0]);
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
        return nestedMessage(nestedError ?? message ?? msg);
    }
    return "Operation failed";
};

/** Normalize login/register error payloads from varied backend shapes. */
const getAuthErrorMessage = (body: unknown): string => {
    if (body === null || body === undefined) {
        return "Request failed";
    }
    if (typeof body === "string") {
        return body;
    }
    if (typeof body === "object") {
        const record = body as { error?: unknown };
        const err = record.error;
        if (Array.isArray(err) && err.length > 0) {
            const first = err[0] as { msg?: unknown };
            if (first && typeof first === "object" && first.msg != null) {
                return String(first.msg);
            }
        }
    }
    return nestedMessage(body);
};

export default getAuthErrorMessage;
