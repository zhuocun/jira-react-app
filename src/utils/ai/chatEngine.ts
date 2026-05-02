import { boardBrief } from "./engine";
import type { AiChatToolCall, ChatToolName } from "./chatTools";

export interface AiChatMessage {
    role: "user" | "assistant" | "tool";
    content: string;
    toolCallId?: string;
    toolName?: ChatToolName;
}

export interface ChatTurnToolCalls {
    kind: "tool_calls";
    toolCalls: AiChatToolCall[];
}

export interface ChatTurnText {
    kind: "text";
    text: string;
}

export type ChatTurnResult = ChatTurnToolCalls | ChatTurnText;

export interface ChatEngineContext {
    project: { _id: string; projectName: string };
    columns: IColumn[];
    tasks: ITask[];
    members: IMember[];
}

const lastUserMessage = (messages: AiChatMessage[]): string => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
        if (messages[i].role === "user") return messages[i].content;
    }
    return "";
};

const lastUserIndex = (messages: AiChatMessage[]): number => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
        if (messages[i].role === "user") return i;
    }
    return -1;
};

const makeId = () => `tool_${Math.random().toString(36).slice(2, 10)}`;

const openTasksLabel = (w: { openTasks: number; openPoints: number }): string =>
    `${w.openTasks} task${w.openTasks === 1 ? "" : "s"}, ${w.openPoints} pts`;

/**
 * After tool results are in the thread, produce a user-facing answer without issuing more tools.
 */
export const chatAssistantFinalizeAfterTools = (
    messages: AiChatMessage[]
): string => {
    const start = lastUserIndex(messages);
    if (start < 0) return "";
    const chunks: string[] = [];
    for (let i = start + 1; i < messages.length; i += 1) {
        if (messages[i].role === "tool" && messages[i].content.trim()) {
            chunks.push(messages[i].content.trim());
        }
    }
    if (chunks.length === 0) return "The requested data could not be loaded.";
    return chunks.join("\n\n---\n\n");
};

/**
 * Deterministic single step: either emit read-only tool calls or a short answer.
 * Used when the local AI engine is active (no remote proxy).
 */
export const chatAssistantTurn = (
    messages: AiChatMessage[],
    context: ChatEngineContext
): ChatTurnResult => {
    const userIdx = lastUserIndex(messages);
    const hasToolResultsAfterUser =
        userIdx >= 0 &&
        messages.slice(userIdx + 1).some((m) => m.role === "tool");
    if (hasToolResultsAfterUser) {
        return {
            kind: "text",
            text: chatAssistantFinalizeAfterTools(messages)
        };
    }

    const text = lastUserMessage(messages).toLowerCase();

    if (
        /\b(list|show|all)\s+projects\b|\bprojects?\s+list\b|\bwhat\s+projects\b/.test(
            text
        )
    ) {
        return {
            kind: "tool_calls",
            toolCalls: [
                {
                    id: makeId(),
                    name: "listProjects",
                    arguments: {}
                }
            ]
        };
    }

    if (
        /\b(list|show)\s+members\b|\bteam\b|\bwho\s+(is\s+)?on\b|\bassignees?\b/.test(
            text
        )
    ) {
        return {
            kind: "tool_calls",
            toolCalls: [
                {
                    id: makeId(),
                    name: "listMembers",
                    arguments: {}
                }
            ]
        };
    }

    if (
        /\b(board|columns?|swimlanes?)\b/.test(text) &&
        /\b(list|show|what|how)\b/.test(text)
    ) {
        return {
            kind: "tool_calls",
            toolCalls: [
                {
                    id: makeId(),
                    name: "listBoard",
                    arguments: { projectId: context.project._id }
                }
            ]
        };
    }

    if (
        /\b(how\s+many|count)\b.*\btasks?\b|\btasks?\b.*\b(count|many)\b|\blist\s+tasks\b/.test(
            text
        )
    ) {
        return {
            kind: "tool_calls",
            toolCalls: [
                {
                    id: makeId(),
                    name: "listTasks",
                    arguments: { projectId: context.project._id }
                }
            ]
        };
    }

    const taskIdMatch = text.match(
        /\b(task|ticket)\s+([a-z0-9_-]{6,})\b|#([a-z0-9_-]{6,})\b/i
    );
    const maybeId = taskIdMatch?.[2] ?? taskIdMatch?.[3];
    if (maybeId && context.tasks.some((t) => t._id === maybeId)) {
        return {
            kind: "tool_calls",
            toolCalls: [
                {
                    id: makeId(),
                    name: "getTask",
                    arguments: { taskId: maybeId }
                }
            ]
        };
    }

    const brief = boardBrief({
        project: context.project,
        columns: context.columns,
        tasks: context.tasks,
        members: context.members
    });

    let answer = `${brief.headline}\n\n${brief.recommendation}`;
    if (/\b(unowned|owner|assign)\b/.test(text) && brief.unowned.length > 0) {
        answer += `\n\nUnowned: ${brief.unowned
            .map((u) => u.taskName)
            .join(", ")}`;
    }
    if (/\b(workload|busy|points)\b/.test(text) && brief.workload.length > 0) {
        answer += `\n\nWorkload: ${brief.workload
            .map((w) => `${w.username}: ${openTasksLabel(w)}`)
            .join("; ")}`;
    }

    return { kind: "text", text: answer };
};

