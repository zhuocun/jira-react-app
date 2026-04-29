import {
    Alert,
    Button,
    Drawer,
    Flex,
    Input,
    Space,
    Spin,
    Typography
} from "antd";
import { startTransition, useMemo, useState } from "react";

import useAiChat from "../../utils/hooks/useAiChat";
import AiSparkleIcon from "../aiSparkleIcon";

const { Text, Paragraph } = Typography;

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

    const handleSend = () => {
        const text = input.trim();
        if (!text) return;
        setInput("");
        startTransition(() => {
            void send(text);
        });
    };

    return (
        <Drawer
            destroyOnHidden
            extra={
                <Button
                    aria-label="Clear Board Copilot chat"
                    disabled={messages.length === 0 || isLoading}
                    onClick={() => reset()}
                    size="small"
                    type="link"
                >
                    Clear
                </Button>
            }
            onClose={handleClose}
            open={open}
            size={400}
            styles={{
                body: {
                    display: "flex",
                    flexDirection: "column",
                    paddingBottom: 8
                }
            }}
            title={
                <span>
                    <AiSparkleIcon style={{ marginRight: 8 }} />
                    Ask Board Copilot
                </span>
            }
        >
            <div
                aria-live="polite"
                style={{
                    flex: 1,
                    marginBottom: 12,
                    maxHeight: "calc(100vh - 220px)",
                    minHeight: 200,
                    overflowY: "auto"
                }}
            >
                {messages.length === 0 && !isLoading && (
                    <Text type="secondary">
                        Ask about this board, tasks, or your projects. Answers
                        use read-only data from the app.
                    </Text>
                )}
                {messages.map((m, index) => {
                    if (m.role === "tool") {
                        return (
                            <div
                                key={`tool-${m.toolCallId ?? index}`}
                                style={{
                                    fontSize: 12,
                                    marginBottom: 8,
                                    opacity: 0.75
                                }}
                            >
                                <Text code type="secondary">
                                    {m.toolName ?? "tool"}
                                </Text>
                                <pre
                                    style={{
                                        fontSize: 11,
                                        margin: "4px 0 0",
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
                        <div
                            key={`msg-${index}`}
                            style={{
                                marginBottom: 10,
                                opacity: isUser ? 1 : 0.92,
                                textAlign: isUser ? "right" : "left"
                            }}
                        >
                            <Paragraph
                                style={{
                                    background: isUser
                                        ? "rgba(22, 119, 255, 0.08)"
                                        : "rgba(0, 0, 0, 0.04)",
                                    borderRadius: 8,
                                    display: "inline-block",
                                    marginBottom: 0,
                                    maxWidth: "100%",
                                    padding: "8px 12px",
                                    textAlign: "left",
                                    whiteSpace: "pre-wrap"
                                }}
                            >
                                {m.content}
                            </Paragraph>
                        </div>
                    );
                })}
                {isLoading && (
                    <Flex align="center" gap={8} style={{ marginTop: 8 }}>
                        <Spin size="small" />
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
                    message="Something went wrong"
                    onClose={dismissError}
                    showIcon
                    style={{ marginBottom: 8 }}
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
                    placeholder="Ask a question…"
                    value={input}
                />
                <Button
                    aria-label="Send message"
                    disabled={isLoading || !input.trim()}
                    onClick={handleSend}
                    type="primary"
                >
                    Send
                </Button>
            </Space.Compact>
        </Drawer>
    );
};

export default AiChatDrawer;
