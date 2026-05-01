import styled from "@emotion/styled";
import {
    Alert,
    Drawer,
    Grid,
    List,
    Skeleton,
    Space,
    Table,
    Tag,
    Typography
} from "antd";
import { useEffect } from "react";

import { microcopy } from "../../constants/microcopy";
import { fontSize, fontWeight, radius, space } from "../../theme/tokens";
import useAi from "../../utils/hooks/useAi";
import useTaskModal from "../../utils/hooks/useTaskModal";
import AiSparkleIcon from "../aiSparkleIcon";

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

const WorkloadTags = styled.span`
    display: inline-flex;
    flex-wrap: wrap;
    gap: ${space.xxs}px;
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

    useEffect(() => {
        if (!open) {
            reset();
            return;
        }
        if (!project) return;
        run({
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
        }).catch(() => {
            /* surfaced via error state */
        });
    }, [open, project, columns, tasks, members, run, reset]);

    const openTaskFromBrief = (taskId: string) => {
        onClose();
        startEditing(taskId);
    };

    return (
        <Drawer
            destroyOnHidden
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
                    <Tag
                        variant="filled"
                        color="purple"
                        style={{ marginInlineStart: space.xs }}
                    >
                        {microcopy.a11y.aiBadge}
                    </Tag>
                </Space>
            }
            size={drawerWidth}
        >
            {isLoading && (
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
            {error && !isLoading && (
                <Alert
                    description={error.message}
                    showIcon
                    title="Couldn't generate the brief"
                    type="warning"
                />
            )}
            {data && !isLoading && (
                <div aria-label="Board brief content">
                    <Typography.Title level={3} style={{ marginTop: 0 }}>
                        {data.headline}
                    </Typography.Title>
                    <Alert
                        description={data.recommendation}
                        showIcon
                        style={{ marginBottom: space.md }}
                        title={`${microcopy.a11y.aiSuggestion}: Recommended next step`}
                        type="info"
                    />
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
                        dataSource={data.counts.map((entry) => ({
                            ...entry,
                            key: entry.columnId
                        }))}
                        pagination={false}
                        size="small"
                        style={{ marginBottom: space.md }}
                    />

                    <SectionHeading>Largest unstarted</SectionHeading>
                    {data.largestUnstarted.length === 0 ? (
                        <Typography.Text type="secondary">
                            No unstarted tasks. Nice.
                        </Typography.Text>
                    ) : (
                        <List
                            dataSource={data.largestUnstarted}
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
                    {data.unowned.length === 0 ? (
                        <Typography.Text type="secondary">
                            All tasks have an owner.
                        </Typography.Text>
                    ) : (
                        <List
                            dataSource={data.unowned}
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
                    {data.workload.length === 0 ? (
                        <Typography.Text type="secondary">
                            No active tasks per member.
                        </Typography.Text>
                    ) : (
                        <List
                            dataSource={data.workload}
                            renderItem={(item) => (
                                <WorkloadRow>
                                    <WorkloadName>{item.username}</WorkloadName>
                                    <WorkloadTags>
                                        <Tag style={{ marginInlineEnd: 0 }}>
                                            {item.openTasks} open
                                        </Tag>
                                        <Tag
                                            color="blue"
                                            style={{ marginInlineEnd: 0 }}
                                        >
                                            {item.openPoints} pts
                                        </Tag>
                                    </WorkloadTags>
                                </WorkloadRow>
                            )}
                            size="small"
                        />
                    )}
                </div>
            )}
        </Drawer>
    );
};

export default BoardBriefDrawer;
