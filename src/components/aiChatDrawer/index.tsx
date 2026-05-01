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
import styled from "@emotion/styled";
import { startTransition, useEffect, useMemo, useRef, useState } from "react";

import { microcopy } from "../../constants/microcopy";
import { fontSize, fontWeight, radius, space } from "../../theme/tokens";
import useAiChat from "../../utils/hooks/useAiChat";
import AiSparkleIcon from "../aiSparkleIcon";

const MessageRow = styled.div<{ isUser: boolean }>`
    margin-bottom: ${space.sm}px;
    text-align: ${(props) => (props.isUser ? "right" : "left")};
`;

/**
 * Chat bubble. Centralizing the bubble's background, padding, and width
 * cap here means a tweak to the chat visual language is one edit instead
 * of three duplicated inline-style objects.
 */
const MessageBubble = styled(Typography.Paragraph)<{ isUser: boolean }>`
    && {
        background: ${(props) =>
            props.isUser
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
    }
`;

const SamplePrompt = styled(Tag.CheckableTag)`
    && {
        border-radius: ${radius.pill}px;
        font-weight: ${fontWeight.medium};
        padding: ${space.xxs}px ${space.sm}px;
    }
`;

const { Text } = Typography;

const SAMPLE_PROMPTS = [
    "What's at risk?",
    "Who has the most open tasks?",
    "Summarize this board"
];

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
}

const AiChatDrawer: React.FC<AiChatDrawerProps> = ({
    open,
    onClose,
    project,
    columns,
    tasks,
    members,
    knownProjectIds
}) => {
    const [input, setInput] = useState("");
    const [showToolDetails, setShowToolDetails] = useState(false);
    const inputRef = useRef<TextAreaRef | null>(null);
    const screens = Grid.useBreakpoint();
    // Below 768 px the chat fills the viewport so the on-screen keyboard does
    // not push the input below the fold; on tablet/desktop we keep a 400 px
    // side panel so the board stays partially visible.
    const drawerWidth = screens.md ? 400 : "100%";

    useEffect(() => {
        if (!open) {
            setShowToolDetails(false);
            return;
        }
        // Move focus into the chat input when the drawer opens.
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

    const handleClose = () => {
        abort();
        reset();
        setInput("");
        onClose();
    };

    const dispatch = (text: string) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        setInput("");
        startTransition(() => {
            void send(trimmed);
        });
    };

    const handleSend = () => {
        dispatch(input);
    };

    const hasToolMessages = messages.some((m) => m.role === "tool");

    return (
        <Drawer
            destroyOnHidden
            extra={
                <Space size={space.xs}>
                    {hasToolMessages ? (
                        <Button
                            aria-label={
                                showToolDetails
                                    ? "Hide tool details"
                                    : "Show tool details"
                            }
                            aria-pressed={showToolDetails}
                            onClick={() => setShowToolDetails((v) => !v)}
                            size="small"
                            type="text"
                        >
                            {showToolDetails ? "Hide details" : "Show details"}
                        </Button>
                    ) : null}
                    <Button
                        aria-label="Clear Board Copilot chat"
                        disabled={messages.length === 0 || isLoading}
                        onClick={() => reset()}
                        size="small"
                        type="link"
                    >
                        Clear
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
                        Ask Board Copilot
                    </span>
                    <Tag variant="filled" color="purple">
                        {microcopy.a11y.aiBadge}
                    </Tag>
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
                        orientation="vertical"
                        size={space.sm}
                        style={{ width: "100%" }}
                    >
                        <Text type="secondary">
                            Ask about this board, tasks, or your projects.
                            Answers use read-only data from the app.
                        </Text>
                        <Space size={space.xs} wrap>
                            {SAMPLE_PROMPTS.map((prompt) => (
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
                        if (!showToolDetails) return null;
                        return (
                            <div
                                key={`tool-${m.toolCallId ?? index}`}
                                style={{
                                    fontSize: fontSize.xs,
                                    marginBottom: space.xs,
                                    opacity: 0.75
                                }}
                            >
                                <Text code type="secondary">
                                    {m.toolName ?? "tool"}
                                </Text>
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
                            </div>
                        );
                    }
                    const isUser = m.role === "user";
                    return (
                        <MessageRow isUser={isUser} key={`msg-${index}`}>
                            <MessageBubble isUser={isUser}>
                                {m.content}
                            </MessageBubble>
                        </MessageRow>
                    );
                })}
                {isLoading && (
                    <Flex
                        align="center"
                        gap={space.xs}
                        style={{ marginTop: space.xs }}
                    >
                        <Spin size="small" aria-label="Generating response" />
                        {streamingText ? (
                            <Text type="secondary">{streamingText}</Text>
                        ) : null}
                    </Flex>
                )}
            </div>

            {error && (
                <Alert
                    closable
                    description={error.message}
                    title="Something went wrong"
                    onClose={dismissError}
                    showIcon
                    style={{ marginBottom: space.xs }}
                    type="warning"
                />
            )}

            <Space.Compact style={{ width: "100%" }}>
                <Input.TextArea
                    aria-label="Message Board Copilot"
                    autoSize={{ maxRows: 4, minRows: 1 }}
                    disabled={isLoading}
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
                        aria-label="Stop response"
                        danger
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
        </Drawer>
    );
};

export default AiChatDrawer;
