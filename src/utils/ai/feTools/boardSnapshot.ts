import type { FeTool } from "./types";

/**
 * `fe.boardSnapshot` — compact, model-friendly summary of the board state
 * for the current project (PRD §5.7). Counts, members, unowned tasks, and
 * per-coordinator workload are produced from the React Query cache.
 *
 * Long task notes are redacted to `head + tail + length` (placeholder for
 * the SHA mentioned in the PRD) to keep the agent input small. We use
 * `length` instead of a real cryptographic hash because the FE bundle
 * intentionally does not depend on `crypto` for Phase A — the redaction
 * only needs to be stable enough that the agent can detect duplicates.
 */
const NOTE_BUDGET = 4 * 1024;
const HEAD_BYTES = 1024;
const TAIL_BYTES = 512;

const redactNote = (note: string | undefined): string | undefined => {
    if (!note) return note;
    if (note.length <= NOTE_BUDGET) return note;
    const head = note.slice(0, HEAD_BYTES);
    const tail = note.slice(-TAIL_BYTES);
    return `${head}…[redacted len=${note.length}]…${tail}`;
};

export interface BoardSnapshotResult {
    counts: {
        total: number;
        byColumn: Array<{ columnId: string; count: number }>;
    };
    members: Array<{ id: string; name: string }>;
    unowned: Array<{ taskId: string; name: string; note?: string }>;
    workload: Array<{ coordinatorId: string; count: number; points: number }>;
}

export const boardSnapshotTool: FeTool<
    { projectId?: string } | void,
    BoardSnapshotResult
> = {
    name: "fe.boardSnapshot",
    description:
        "Compact board summary: counts per column, members, unowned tasks, workload.",
    run: (args, ctx) => {
        const projectId =
            (args && "projectId" in args ? args.projectId : undefined) ??
            ctx.projectId;
        const empty: BoardSnapshotResult = {
            counts: { total: 0, byColumn: [] },
            members: [],
            unowned: [],
            workload: []
        };
        if (!projectId) return empty;
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

        const sortedColumns = [...columns].sort((a, b) => a.index - b.index);
        const memberById = new Map(members.map((m) => [m._id, m]));

        const byColumn = sortedColumns.map((col) => ({
            columnId: col._id,
            count: tasks.filter((t) => t.columnId === col._id).length
        }));
        const unowned = tasks
            .filter((t) => !t.coordinatorId || !memberById.has(t.coordinatorId))
            .map((t) => ({
                taskId: t._id,
                name: t.taskName,
                note: redactNote(t.note)
            }));
        const workloadMap = new Map<
            string,
            { coordinatorId: string; count: number; points: number }
        >();
        for (const t of tasks) {
            if (!t.coordinatorId) continue;
            const entry = workloadMap.get(t.coordinatorId) ?? {
                coordinatorId: t.coordinatorId,
                count: 0,
                points: 0
            };
            entry.count += 1;
            entry.points += t.storyPoints ?? 0;
            workloadMap.set(t.coordinatorId, entry);
        }
        return {
            counts: { total: tasks.length, byColumn },
            members: members.map((m) => ({ id: m._id, name: m.username })),
            unowned,
            workload: Array.from(workloadMap.values()).sort(
                (a, b) => b.points - a.points
            )
        };
    }
};
