import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import environment from "../../constants/env";
import type {
    AutonomyLevel,
    CitationRef,
    InterruptPayload,
    MutationProposal,
    StreamPart,
    TriageNudge
} from "../../interfaces/agent";
import { streamAgent } from "../ai/agentClient";
import { FE_TOOL_REGISTRY } from "../ai/feTools";
import type { FeToolContext } from "../ai/feTools";

export interface AgentMessage {
    role: "user" | "assistant" | "tool" | "system";
    content: string;
    toolCallId?: string;
}

export interface UseAgentState {
    messages: AgentMessage[];
    lastUpdate?: Record<string, unknown>;
    lastUsage?: { tokensIn: number; tokensOut: number };
}

interface StartOptions {
    threadId?: string;
    autonomy?: AutonomyLevel;
    /** Disable automatic FE-tool resume (caller will resolve manually). */
    autoResume?: boolean;
}

export interface UseAgentResult {
    start: (input: unknown, options?: StartOptions) => Promise<void>;
    resume: (resumeValue: unknown) => Promise<void>;
    abort: () => void;
    isStreaming: boolean;
    state: UseAgentState;
    pendingInterrupt: InterruptPayload | null;
    pendingProposal: MutationProposal | null;
    citations: CitationRef[];
    nudges: TriageNudge[];
    error: Error | null;
    reset: () => void;
}

export interface UseAgentOptions {
    baseUrl?: string;
    projectId?: string;
    userId?: string;
    /** Override the FE-tool ctx (lets callers add focus/selection state). */
    feToolContext?: Partial<FeToolContext>;
    /** Override threadId persistence (useful for tests). */
    initialThreadId?: string;
}

