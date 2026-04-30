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
import { fontSize, space } from "../../theme/tokens";
import useAi from "../../utils/hooks/useAi";
import useTaskModal from "../../utils/hooks/useTaskModal";
import AiSparkleIcon from "../aiSparkleIcon";

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
        <List.Item
            onClick={onActivate}
            onKeyDown={handleKey}
            role="button"
            style={{ cursor: "pointer" }}
            tabIndex={0}
        >
            {children}
        </List.Item>
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
                    paddingBottom: `max(${space.lg}px, env(safe-area-inset-bottom))`
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
                                <List.Item
                                    style={{
                                        flexWrap: "wrap",
                                        gap: space.xs
                                    }}
                                >
                                    <span style={{ flex: "1 1 auto" }}>
                                        {item.username}
                                    </span>
                                    <span
                                        style={{
                                            display: "inline-flex",
                                            flexWrap: "wrap",
                                            gap: space.xxs
                                        }}
                                    >
                                        <Tag style={{ marginInlineEnd: 0 }}>
                                            {item.openTasks} open
                                        </Tag>
                                        <Tag
                                            color="blue"
                                            style={{ marginInlineEnd: 0 }}
                                        >
                                            {item.openPoints} pts
                                        </Tag>
                                    </span>
                                </List.Item>
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
