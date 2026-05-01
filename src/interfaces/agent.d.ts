/**
 * Wire types for the LangGraph v2 streaming agent endpoint
 * (`POST /api/v1/agents/{name}/stream`). The backend serves a Server-Sent
 * Events stream where each event payload is one of these `StreamPart`s; the
 * client (see `src/utils/ai/agentClient.ts`) parses them into a typed async
 * iterable and the `useAgent` hook reduces them into UI state.
 *
 * These types are intentionally `.d.ts`-style (no runtime emit) so they can
 * be referenced both from FE code and from agent-server contract docs.
 */

export type AutonomyLevel = "suggest" | "plan" | "auto";

export interface AgentMetadata {
    name: string;
    version: string;
    description: string;
    status: "active" | "deprecated" | "shadow";
    allowed_autonomy: AutonomyLevel[];
    tools?: string[];
    rate_limit?: { per_minute: number; per_hour: number };
}

export interface AgentListResponse {
    agents: AgentMetadata[];
}

export interface CitationRef {
    source: "task" | "column" | "member" | "project";
    id: string;
    quote: string;
}

export interface MutationProposal {
    proposal_id: string;
    description: string;
    diff: Record<string, unknown>;
    risk: "low" | "med" | "high";
    undoable: true;
}

export interface TriageNudge {
    nudge_id: string;
    kind: "load_imbalance" | "wip_overflow" | "unowned_bug" | "stale_task";
    project_id: string;
    summary: string;
    target_ids: string[];
    severity: "info" | "warn" | "critical";
}

export type CustomEvent =
    | { kind: "citation"; refs: CitationRef[] }
    | { kind: "mutation_proposal"; proposal: MutationProposal }
    | {
          kind: "suggestion";
          surface: "brief" | "draft" | "estimate" | "readiness" | "search";
          payload: unknown;
      }
    | { kind: "usage"; tokensIn: number; tokensOut: number }
    | { kind: "nudge"; nudge: TriageNudge };

export interface InterruptPayload {
    tool: string;
    args: Record<string, unknown>;
}

export interface LLMTokenChunk {
    content: string;
    type?: string;
}

export interface MessageMetadata {
    langgraph_node?: string;
    [key: string]: unknown;
}

export type StreamPart =
    | { type: "updates"; ns: string[]; data: Record<string, unknown> }
    | { type: "messages"; ns: string[]; data: [LLMTokenChunk, MessageMetadata] }
    | { type: "custom"; ns: string[]; data: CustomEvent }
    | { type: "interrupt"; ns: string[]; data: InterruptPayload }
    | {
          type: "error";
          ns: string[];
          data: { message: string; recoverable?: boolean };
      };

export interface AgentStreamRequest {
    input: {
        messages?: Array<{ role: string; content: string }>;
        [k: string]: unknown;
    } | null;
    command?: { resume: unknown };
    config: {
        configurable: {
            thread_id: string;
            user_id: string;
            [k: string]: unknown;
        };
    };
    stream_mode: Array<"updates" | "messages" | "custom">;
    version: "v2";
}

export interface AgentHealthResponse {
    ok: boolean;
    agentsLoaded: number;
    latencyMs: number;
}
