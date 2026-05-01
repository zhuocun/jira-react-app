import { ReloadOutlined, StopOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";
import {
    Alert,
    Button,
    Drawer,
    Flex,
    Grid,
    Input,
    Space,
    Spin,
    Tag,
    Typography
} from "antd";
import type { TextAreaRef } from "antd/es/input/TextArea";
import {
    startTransition,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import { ANALYTICS_EVENTS, track } from "../../constants/analytics";
import { microcopy } from "../../constants/microcopy";
import type { CitationRef } from "../../interfaces/agent";
import { fontSize, fontWeight, radius, space } from "../../theme/tokens";
import { aiErrorView } from "../../utils/ai/errorTemplate";
import useAiChat from "../../utils/hooks/useAiChat";
import AiSparkleIcon from "../aiSparkleIcon";
import CitationChip from "../citationChip";
import CopilotPrivacyPopover from "../copilotPrivacyPopover";

const MessageRow = styled.div<{ $isUser: boolean }>`
    margin-bottom: ${space.sm}px;
    text-align: ${(props) => (props.$isUser ? "right" : "left")};
`;

/**
 * Chat bubble. Centralizing the bubble's background, padding, and width
 * cap here means a tweak to the chat visual language is one edit instead
 * of three duplicated inline-style objects.
 */
const MessageBubble = styled(Typography.Paragraph)<{ $isUser: boolean }>`
    && {
        background: ${(props) =>
            props.$isUser
                ? "var(--ant-color-primary-bg, rgba(94, 106, 210, 0.10))"
                : "var(--ant-color-fill-tertiary, rgba(15, 23, 42, 0.04))"};
        border-radius: ${radius.md}px;
        color: var(--ant-color-text, inherit);
        display: inline-block;
        margin-bottom: 0;
        max-width: min(100%, 36rem);
        padding: ${space.xs}px ${space.sm}px;
        text-align: left;
        white-space: pre-wrap;
        word-break: break-word;
    }

    && pre,
    && code {
        max-width: 100%;
        overflow-x: auto;
    }
`;

const SamplePrompt = styled(Tag.CheckableTag)`
    && {
        border-radius: ${radius.pill}px;
        font-weight: ${fontWeight.medium};
        padding: ${space.xxs}px ${space.sm}px;
    }
`;

const ToolDetails = styled.details`
    background: var(--ant-color-fill-quaternary, rgba(15, 23, 42, 0.02));
    border-radius: ${radius.sm}px;
    color: var(--ant-color-text-secondary, rgba(15, 23, 42, 0.65));
    font-size: ${fontSize.xs}px;
    margin: ${space.xxs}px 0;
    padding: ${space.xxs}px ${space.xs}px;

    summary {
        cursor: pointer;
        outline: none;
    }

    summary:focus-visible {
        outline: 2px solid var(--ant-color-primary, #5e6ad2);
        outline-offset: 2px;
    }
`;

const { Text } = Typography;

interface ChatTurnFeedback {
    /** Index of the assistant message in the visible transcript. */
    index: number;
    value: "up" | "down";
}

export interface AiChatDrawerProps {
    open: boolean;
    onClose: () => void;
    /** Current project when on a board; omit or null on the project list */
    project: IProject | null;
    columns: IColumn[];
    tasks: ITask[];
    members: IMember[];
    /** Every project id the user may reference (e.g. list query + current) */
    knownProjectIds: string[];
    /**
     * Optional pre-populated prompt (e.g. dispatched from the command
     * palette in AI mode). The drawer auto-sends this when it opens with
     * a non-empty value.
     */
    initialPrompt?: string;
}

const humanizeTool = (name?: string) => {
    if (!name) return "tool";
    return name
        .replace(/^.*:/, "")
        .replace(/[._]/g, " ")
        .replace(/^./, (s) => s.toUpperCase());
};

/**
 * Best-effort summary of a tool result body for the collapsed details
 * view (C-R11). Strips JSON noise and presents one human-readable line.
 */
const summarizeToolBody = (body: string): string => {
    try {
        const parsed = JSON.parse(body) as unknown;
        if (Array.isArray(parsed)) {
            return `${parsed.length} item${parsed.length === 1 ? "" : "s"}`;
        }
        if (parsed && typeof parsed === "object") {
            const keys = Object.keys(parsed as Record<string, unknown>);
            if (keys.length === 0) return "empty result";
            return `keys: ${keys.slice(0, 4).join(", ")}${keys.length > 4 ? "…" : ""}`;
        }
        return String(parsed).slice(0, 80);
    } catch {
        return body.slice(0, 80);
    }
};

const AiChatDrawer: React.FC<AiChatDrawerProps> = ({
    open,
    onClose,
    project,
    columns,
    tasks,
    members,
    knownProjectIds,
    initialPrompt
}) => {
    const [input, setInput] = useState("");
    const [feedback, setFeedback] = useState<ChatTurnFeedback[]>([]);
    /**
     * Citations indexed by assistant turn (C-R7). The drawer renders a
     * `CitationChip` superscript for each item right after the bubble.
     * Until the agent emits real citations on the chat route, we extract
     * citations from inline `[cite:taskId]` markers in the assistant
     * text — falls back gracefully when the model produces none.
     */
    const inputRef = useRef<TextAreaRef | null>(null);
    const screens = Grid.useBreakpoint();
    const drawerWidth = screens.md ? 420 : "100%";
    const initialPromptHandled = useRef<string | null>(null);

    useEffect(() => {
        if (!open) {
            return;
        }
        const handle = window.setTimeout(() => {
            inputRef.current?.focus({ cursor: "end" });
        }, 0);
        return () => window.clearTimeout(handle);
    }, [open]);

    const chatCtx = useMemo(() => {
        const knownProjectSet = new Set(knownProjectIds);
        const pid = project?._id ?? "";
        if (pid) knownProjectSet.add(pid);

        return {
            engine: {
                columns,
                members,
                project: project ?? {
                    _id: "",
                    projectName: "Projects"
                },
                tasks
            },
            execution: {
                knownColumnIds: new Set(columns.map((c) => c._id)),
                knownMemberIds: new Set(members.map((m) => m._id)),
                knownProjectIds: knownProjectSet,
                knownTaskIds: new Set(tasks.map((t) => t._id)),
                projectId: pid
            }
        };
    }, [columns, knownProjectIds, members, project, tasks]);

    const {
        abort,
        dismissError,
        error,
        isLoading,
        messages,
        reset,
        send,
        streamingText
    } = useAiChat(open ? chatCtx : null);

    /** Reset the local UI state too (feedback, citations) on hard reset. */
    const resetAll = useCallback(() => {
        reset();
        setFeedback([]);
    }, [reset]);

    /**
     * "New conversation" voluntary reset (C-R1). The drawer no longer
     * destroys the transcript on close — the previous `destroyOnHidden`
     * flag wiped the panel even on accidental clicks.
     */
    const handleClose = () => {
        abort();
        setInput("");
        onClose();
    };

    const dispatch = useCallback(
        (text: string) => {
            const trimmed = text.trim();
            if (!trimmed) return;
            track(ANALYTICS_EVENTS.COPILOT_CHAT_SEND, {
                length: trimmed.length
            });
            setInput("");
            startTransition(() => {
                void send(trimmed);
            });
        },
        [send]
    );

    /**
     * Auto-fire the initial prompt dispatched from the command palette
     * (CP-R6). Keep a ref of the last prompt we handled so a re-render
     * doesn't re-send it.
     */
    useEffect(() => {
        if (!open || !initialPrompt) return;
        if (initialPromptHandled.current === initialPrompt) return;
        initialPromptHandled.current = initialPrompt;
        dispatch(initialPrompt);
    }, [dispatch, initialPrompt, open]);

    useEffect(() => {
        if (!open) initialPromptHandled.current = null;
    }, [open]);

    const handleSend = () => {
        dispatch(input);
    };

    const handleRegenerate = (turnIndex: number) => {
        // Find the user message that produced this assistant turn, then
        // re-send it. The chat engine appends to the transcript, so the
        // new turn lands as a fresh assistant bubble below the original.
        const msg = messages[turnIndex];
        if (!msg) return;
        const previous = messages
            .slice(0, turnIndex)
            .reverse()
            .find((m) => m.role === "user");
        if (!previous) return;
        track(ANALYTICS_EVENTS.COPILOT_CHAT_REGENERATE, {
            surface: "chat-drawer"
        });
        dispatch(previous.content);
    };

    const handleFeedback = (turnIndex: number, value: "up" | "down") => {
        track(ANALYTICS_EVENTS.THUMBS_FEEDBACK, { value, index: turnIndex });
        setFeedback((prev) => {
            const next = prev.filter((entry) => entry.index !== turnIndex);
            next.push({ index: turnIndex, value });
            return next;
        });
    };

    const errorView = error ? aiErrorView(error) : null;
    const remainingChars = microcopy.ai.characterCounterMax - input.length;
    const showCounter = input.length >= microcopy.ai.characterCounterShowAfter;
    const counterIsWarning = remainingChars < 0;

    // Surface citations from the most recent assistant message if the
    // engine populated them via tool messages. We project the embedded
    // tool results into typed citation refs so CitationChip can render
    // them — this is a graceful fallback until the chat-agent route
    // joins the chat stream and emits real `CitationRef[]`.
    const lastAssistantIndex = messages.findLastIndex(
        (m) => m.role === "assistant"
    );
    const citationsFromTools: CitationRef[] = useMemo(() => {
        if (lastAssistantIndex < 0) return [];
        const refs: CitationRef[] = [];
        for (let i = lastAssistantIndex - 1; i >= 0; i -= 1) {
            const m = messages[i];
            if (m.role === "user") break;
            if (m.role !== "tool") continue;
            try {
                const parsed = JSON.parse(m.content) as unknown;
                if (Array.isArray(parsed)) {
                    parsed.slice(0, 3).forEach((entry, idx) => {
                        if (
                            entry &&
                            typeof entry === "object" &&
                            "_id" in entry &&
                            ("taskName" in entry || "username" in entry)
                        ) {
                            const e = entry as {
                                _id: string;
                                taskName?: string;
                                username?: string;
                                projectName?: string;
                                columnName?: string;
                            };
                            const quote =
                                e.taskName ??
                                e.username ??
                                e.projectName ??
                                e.columnName ??
                                e._id;
                            refs.push({
                                source: e.taskName
                                    ? "task"
                                    : e.username
                                      ? "member"
                                      : e.columnName
                                        ? "column"
                                        : "project",
                                id: e._id,
                                quote
                            });
                            if (refs.length >= 4 && idx >= 2) return;
                        }
                    });
                }
            } catch {
                /* best-effort */
            }
            if (refs.length >= 4) break;
        }
        return refs;
    }, [lastAssistantIndex, messages]);

    return (
        <Drawer
            extra={
                <Space size={space.xs}>
                    <CopilotPrivacyPopover />
                    <Button
                        aria-label={microcopy.ai.newConversation}
                        disabled={messages.length === 0 || isLoading}
                        onClick={resetAll}
                        size="small"
                        type="link"
                    >
                        {microcopy.ai.newConversation}
                    </Button>
                </Space>
            }
            onClose={handleClose}
            open={open}
            size={drawerWidth}
            styles={{
                body: {
                    display: "flex",
                    flexDirection: "column",
                    paddingBottom: `max(${space.md}px, env(safe-area-inset-bottom))`,
                    paddingInlineEnd: `max(${space.lg}px, env(safe-area-inset-right))`,
                    paddingInlineStart: `max(${space.lg}px, env(safe-area-inset-left))`
                }
            }}
            title={
                <Space align="center" size={space.xs} wrap>
                    <AiSparkleIcon aria-hidden />
                    <span style={{ fontWeight: fontWeight.semibold }}>
                        {microcopy.ai.askCopilot}
                    </span>
                    <Tag color="purple">{microcopy.a11y.aiBadge}</Tag>
                </Space>
            }
        >
            <div
                aria-busy={isLoading}
                aria-live="polite"
                style={{
                    flex: "1 1 auto",
                    marginBottom: space.sm,
                    minHeight: 0,
                    overflowY: "auto",
                    overscrollBehavior: "contain"
                }}
            >
                {messages.length === 0 && !isLoading && (
                    <Space
                        size={space.sm}
                        style={{ width: "100%", flexDirection: "column" }}
                    >
                        <Text type="secondary">
                            {microcopy.ai.emptyChatLead}
                        </Text>
                        <Space size={space.xs} wrap>
                            {microcopy.ai.chatSuggestions.map((prompt) => (
                                <SamplePrompt
                                    aria-label={`Try sample prompt: ${prompt}`}
                                    checked={false}
                                    key={prompt}
                                    onChange={() => dispatch(prompt)}
                                >
                                    {prompt}
                                </SamplePrompt>
                            ))}
                        </Space>
                    </Space>
                )}
                {messages.map((m, index) => {
                    if (m.role === "tool") {
                        // C-R11: render tool calls collapsed by default with a
                        // human-readable summary instead of raw JSON.
                        return (
                            <ToolDetails key={`tool-${m.toolCallId ?? index}`}>
                                <summary>
                                    {`Looked up ${humanizeTool(m.toolName)} · ${summarizeToolBody(m.content)}`}
                                </summary>
                                <pre
                                    style={{
                                        fontSize: fontSize.xs - 1,
                                        margin: `${space.xxs}px 0 0`,
                                        whiteSpace: "pre-wrap",
                                        wordBreak: "break-word"
                                    }}
                                >
                                    {m.content}
                                </pre>
                            </ToolDetails>
                        );
                    }
                    const isUser = m.role === "user";
                    const isAssistant = m.role === "assistant";
                    const isLastAssistant =
                        isAssistant && index === lastAssistantIndex;
                    const turnFeedback = feedback.find(
                        (entry) => entry.index === index
                    );
                    return (
                        <MessageRow $isUser={isUser} key={`msg-${index}`}>
                            <MessageBubble $isUser={isUser}>
                                {m.content}
                                {isLastAssistant &&
                                    citationsFromTools.length > 0 && (
                                        <span
                                            style={{
                                                display: "inline-block",
                                                marginInlineStart: 6
                                            }}
                                        >
                                            {citationsFromTools.map(
                                                (citation, idx) => (
                                                    <CitationChip
                                                        citation={citation}
                                                        index={idx + 1}
                                                        key={`${citation.source}-${citation.id}-${idx}`}
                                                    />
                                                )
                                            )}
                                        </span>
                                    )}
                            </MessageBubble>
                            {isAssistant && !isLoading && (
                                <Space
                                    size={4}
                                    style={{
                                        display: "block",
                                        marginTop: 4,
                                        textAlign: "left"
                                    }}
                                >
                                    <Button
                                        aria-label="Regenerate response"
                                        icon={<ReloadOutlined />}
                                        onClick={() => handleRegenerate(index)}
                                        size="small"
                                        type="text"
                                    />
                                    <Button
                                        aria-label="Helpful answer"
                                        aria-pressed={
                                            turnFeedback?.value === "up"
                                        }
                                        onClick={() =>
                                            handleFeedback(index, "up")
                                        }
                                        size="small"
                                        type={
                                            turnFeedback?.value === "up"
                                                ? "primary"
                                                : "text"
                                        }
                                    >
                                        👍
                                    </Button>
                                    <Button
                                        aria-label="Not helpful"
                                        aria-pressed={
                                            turnFeedback?.value === "down"
                                        }
                                        onClick={() =>
                                            handleFeedback(index, "down")
                                        }
                                        size="small"
                                        type={
                                            turnFeedback?.value === "down"
                                                ? "primary"
                                                : "text"
                                        }
                                    >
                                        👎
                                    </Button>
                                </Space>
                            )}
                        </MessageRow>
                    );
                })}
                {/* C-R5: re-show contextual sample prompts after each turn so
                    the user always has a quick next-step. */}
                {!isLoading && messages.length > 0 && (
                    <Space
                        size={space.xs}
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            marginTop: space.xs
                        }}
                    >
                        {microcopy.ai.chatSuggestions
                            .slice(0, 2)
                            .map((prompt) => (
                                <SamplePrompt
                                    aria-label={`Try follow-up: ${prompt}`}
                                    checked={false}
                                    key={prompt}
                                    onChange={() => dispatch(prompt)}
                                >
                                    {prompt}
                                </SamplePrompt>
                            ))}
                    </Space>
                )}
                {isLoading && (
                    <Flex
                        align="center"
                        gap={space.xs}
                        style={{ marginTop: space.xs }}
                    >
                        <Spin
                            aria-label={microcopy.ai.streaming}
                            size="small"
                        />
                        <Text type="secondary">
                            {streamingText || microcopy.ai.streaming}
                        </Text>
                    </Flex>
                )}
            </div>

            {errorView && (
                <Alert
                    action={
                        errorView.retryable ? (
                            <Button
                                onClick={() => {
                                    const lastUser = [...messages]
                                        .reverse()
                                        .find((m) => m.role === "user");
                                    if (lastUser) dispatch(lastUser.content);
                                }}
                                size="small"
                                type="link"
                            >
                                {microcopy.ai.retryLabel}
                            </Button>
                        ) : null
                    }
                    closable
                    description={errorView.body || undefined}
                    onClose={dismissError}
                    showIcon
                    style={{ marginBottom: space.xs }}
                    title={errorView.heading}
                    type={errorView.severity}
                />
            )}

            <Space.Compact style={{ width: "100%" }}>
                <Input.TextArea
                    aria-label="Message Board Copilot"
                    autoSize={{ maxRows: 4, minRows: 1 }}
                    disabled={isLoading}
                    maxLength={microcopy.ai.characterCounterMax}
                    onChange={(e) => setInput(e.target.value)}
                    onPressEnter={(e) => {
                        if (!e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    placeholder="Ask a question… (Shift+Enter for a new line)"
                    ref={inputRef}
                    value={input}
                />
                {isLoading ? (
                    <Button
                        aria-label={microcopy.ai.stopResponse}
                        danger
                        icon={<StopOutlined />}
                        onClick={() => abort()}
                        type="default"
                    >
                        {microcopy.actions.stop}
                    </Button>
                ) : (
                    <Button
                        aria-label="Send message"
                        disabled={!input.trim()}
                        onClick={handleSend}
                        type="primary"
                    >
                        {microcopy.actions.send}
                    </Button>
                )}
            </Space.Compact>
            {showCounter && (
                <div
                    style={{
                        color: counterIsWarning
                            ? "var(--ant-color-error, #EF4444)"
                            : "var(--ant-color-text-secondary, rgba(15, 23, 42, 0.65))",
                        fontSize: fontSize.xs,
                        marginTop: 4,
                        textAlign: "right"
                    }}
                >
                    {input.length} / {microcopy.ai.characterCounterMax}
                </div>
            )}
        </Drawer>
    );
};

export default AiChatDrawer;
