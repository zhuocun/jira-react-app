import type { FeTool } from "./types";

/**
 * `fe.getTask` — return one task by id. Looks under both the project-scoped
 * cache (`["tasks", { projectId }]`) and falls back to scanning every cached
 * task list, so the agent can deep-link into a task even when the project
 * id is unknown.
 */
export const getTaskTool: FeTool<
    { taskId: string; projectId?: string },
    ITask | null
> = {
    name: "fe.getTask",
    description: "Return one task by id, or null if not in the cache.",
    run: (args, ctx) => {
        const projectId = args?.projectId ?? ctx.projectId;
        if (!args?.taskId) return null;
        if (projectId) {
            const list =
                ctx.queryClient.getQueryData<ITask[]>([
                    "tasks",
                    { projectId }
                ]) ?? [];
            const hit = list.find((t) => t._id === args.taskId);
            if (hit) return hit;
        }
        // Best-effort fallback — scan every cached `tasks*` query.
        const cache = ctx.queryClient.getQueryCache().getAll();
        for (const entry of cache) {
            const key = entry.queryKey;
            if (
                Array.isArray(key) &&
                typeof key[0] === "string" &&
                key[0].startsWith("tasks")
            ) {
                const list = entry.state.data as ITask[] | undefined;
                const hit = list?.find((t) => t._id === args.taskId);
                if (hit) return hit;
            }
        }
        return null;
    }
};
