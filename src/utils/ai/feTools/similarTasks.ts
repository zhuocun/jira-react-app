import { semanticSearch } from "../engine";

import type { FeTool } from "./types";

/**
 * `fe.similarTasks` — reuses the v1 deterministic Jaccard ranker exposed by
 * `engine.semanticSearch`. The agent passes a free-text `query` and (when
 * available) a `projectId`; we hydrate the project's task/column/member
 * caches and ask the v1 engine for ids ranked by token overlap.
 */
export const similarTasksTool: FeTool<
    { query: string; projectId?: string },
    { ids: string[]; rationale: string }
> = {
    name: "fe.similarTasks",
    description:
        "Return task ids ranked by semantic similarity to a free-text query.",
    run: (args, ctx) => {
        const query = args?.query ?? "";
        const projectId = args?.projectId ?? ctx.projectId;
        if (!projectId || !query.trim()) {
            return { ids: [], rationale: "Missing query or project id." };
        }
        const tasks =
            ctx.queryClient.getQueryData<ITask[]>(["tasks", { projectId }]) ??
            [];
        const columns =
            ctx.queryClient.getQueryData<IColumn[]>([
                "boards",
                { projectId }
            ]) ?? [];
        const members =
            ctx.queryClient.getQueryData<IMember[]>(["users/members"]) ?? [];
        const projects =
            ctx.queryClient.getQueryData<IProject[]>(["projects"]) ?? [];
        const project = projects.find((p) => p._id === projectId) ?? {
            _id: projectId,
            projectName: "Project"
        };
        return semanticSearch("tasks", query, {
            project,
            tasks,
            columns,
            members
        });
    }
};
