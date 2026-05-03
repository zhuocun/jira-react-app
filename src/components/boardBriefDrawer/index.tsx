import {
    CopyOutlined,
    InfoCircleOutlined,
    ReloadOutlined
} from "@ant-design/icons";
import styled from "@emotion/styled";
import {
    Alert,
    Button,
    Drawer,
    Grid,
    List,
    message,
    Skeleton,
    Space,
    Table,
    Tag,
    Tooltip,
    Typography
} from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ANALYTICS_EVENTS, track } from "../../constants/analytics";
import { microcopy } from "../../constants/microcopy";
import { BRIEF_CACHE_TTL_MS } from "../../theme/aiTokens";
import { fontSize, fontWeight, radius, space } from "../../theme/tokens";
import { aiErrorView } from "../../utils/ai/errorTemplate";
import useAi from "../../utils/hooks/useAi";
import useTaskModal from "../../utils/hooks/useTaskModal";
import AiSparkleIcon from "../aiSparkleIcon";
import CopilotPrivacyPopover from "../copilotPrivacyPopover";
import EngineModeTag from "../engineModeTag";

/**
 * Brief-drawer list rows are activatable (open the underlying task in
 * the modal). They render as `<li role="button">` so styling has to live
 * here — global :focus-visible would land on the inner content.
 */
const ActivatableListItem = styled(List.Item)`
    && {
        border-radius: ${radius.sm}px;
        cursor: pointer;
        transition: background-color 120ms ease-out;
    }

    &&:hover {
        background: var(--ant-color-bg-text-hover, rgba(15, 23, 42, 0.04));
    }

    &&:focus-visible {
        background: var(--ant-color-bg-text-hover, rgba(15, 23, 42, 0.04));
        outline: 2px solid var(--ant-color-primary, #5e6ad2);
        outline-offset: -2px;
    }
`;

const WorkloadRow = styled(List.Item)`
    && {
        flex-wrap: wrap;
        gap: ${space.xs}px;
    }
`;

const WorkloadName = styled.span`
    flex: 1 1 auto;
    font-weight: ${fontWeight.medium};
`;

const WorkloadBarWrap = styled.div`
    background: var(--ant-color-fill-tertiary, rgba(15, 23, 42, 0.04));
    border-radius: 999px;
    height: 6px;
    margin-top: 4px;
    overflow: hidden;
    width: 100%;
`;

const WorkloadBar = styled.div<{ overloaded: boolean }>`
    background: ${(props) =>
        props.overloaded
            ? "var(--ant-color-warning, #F59E0B)"
            : "var(--color-copilot-grad-mid, #5E6AD2)"};
    height: 100%;
    transition: width 320ms ease-out;
`;

interface BoardBriefDrawerProps {
    open: boolean;
    onClose: () => void;
    project?: IProject;
    columns: IColumn[];
    tasks: ITask[];
    members: IMember[];
}

const SectionHeading: React.FC<{ children: React.ReactNode }> = ({
    children
}) => (
    <Typography.Title
        level={4}
        style={{
            fontSize: fontSize.base,
            marginBottom: space.xs,
            marginTop: space.md
        }}
    >
        {children}
    </Typography.Title>
);

interface ClickableListItemProps {
    onActivate: () => void;
    children: React.ReactNode;
}

const ClickableListItem: React.FC<ClickableListItemProps> = ({
    onActivate,
    children
}) => {
    const handleKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onActivate();
        }
    };
    return (
        <ActivatableListItem
            onClick={onActivate}
            onKeyDown={handleKey}
            role="button"
            tabIndex={0}
        >
            {children}
        </ActivatableListItem>
    );
};

interface CachedBrief {
    data: IBoardBrief;
    generatedAt: number;
    /** Fingerprint of board state used to invalidate stale caches. */
    fingerprint: string;
}

const BRIEF_CACHE = new Map<string, CachedBrief>();

const fingerprintBoard = (
    columns: IColumn[],
    tasks: ITask[],
    members: IMember[]
): string => {
    return [
        columns.length,
        tasks.length,
        members.length,
        // Sample a few tasks' ids so adding/removing a single task busts the cache
        tasks
            .slice(0, 8)
            .map((t) => `${t._id}:${t.columnId ?? ""}:${t.coordinatorId ?? ""}`)
            .join("|")
    ].join("/");
};