const isProjectArray = (x: unknown): x is IProject[] =>
    Array.isArray(x) &&
    x.every((p) => p && typeof (p as IProject)._id === "string");

const isMemberArray = (x: unknown): x is IMember[] =>
    Array.isArray(x) &&
    x.every((m) => m && typeof (m as IMember)._id === "string");

const isColumnArray = (x: unknown): x is IColumn[] =>
    Array.isArray(x) &&
    x.every((c) => c && typeof (c as IColumn)._id === "string");

const isTaskArray = (x: unknown): x is ITask[] =>
    Array.isArray(x) &&
    x.every((t) => t && typeof (t as ITask)._id === "string");

export const summarizeToolResultForUser = (
    toolName: ChatToolName,
    payload: unknown
): string => {
    if (payload && typeof payload === "object" && "error" in payload) {
        return String((payload as { error: string }).error);
    }
    switch (toolName) {
        case "listProjects":
            if (isProjectArray(payload)) {
                if (payload.length === 0) return "No projects found.";
                return payload
                    .map((p) => `• **${p.projectName}** (\`${p._id}\`)`)
                    .join("\n");
            }
            break;
        case "listMembers":
            if (isMemberArray(payload)) {
                return payload
                    .map((m) => `• **${m.username}** (\`${m._id}\`)`)
                    .join("\n");
            }
            break;
        case "getProject":
            if (payload && typeof payload === "object" && "_id" in payload) {
                const p = payload as IProject;
                return `**${p.projectName}** — manager \`${p.managerId}\`, org: ${p.organization}`;
            }
            break;
        case "listBoard":
            if (isColumnArray(payload)) {
                if (payload.length === 0) return "No columns.";
                return payload
                    .sort((a, b) => a.index - b.index)
                    .map((c) => `• ${c.columnName} (\`${c._id}\`)`)
                    .join("\n");
            }
            break;
        case "listTasks":
            if (isTaskArray(payload)) {
                if (payload.length === 0) return "No tasks match.";
                return payload
                    .map(
                        (t) =>
                            `• **${t.taskName}** — ${t.type}, ${t.storyPoints} pts (\`${t._id}\`)`
                    )
                    .join("\n");
            }
            break;
        case "getTask":
            if (payload && typeof payload === "object" && "_id" in payload) {
                const t = payload as ITask;
                return [
                    `**${t.taskName}**`,
                    `Type: ${t.type} · Points: ${t.storyPoints} · Epic: ${t.epic}`,
                    `Column: \`${t.columnId}\` · Coordinator: \`${t.coordinatorId}\``,
                    t.note ? `\n${t.note}` : ""
                ]
                    .filter(Boolean)
                    .join("\n");
            }
            break;
        default:
            break;
    }
    try {
        const text = JSON.stringify(payload, null, 2);
        return text.length > 4000
            ? `${text.slice(0, 4000)}\n… (truncated)`
            : text;
    } catch {
        return String(payload);
    }
};
