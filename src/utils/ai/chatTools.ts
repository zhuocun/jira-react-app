import filterRequest from "../filterRequest";

/** Read-only tool names exposed to Board Copilot chat (Phase 3). */
export const CHAT_TOOL_NAMES = [
    "listProjects",
    "listMembers",
    "getProject",
    "listBoard",
    "listTasks",
    "getTask"
] as const;

export type ChatToolName = (typeof CHAT_TOOL_NAMES)[number];

export interface AiChatToolCall {
    id: string;
    name: ChatToolName;
    arguments: Record<string, unknown>;
}

export interface AiChatExecutionContext {
    /** Current board project id — allowed target for board/task tools when applicable */
    projectId: string;
    /** Project ids the user may reference (current + loaded list cache) */
    knownProjectIds: Set<string>;
    /** Task ids considered valid for getTask / filtering */
    knownTaskIds: Set<string>;
    /** Member ids valid as coordinatorId filters */
    knownMemberIds: Set<string>;
    /** Column ids valid for listTasks filter */
    knownColumnIds: Set<string>;
}

export interface ApiCaller {
    (
        endpoint: string,
        config?: { data?: object; method?: string }
    ): Promise<unknown>;
}

const asString = (value: unknown): string | undefined =>
    typeof value === "string" ? value : undefined;

const ensureKnownProject = (
    projectId: string | undefined,
    ctx: AiChatExecutionContext
): string | null => {
    if (!projectId || !ctx.knownProjectIds.has(projectId)) return null;
    return projectId;
};

export const executeChatToolCall = async (
    api: ApiCaller,
    ctx: AiChatExecutionContext,
    call: AiChatToolCall,
    signal: AbortSignal
): Promise<unknown> => {
    if (signal.aborted) {
        throw new DOMException("aborted", "AbortError");
    }

    const args = call.arguments ?? {};

    switch (call.name) {
        case "listProjects": {
            const filter = args.filter as Record<string, unknown> | undefined;
            const data = filterRequest({ ...(filter ?? {}) });
            return api("projects", { data, method: "GET" });
        }
        case "listMembers": {
            return api("users/members", { method: "GET" });
        }
        case "getProject": {
            const projectId = ensureKnownProject(asString(args.projectId), ctx);
            if (!projectId) {
                return { error: "Unknown or disallowed projectId" };
            }
            return api("projects", { data: { projectId }, method: "GET" });
        }
        case "listBoard": {
            const projectId = ensureKnownProject(asString(args.projectId), ctx);
            if (!projectId) {
                return { error: "Unknown or disallowed projectId" };
            }
            return api("boards", { data: { projectId }, method: "GET" });
        }
        case "listTasks": {
            const projectId = ensureKnownProject(asString(args.projectId), ctx);
            if (!projectId) {
                return { error: "Unknown or disallowed projectId" };
            }
            const rawFilter =
                (args.filter as Record<string, unknown> | undefined) ?? {};
            const filter: Record<string, unknown> = {};
            if (asString(rawFilter.taskName)) {
                filter.taskName = asString(rawFilter.taskName);
            }
            if (asString(rawFilter.type)) {
                filter.type = asString(rawFilter.type);
            }
            const coord = asString(rawFilter.coordinatorId);
            if (coord && ctx.knownMemberIds.has(coord)) {
                filter.coordinatorId = coord;
            }
            const col = asString(rawFilter.columnId);
            if (col && ctx.knownColumnIds.has(col)) {
                filter.columnId = col;
            }
            const data = filterRequest({ projectId, ...filter });
            return api("tasks", { data, method: "GET" });
        }
        case "getTask": {
            const taskId = asString(args.taskId);
            if (!taskId || !ctx.knownTaskIds.has(taskId)) {
                return { error: "Unknown or disallowed taskId" };
            }
            return api("tasks", { data: { taskId }, method: "GET" });
        }
        default:
            return { error: `Unsupported tool: ${String(call.name)}` };
    }
};