/**
 * Format a relative timestamp like "3 minutes ago". Used by the brief
 * footer (B-R11). Re-renders every 30 s while the drawer is open.
 */
const formatRelative = (then: number, now: number): string => {
    const seconds = Math.max(0, Math.round((now - then) / 1000));
    if (seconds < 30) return "just now";
    if (seconds < 90) return "1 minute ago";
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    const days = Math.round(hours / 24);
    return `${days} day${days === 1 ? "" : "s"} ago`;
};

const STRENGTH_LABEL: Record<
    NonNullable<IBoardBrief["recommendationDetail"]>["strength"],
    string
> = {
    strong: "Strong signal",
    moderate: "Moderate signal",
    low: "Low signal — review",
    none: "No action needed"
};

const STRENGTH_COLOR: Record<
    NonNullable<IBoardBrief["recommendationDetail"]>["strength"],
    "red" | "orange" | "blue" | "default"
> = {
    strong: "red",
    moderate: "orange",
    low: "blue",
    none: "default"
};

interface BriefRecommendationTitleProps {
    detail?: IBoardBrief["recommendationDetail"];
}

const BriefRecommendationTitle: React.FC<BriefRecommendationTitleProps> = ({
    detail
}) => (
    <span style={{ alignItems: "center", display: "inline-flex", gap: 6 }}>
        <span>{`${microcopy.a11y.aiSuggestion}: Recommended next step`}</span>
        {detail && (
            <Tag
                color={STRENGTH_COLOR[detail.strength]}
                style={{ marginInlineEnd: 0 }}
            >
                {STRENGTH_LABEL[detail.strength]}
            </Tag>
        )}
    </span>
);

interface BriefRecommendationBodyProps {
    detail?: IBoardBrief["recommendationDetail"];
    fallbackText: string;
    onOpenTask: (taskId: string) => void;
}

const BriefRecommendationBody: React.FC<BriefRecommendationBodyProps> = ({
    detail,
    fallbackText,
    onOpenTask
}) => {
    const text = detail?.text ?? fallbackText;
    return (
        <div>
            <Typography.Paragraph style={{ marginBottom: 4 }}>
                {text}
            </Typography.Paragraph>
            {detail?.basis && (
                <Typography.Paragraph
                    style={{ fontSize: fontSize.xs, marginBottom: 4 }}
                    type="secondary"
                >
                    {`Basis: ${detail.basis}`}
                </Typography.Paragraph>
            )}
            {detail && detail.sources.length > 0 && (
                <Space size={4} wrap>
                    {detail.sources.map((source) => (
                        <Tag
                            color="purple"
                            key={source.taskId}
                            onClick={() => onOpenTask(source.taskId)}
                            style={{
                                cursor: "pointer",
                                marginInlineEnd: 0
                            }}
                            tabIndex={0}
                            onKeyDown={(event) => {
                                if (
                                    event.key === "Enter" ||
                                    event.key === " "
                                ) {
                                    event.preventDefault();
                                    onOpenTask(source.taskId);
                                }
                            }}
                        >
                            {source.taskName}
                        </Tag>
                    ))}
                </Space>
            )}
        </div>
    );
};

const briefToMarkdown = (brief: IBoardBrief): string => {
    const lines: string[] = [];
    lines.push(`# ${brief.headline}`, "");
    if (brief.recommendation) {
        lines.push(`> ${brief.recommendation}`, "");
        if (brief.recommendationDetail?.basis) {
            lines.push(`_Basis: ${brief.recommendationDetail.basis}_`, "");
        }
    }
    lines.push("## Counts per column", "");
    for (const entry of brief.counts) {
        lines.push(`- **${entry.columnName}** — ${entry.count}`);
    }
    if (brief.largestUnstarted.length > 0) {
        lines.push("", "## Largest unstarted", "");
        for (const t of brief.largestUnstarted) {
            lines.push(
                `- ${t.taskName}${t.storyPoints !== undefined ? ` (${t.storyPoints} pts)` : ""}`
            );
        }
    }
    if (brief.unowned.length > 0) {
        lines.push("", "## Unowned", "");
        for (const t of brief.unowned) {
            lines.push(`- ${t.taskName}`);
        }
    }
    if (brief.workload.length > 0) {
        lines.push("", "## Workload", "");
        for (const w of brief.workload) {
            lines.push(
                `- **${w.username}** — ${w.openTasks} open / ${w.openPoints} pts`
            );
        }
    }
    return lines.join("\n");
};

