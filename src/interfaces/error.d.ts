/**
 * Backend validation error envelope. Matches the shape emitted by
 * jira-python-server (see app/validation.py `make_validation_error`):
 * each entry carries the human-readable `msg` plus optional metadata
 * the FE can use for per-field highlighting.
 */
interface IValidationError {
    msg: string;
    param?: string;
    location?: "body" | "query" | "params" | string;
    value?: unknown;
}

interface IError {
    error: IValidationError[] | string;
}
