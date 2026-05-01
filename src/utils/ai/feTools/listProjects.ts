import type { FeTool } from "./types";

/**
 * `fe.listProjects` — read-only proxy to the cached projects query
 * (`useReactQuery<IProject[]>("projects")`). Returns an empty list if the
 * cache has not been populated yet so the agent can degrade gracefully.
 */
export const listProjectsTool: FeTool<void, IProject[]> = {
    name: "fe.listProjects",
    description:
        "List every project the viewer can see (from the local React Query cache).",
    run: (_args, ctx) => {
        const data = ctx.queryClient.getQueryData<IProject[]>(["projects"]);
        return data ?? [];
    }
};