const BoardBriefDrawer: React.FC<BoardBriefDrawerProps> = ({
    open,
    onClose,
    project,
    columns,
    tasks,
    members
}) => {
    const { startEditing } = useTaskModal();
    const { run, data, error, isLoading, reset } = useAi<IBoardBrief>({
        route: "board-brief"
    });
    const screens = Grid.useBreakpoint();
    const drawerWidth = screens.md ? 420 : "100%";
    const projectId = project?._id ?? "";
    const fingerprint = fingerprintBoard(columns, tasks, members);
    const cacheKey = projectId;
    const [cachedAt, setCachedAt] = useState<number | null>(null);
    const [now, setNow] = useState(() => Date.now());
    const lastFingerprintRef = useRef<string>("");

    /**
     * Smart caching (B-R1, B-R13). Reuse the cached brief while:
     *   - it's fresher than `BRIEF_CACHE_TTL_MS` (5 minutes), AND
     *   - the board fingerprint hasn't changed since we cached.
     * Otherwise re-run the agent. The cache survives drawer close so a
     * quick reopen no longer thrashes the network.
     */
    const runBrief = useCallback(
        async (options: { bypassCache?: boolean } = {}) => {
            if (!project) return;
            const cached = BRIEF_CACHE.get(cacheKey);
            const fresh =
                cached &&
                Date.now() - cached.generatedAt < BRIEF_CACHE_TTL_MS &&
                cached.fingerprint === fingerprint;
            if (fresh && !options.bypassCache) {
                setCachedAt(cached.generatedAt);
                return;
            }
            try {
                const result = await run({
                    brief: {
                        context: {
                            project: {
                                _id: project._id,
                                projectName: project.projectName
                            },
                            columns,
                            tasks,
                            members
                        }
                    }
                });
                if (result) {
                    const generatedAt = Date.now();
                    BRIEF_CACHE.set(cacheKey, {
                        data: result,
                        generatedAt,
                        fingerprint
                    });
                    setCachedAt(generatedAt);
                }
            } catch {
                /* surfaced via error state */
            }
        },
        [project, cacheKey, fingerprint, run, columns, tasks, members]
    );

    useEffect(() => {
        if (!open) return;
        track(ANALYTICS_EVENTS.COPILOT_BRIEF_OPEN);
        if (lastFingerprintRef.current !== fingerprint) {
            lastFingerprintRef.current = fingerprint;
        }
        void runBrief();
    }, [open, fingerprint, runBrief]);

    /**
     * Drawer close (B-R13): preserve the cached brief so reopening
     * within the TTL is instant. We still need to clear the in-flight
     * `useAi` state so a stale spinner doesn't render after reopen.
     */
    useEffect(() => {
        if (!open) {
            reset();
        }
    }, [open, reset]);

    /**
     * Live "Generated N minutes ago" timestamp. Tick every 30 s while
     * the drawer is open; tear down on close.
     */
    useEffect(() => {
        if (!open) return;
        const handle = window.setInterval(() => setNow(Date.now()), 30_000);
        return () => window.clearInterval(handle);
    }, [open]);

    const cached = cacheKey ? BRIEF_CACHE.get(cacheKey) : undefined;
    const briefData: IBoardBrief | undefined = data ?? cached?.data;
    const generatedAt = cachedAt ?? cached?.generatedAt ?? null;
    const errorView = aiErrorView(error, "Couldn't generate the brief");

    /** Compute "what changed" headline (B-R3) when we have a baseline. */
    const headline = useMemo(() => {
        if (!briefData) return "";
        const totalTasks = tasks.length;
        const overloaded = briefData.workload.find((w) => w.openTasks >= 5);
        if (overloaded) {
            return `${overloaded.username} is carrying ${overloaded.openTasks} open tasks — consider reassigning.`;
        }
        if (briefData.unowned.length >= 3) {
            return `${briefData.unowned.length} tasks have no owner.`;
        }
        if (briefData.largestUnstarted.length >= 5) {
            return `${briefData.largestUnstarted.length} unstarted tasks waiting for pickup.`;
        }
        if (totalTasks === 0) {
            return "Board is empty — start by creating a task.";
        }
        return briefData.headline;
    }, [briefData, tasks.length]);

    const openTaskFromBrief = (taskId: string) => {
        // B-R8: keep the drawer open so the user can keep scanning the
        // brief while drilling into a task. Previously closed the drawer.
        startEditing(taskId);
    };

    const handleCopyMarkdown = async () => {
        if (!briefData) return;
        try {
            await navigator.clipboard.writeText(briefToMarkdown(briefData));
            message.success(microcopy.ai.copiedConfirm);
        } catch {
            message.error("Couldn't copy");
        }
    };

    const handleRefresh = async () => {
        track(ANALYTICS_EVENTS.BRIEF_REFRESHED, { projectId });
        await runBrief({ bypassCache: true });
    };

    const teamAverage = useMemo(() => {
        if (!briefData || briefData.workload.length === 0) return 0;
        const sum = briefData.workload.reduce((acc, w) => acc + w.openTasks, 0);
        return sum / briefData.workload.length;
    }, [briefData]);

    return (
        <Drawer
            extra={
                <Space size={space.xs}>
                    <Tooltip title={microcopy.ai.regenerateLabel}>
                        <Button
                            aria-label={microcopy.ai.regenerateLabel}
                            disabled={isLoading}
                            icon={<ReloadOutlined />}
                            onClick={handleRefresh}
                            size="small"
                            type="text"
                        />
                    </Tooltip>
                    <Tooltip title="Copy as Markdown">
                        <Button
                            aria-label="Copy brief as Markdown"
                            disabled={!briefData || isLoading}
                            icon={<CopyOutlined />}
                            onClick={handleCopyMarkdown}
                            size="small"
                            type="text"
                        />
                    </Tooltip>
                    <CopilotPrivacyPopover
                        label={
                            <span aria-label={microcopy.ai.privacyLink}>
                                <InfoCircleOutlined />
                            </span>
                        }
                        route="board-brief"
                    />
                </Space>
            }
            onClose={onClose}
            open={open}
            styles={{
                body: {
                    paddingBottom: `max(${space.lg}px, env(safe-area-inset-bottom))`,
                    paddingInlineEnd: `max(${space.lg}px, env(safe-area-inset-right))`,
                    paddingInlineStart: `max(${space.lg}px, env(safe-area-inset-left))`
                }
            }}
            title={
                <Space align="center" size={space.xs} wrap>
                    <AiSparkleIcon aria-hidden />
                    <span style={{ fontWeight: 600 }}>Board Copilot brief</span>
                    <Tag color="purple" style={{ marginInlineStart: space.xs }}>
                        {microcopy.a11y.aiBadge}
                    </Tag>
                    <EngineModeTag />
                </Space>
            }
            size={drawerWidth}
        >
            {isLoading && !briefData && (
                <div aria-label="Generating brief" aria-busy="true">
                    <Skeleton active paragraph={{ rows: 2 }} title />
                    <Skeleton
                        active
                        paragraph={{ rows: 4 }}
                        style={{ marginTop: space.lg }}
                        title={false}
                    />
                </div>
            )}
            {error && !briefData && (
                <Alert
                    action={
                        errorView.retryable ? (
                            <Button
                                onClick={handleRefresh}
                                size="small"
                                type="link"
                            >
                                {microcopy.ai.retryLabel}
                            </Button>
                        ) : null
                    }
                    description={errorView.body || undefined}
                    showIcon
                    title={errorView.heading}
                    type={errorView.severity}
                />
            )}
            {briefData && (
                <div aria-label="Board brief content" aria-live="polite">
                    <Typography.Title level={3} style={{ marginTop: 0 }}>
                        {headline}
                    </Typography.Title>
                    {briefData.recommendation && (
                        <Alert
                            description={
                                <BriefRecommendationBody
                                    detail={briefData.recommendationDetail}
                                    fallbackText={briefData.recommendation}
                                    onOpenTask={openTaskFromBrief}
                                />
                            }
                            showIcon
                            style={{ marginBottom: space.md }}
                            title={
                                <BriefRecommendationTitle
                                    detail={briefData.recommendationDetail}
                                />
                            }
                            type={
                                briefData.recommendationDetail?.strength ===
                                "none"
                                    ? "info"
                                    : "warning"
                            }
                        />
                    )}
                    <SectionHeading>Counts per column</SectionHeading>
                    <Table
                        columns={[
                            {
                                dataIndex: "columnName",
                                key: "columnName",
                                title: "Column"
                            },
                            {
                                align: "right",
                                dataIndex: "count",
                                key: "count",
                                title: "Tasks"
                            }
                        ]}
                        dataSource={briefData.counts.map((entry) => ({
                            ...entry,
                            key: entry.columnId
                        }))}
                        pagination={false}
                        size="small"
                        style={{ marginBottom: space.md }}
                    />

                    <SectionHeading>Largest unstarted</SectionHeading>
                    {briefData.largestUnstarted.length === 0 ? (
                        <Typography.Text type="secondary">
                            No unstarted tasks. Nice.
                        </Typography.Text>
                    ) : (
                        <List
                            dataSource={briefData.largestUnstarted}
                            renderItem={(item) => (
                                <ClickableListItem
                                    onActivate={() =>
                                        openTaskFromBrief(item.taskId)
                                    }
                                >
                                    <List.Item.Meta
                                        description={
                                            item.storyPoints !== undefined ? (
                                                <Tag>
                                                    {item.storyPoints} pts
                                                </Tag>
                                            ) : null
                                        }
                                        title={item.taskName}
                                    />
                                </ClickableListItem>
                            )}
                            size="small"
                            style={{ marginBottom: space.md }}
                        />
                    )}

                    <SectionHeading>Unowned tasks</SectionHeading>
                    {briefData.unowned.length === 0 ? (
                        <Typography.Text type="secondary">
                            All tasks have an owner.
                        </Typography.Text>
                    ) : (
                        <List
                            dataSource={briefData.unowned}
                            renderItem={(item) => (
                                <ClickableListItem
                                    onActivate={() =>
                                        openTaskFromBrief(item.taskId)
                                    }
                                >
                                    {item.taskName}
                                </ClickableListItem>
                            )}
                            size="small"
                            style={{ marginBottom: space.md }}
                        />
                    )}

                    <SectionHeading>Workload</SectionHeading>
                    {briefData.workload.length === 0 ? (
                        <Typography.Text type="secondary">
                            No active tasks per member.
                        </Typography.Text>
                    ) : (
                        <List
                            dataSource={briefData.workload}
                            renderItem={(item) => {
                                const ratio =
                                    teamAverage > 0
                                        ? Math.min(
                                              1.5,
                                              item.openTasks / teamAverage
                                          )
                                        : 0;
                                const overloaded = ratio > 1.2;
                                return (
                                    <WorkloadRow>
                                        <WorkloadName>
                                            {item.username}
                                        </WorkloadName>
                                        <span>
                                            <Tag style={{ marginInlineEnd: 0 }}>
                                                {item.openTasks} open
                                            </Tag>{" "}
                                            <Tag
                                                color="blue"
                                                style={{ marginInlineEnd: 0 }}
                                            >
                                                {item.openPoints} pts
                                            </Tag>
                                        </span>
                                        <WorkloadBarWrap>
                                            <WorkloadBar
                                                overloaded={overloaded}
                                                style={{
                                                    width: `${Math.min(100, ratio * 80)}%`
                                                }}
                                            />
                                        </WorkloadBarWrap>
                                    </WorkloadRow>
                                );
                            }}
                            size="small"
                        />
                    )}
                    {generatedAt !== null && (
                        <Typography.Text
                            style={{
                                display: "block",
                                marginTop: space.md
                            }}
                            type="secondary"
                        >
                            Generated {formatRelative(generatedAt, now)}
                        </Typography.Text>
                    )}
                </div>
            )}
        </Drawer>
    );
};

export default BoardBriefDrawer;
