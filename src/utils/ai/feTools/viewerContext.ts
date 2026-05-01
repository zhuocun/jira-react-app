import type { FeTool } from "./types";

interface ViewerContextResult {
    user: { id?: string; username?: string } | null;
    role: string | null;
    currentRoute: string | null;
    focusedTaskId: string | null;
    selectionIds: string[];
}

/**
 * `fe.viewerContext` — small, well-known bundle of viewer signals that the
 * agent uses to anchor responses ("the task you have open", "the project
 * you're on"). Reads from the auth-user cache and `window.location`. Falls
 * back to nulls so SSR / tests do not throw.
 */
export const viewerContextTool: FeTool<
    {
        focusedTaskId?: string;
        selectionIds?: string[];
    } | void,
    ViewerContextResult
> = {
    name: "fe.viewerContext",
    description:
        "Return basic viewer context: user, role, current route, focused task, selection.",
    run: (args, ctx) => {
        const cachedUser = ctx.queryClient.getQueryData<IUser>(["auth/me"]);
        const safeRoute =
            typeof window !== "undefined" && window.location
                ? window.location.pathname
                : null;
        return {
            user: cachedUser
                ? {
                      id: cachedUser._id,
                      username: cachedUser.username
                  }
                : null,
            role: null,
            currentRoute: safeRoute,
            focusedTaskId: args?.focusedTaskId ?? null,
            selectionIds: args?.selectionIds ?? []
        };
    }
};
