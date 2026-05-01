import type { QueryClient } from "@tanstack/react-query";

/**
 * Context passed to every FE tool implementation. Tools read from the React
 * Query cache (via `queryClient.getQueryData`) and receive the optional
 * `projectId` / `userId` so they can scope or filter the result. Additional
 * keys are allowed so callers can plug in viewport selection state, focus
 * info, draft buffers, etc., without us reshaping the registry contract.
 */
export interface FeToolContext {
    queryClient: QueryClient;
    projectId?: string;
    userId?: string;
    [key: string]: unknown;
}

export interface FeTool<Args = unknown, Result = unknown> {
    name: string;
    description: string;
    run: (args: Args, ctx: FeToolContext) => Promise<Result> | Result;
}