const generateThreadId = () =>
    `t_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;

interface ApplyStreamPartHandlers {
    setState: (updater: (prev: UseAgentState) => UseAgentState) => void;
    setPendingInterrupt: (payload: InterruptPayload | null) => void;
    setPendingProposal: (proposal: MutationProposal | null) => void;
    setCitations: (refs: CitationRef[]) => void;
    setNudges: (nudge: TriageNudge) => void;
    autoResume: boolean;
    ctx: FeToolContext;
}

/**
 * Reduce a single StreamPart into hook state. Returns a value when the part
 * is an `interrupt` for a known FE tool — the caller uses that to POST a
 * resume body and continue the run without bouncing through the UI.
 */
const applyStreamPart = async (
    part: StreamPart,
    handlers: ApplyStreamPartHandlers
): Promise<unknown | undefined> => {
    switch (part.type) {
        case "updates":
            handlers.setState((prev) => ({ ...prev, lastUpdate: part.data }));
            return undefined;
        case "messages": {
            const [chunk] = part.data;
            const content = chunk?.content ?? "";
            if (!content) return undefined;
            handlers.setState((prev) => {
                const last = prev.messages[prev.messages.length - 1];
                if (last && last.role === "assistant") {
                    const next = [...prev.messages];
                    next[next.length - 1] = {
                        ...last,
                        content: last.content + content
                    };
                    return { ...prev, messages: next };
                }
                return {
                    ...prev,
                    messages: [...prev.messages, { role: "assistant", content }]
                };
            });
            return undefined;
        }
        case "custom": {
            const event = part.data;
            switch (event.kind) {
                case "citation":
                    handlers.setCitations(event.refs);
                    return undefined;
                case "mutation_proposal":
                    handlers.setPendingProposal(event.proposal);
                    return undefined;
                case "usage":
                    handlers.setState((prev) => ({
                        ...prev,
                        lastUsage: {
                            tokensIn: event.tokensIn,
                            tokensOut: event.tokensOut
                        }
                    }));
                    return undefined;
                case "nudge":
                    handlers.setNudges(event.nudge);
                    return undefined;
                case "suggestion":
                default:
                    return undefined;
            }
        }
        case "interrupt": {
            handlers.setPendingInterrupt(part.data);
            const tool = FE_TOOL_REGISTRY[part.data.tool];
            if (handlers.autoResume && tool) {
                try {
                    const result = await tool.run(
                        part.data.args as never,
                        handlers.ctx
                    );
                    return result ?? null;
                } catch (err) {
                    return {
                        error: err instanceof Error ? err.message : String(err)
                    };
                }
            }
            return undefined;
        }
        case "error": {
            const message = part.data.message ?? "Agent stream error";
            handlers.setState((prev) => ({
                ...prev,
                messages: [
                    ...prev.messages,
                    { role: "system", content: message }
                ]
            }));
            return undefined;
        }
        default:
            return undefined;
    }
};

/**
 * Drive a LangGraph v2 agent run end-to-end (PRD §5). Handles SSE parsing,
 * thread-id persistence per (agent, project), interrupt → FE-tool
 * auto-resume, and surfacing citations / proposals / nudges to the UI.
 *
 * The hook is stateless about whether the agent server is reachable: a
 * `pendingProposal` only appears after the server emits a
 * `mutation_proposal` custom event; callers gate their accept/reject UI
 * on that signal.
 */
const useAgent = (
    name: string,
    options: UseAgentOptions = {}
): UseAgentResult => {
    const queryClient = useQueryClient();
    const baseUrl = options.baseUrl ?? environment.aiBaseUrl;
    const [state, setState] = useState<UseAgentState>({ messages: [] });
    const [error, setError] = useState<Error | null>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [pendingInterrupt, setPendingInterrupt] =
        useState<InterruptPayload | null>(null);
    const [pendingProposal, setPendingProposal] =
        useState<MutationProposal | null>(null);
    const [citations, setCitations] = useState<CitationRef[]>([]);
    const [nudges, setNudges] = useState<TriageNudge[]>([]);
    const controllerRef = useRef<AbortController | null>(null);
    const threadIdRef = useRef<string>(
        options.initialThreadId ?? generateThreadId()
    );
    const lastInputRef = useRef<unknown>(null);
    const autonomyRef = useRef<AutonomyLevel>("plan");
    const autoResumeRef = useRef<boolean>(true);
    const mountedRef = useRef(true);

    useEffect(
        () => () => {
            mountedRef.current = false;
            controllerRef.current?.abort();
        },
        []
    );

    const safeSetState = useCallback(
        (updater: (prev: UseAgentState) => UseAgentState) => {
            if (!mountedRef.current) return;
            setState(updater);
        },
        []
    );

    const consumeStream = useCallback(
        async (
            body: Parameters<typeof streamAgent>[0]["body"],
            signal: AbortSignal,
            ctx: FeToolContext
        ): Promise<{ pendingResume: unknown | undefined }> => {
            let pendingResume: unknown | undefined;
            try {
                for await (const part of streamAgent({
                    name,
                    body,
                    signal,
                    baseUrl
                })) {
                    if (signal.aborted) break;
                    pendingResume = await applyStreamPart(part, {
                        setState: safeSetState,
                        setPendingInterrupt: (p) =>
                            mountedRef.current && setPendingInterrupt(p),
                        setPendingProposal: (p) =>
                            mountedRef.current && setPendingProposal(p),
                        setCitations: (refs) =>
                            mountedRef.current &&
                            setCitations((prev) => [...prev, ...refs]),
                        setNudges: (n) =>
                            mountedRef.current &&
                            setNudges((prev) => [...prev, n]),
                        autoResume: autoResumeRef.current,
                        ctx
                    });
                    if (pendingResume !== undefined) break;
                }
            } catch (err) {
                if (err instanceof Error && err.name !== "AbortError") {
                    if (mountedRef.current) setError(err);
                    throw err;
                }
            }
            return { pendingResume };
        },
        [baseUrl, name, safeSetState]
    );

    const runStream = useCallback(
        async (body: Parameters<typeof streamAgent>[0]["body"]) => {
            controllerRef.current?.abort();
            const controller = new AbortController();
            controllerRef.current = controller;
            setError(null);
            setIsStreaming(true);

            const baseCtx: FeToolContext = {
                queryClient,
                projectId: options.projectId,
                userId: options.userId,
                ...(options.feToolContext ?? {})
            };

            try {
                let nextBody = body;
                // Auto-resume loop: if the agent interrupts with a known FE
                // tool, run the tool synchronously and POST a `resume` body.
                for (let round = 0; round < 8; round += 1) {
                    if (controller.signal.aborted) break;
                    const { pendingResume } = await consumeStream(
                        nextBody,
                        controller.signal,
                        baseCtx
                    );
                    if (pendingResume === undefined) break;
                    nextBody = {
                        input: null,
                        command: { resume: pendingResume },
                        config: nextBody.config,
                        stream_mode: nextBody.stream_mode,
                        version: nextBody.version
                    };
                    // Clear interrupt state on successful auto-resume.
                    if (mountedRef.current) setPendingInterrupt(null);
                }
            } catch (err) {
                // already surfaced
                void err;
            } finally {
                if (
                    mountedRef.current &&
                    controllerRef.current === controller
                ) {
                    setIsStreaming(false);
                    controllerRef.current = null;
                }
            }
        },
        [
            consumeStream,
            options.feToolContext,
            options.projectId,
            options.userId,
            queryClient
        ]
    );

    const start = useCallback(
        async (input: unknown, startOptions: StartOptions = {}) => {
            if (startOptions.threadId) {
                threadIdRef.current = startOptions.threadId;
            }
            if (startOptions.autonomy)
                autonomyRef.current = startOptions.autonomy;
            if (startOptions.autoResume === false)
                autoResumeRef.current = false;
            else autoResumeRef.current = true;

            lastInputRef.current = input;
            setPendingInterrupt(null);
            setPendingProposal(null);
            const messages =
                typeof input === "string"
                    ? [{ role: "user" as const, content: input }]
                    : ((input as { messages?: AgentMessage[] }).messages ?? []);

            // Reflect the user message immediately so chat UIs feel instant.
            safeSetState((prev) => ({
                ...prev,
                messages: [...prev.messages, ...messages]
            }));

            await runStream({
                input: { messages },
                config: {
                    configurable: {
                        thread_id: threadIdRef.current,
                        user_id: options.userId ?? "",
                        project_id: options.projectId ?? "",
                        autonomy: autonomyRef.current
                    }
                },
                stream_mode: ["updates", "messages", "custom"],
                version: "v2"
            });
        },
        [options.projectId, options.userId, runStream, safeSetState]
    );

    const resume = useCallback(
        async (resumeValue: unknown) => {
            await runStream({
                input: null,
                command: { resume: resumeValue },
                config: {
                    configurable: {
                        thread_id: threadIdRef.current,
                        user_id: options.userId ?? "",
                        project_id: options.projectId ?? "",
                        autonomy: autonomyRef.current
                    }
                },
                stream_mode: ["updates", "messages", "custom"],
                version: "v2"
            });
        },
        [options.projectId, options.userId, runStream]
    );

    const abort = useCallback(() => {
        controllerRef.current?.abort();
        controllerRef.current = null;
        if (mountedRef.current) setIsStreaming(false);
    }, []);

    const reset = useCallback(() => {
        controllerRef.current?.abort();
        controllerRef.current = null;
        if (!mountedRef.current) return;
        setState({ messages: [] });
        setPendingInterrupt(null);
        setPendingProposal(null);
        setCitations([]);
        setNudges([]);
        setError(null);
        setIsStreaming(false);
        threadIdRef.current = generateThreadId();
    }, []);

    return useMemo(
        () => ({
            start,
            resume,
            abort,
            isStreaming,
            state,
            pendingInterrupt,
            pendingProposal,
            citations,
            nudges,
            error,
            reset
        }),
        [
            abort,
            citations,
            error,
            isStreaming,
            nudges,
            pendingInterrupt,
            pendingProposal,
            reset,
            resume,
            start,
            state
        ]
    );
};

export default useAgent;
