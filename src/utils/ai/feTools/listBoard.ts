import type { FeTool } from "./types";

/**
 * `fe.listBoard` — return the columns ("boards" in the API) for a given
 * project. Mirrors the query key used by `useDragEnd` and the board page:
 * `["boards", { projectId }]`.
 */
export const listBoardTool: FeTool<{ projectId?: string } | void, IColumn[]> = {
    name: "fe.listBoard",
    description:
        "Return the columns (board) for a project, in their stored order.",
    run: (args, ctx) => {
        const projectId =
            (args && "projectId" in args ? args.projectId : undefined) ??
            ctx.projectId;
        if (!projectId) return [];
        const data = ctx.queryClient.getQueryData<IColumn[]>([
            "boards",
            { projectId }
        ]);
        if (!data) return [];
        return [...data].sort((a, b) => a.index - b.index);
    }
};
