import type { FeTool } from "./types";

/**
 * `fe.getProject` — return one project by id from the cached project list.
 * The cache is the single source of truth: callers are expected to have
 * loaded the projects list first via the existing `useReactQuery` flow.
 */
export const getProjectTool: FeTool<{ projectId: string }, IProject | null> = {
    name: "fe.getProject",
    description: "Return one project by id, or null if not in the cache.",
    run: (args, ctx) => {
        const projectId = args?.projectId ?? ctx.projectId;
        if (!projectId) return null;
        const data = ctx.queryClient.getQueryData<IProject[]>(["projects"]);
        if (!data) return null;
        return data.find((p) => p._id === projectId) ?? null;
    }
};
