import { useCallback, useEffect, useRef, useState } from "react";

import environment from "../../constants/env";
import {
    chatAssistantTurn,
    summarizeToolResultForUser,
    type AiChatMessage,
    type ChatEngineContext,
    type ChatTurnResult
} from "../ai/chatEngine";
import {
    executeChatToolCall,
    type AiChatExecutionContext,
    type AiChatToolCall
} from "../ai/chatTools";

import useApi from "./useApi";

const MAX_TOOL_ROUNDS = 5;

const humanizeTool = (name: string) =>
    name.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());

export type { AiChatMessage };

export interface UseAiChatContext {
    engine: ChatEngineContext;
    execution: AiChatExecutionContext;
}

const remoteChatStep = async (
    messages: AiChatMessage[],
    context: ChatEngineContext,
    signal: AbortSignal
): Promise<ChatTurnResult> => {
    const response = await fetch(`${environment.aiBaseUrl}/api/ai/chat`, {
        body: JSON.stringify({ messages, context }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
        signal
    });
    if (response.status === 429) {
        throw new Error("Board Copilot is busy. Try again in a moment.");
    }
    if (!response.ok) {
        throw new Error(`AI request failed (${response.status})`);
    }
    return response.json() as Promise<ChatTurnResult>;
};

const useAiChat = (ctx: UseAiChatContext | null) => {
    const api = useApi();
    const [messages, setMessages] = useState<AiChatMessage[]>([]);
    const messagesRef = useRef(messages);
    messagesRef.current = messages;

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [streamingText, setStreamingText] = useState("");
    const controllerRef = useRef<AbortController | null>(null);
    const mountedRef = useRef(true);

    useEffect(
        () => () => {
            mountedRef.current = false;
            controllerRef.current?.abort();
        },
        []
    );

    const abort = useCallback(() => {
        controllerRef.current?.abort();
        controllerRef.current = null;
        setIsLoading(false);
        setStreamingText("");
    }, []);

    const reset = useCallback(() => {
        abort();
        setMessages([]);
        setError(null);
    }, [abort]);

    const runConversationStep = useCallback(
        async (
            thread: AiChatMessage[],
            signal: AbortSignal
        ): Promise<ChatTurnResult> => {
            if (!ctx) throw new Error("Chat context unavailable");
            if (environment.aiUseLocalEngine) {
                return chatAssistantTurn(thread, ctx.engine);
            }
            return remoteChatStep(thread, ctx.engine, signal);
        },
        [ctx]
    );

    const send = useCallback(
        async (userText: string) => {
            const trimmed = userText.trim();
            if (!trimmed || !ctx) return;

            controllerRef.current?.abort();
            const controller = new AbortController();
            controllerRef.current = controller;
            const { signal } = controller;

            const userMessage: AiChatMessage = {
                role: "user",
                content: trimmed
            };
            setError(null);
            setIsLoading(true);
            setStreamingText("");

            let thread = [...messagesRef.current, userMessage];
            setMessages(thread);

            try {
                let finished = false;
                for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
                    if (signal.aborted) break;

                    const turn = await runConversationStep(thread, signal);
                    if (signal.aborted) break;

                    if (turn.kind === "text") {
                        const assistant: AiChatMessage = {
                            role: "assistant",
                            content: turn.text
                        };
                        thread = [...thread, assistant];
                        setMessages(thread);
                        finished = true;
                        break;
                    }

                    if (!turn.toolCalls?.length) {
                        const fallback: AiChatMessage = {
                            role: "assistant",
                            content:
                                "Got an unexpected response from Board Copilot."
                        };
                        thread = [...thread, fallback];
                        setMessages(thread);
                        finished = true;
                        break;
                    }

                    for (const call of turn.toolCalls) {
                        if (signal.aborted) break;
                        const payload = await executeChatToolCall(
                            api,
                            ctx.execution,
                            call as AiChatToolCall,
                            signal
                        );
                        const summary = summarizeToolResultForUser(
                            call.name,
                            payload
                        );
                        const toolMsg: AiChatMessage = {
                            role: "tool",
                            content: summary,
                            toolCallId: call.id,
                            toolName: call.name
                        };
                        thread = [...thread, toolMsg];
                        setMessages(thread);
                        if (mountedRef.current) {
                            setStreamingText(`${humanizeTool(call.name)}…`);
                        }
                    }
                }

                if (
                    !finished &&
                    !signal.aborted &&
                    thread[thread.length - 1]?.role !== "assistant"
                ) {
                    const assistant: AiChatMessage = {
                        role: "assistant",
                        content:
                            "Could not finish the answer (too many steps). Try a narrower question."
                    };
                    thread = [...thread, assistant];
                    setMessages(thread);
                }
            } catch (err) {
                const wrapped =
                    err instanceof Error ? err : new Error(String(err));
                if (!signal.aborted && mountedRef.current) {
                    setError(wrapped);
                }
            } finally {
                if (
                    mountedRef.current &&
                    controllerRef.current === controller
                ) {
                    setIsLoading(false);
                    setStreamingText("");
                    controllerRef.current = null;
                }
            }
        },
        [api, ctx, runConversationStep]
    );

    const dismissError = useCallback(() => setError(null), []);

    return {
        abort,
        dismissError,
        error,
        isLoading,
        messages,
        reset,
        send,
        streamingText
    };
};

export default useAiChat;
