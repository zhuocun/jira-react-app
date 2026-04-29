import { Alert, Drawer, List, Spin, Table, Tag } from "antd";
import { useEffect } from "react";

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
            title={
                <span>
                    <AiSparkleIcon style={{ marginRight: 8 }} />
                    Board Copilot brief
                </span>
            }
            size="default"
        >
            {isLoading && (
                <div
                    aria-label="Generating brief"
                    style={{ padding: "2rem", textAlign: "center" }}
                >
                    <Spin />
                </div>
            )}
            {error && !isLoading && (
                <Alert
                    description={error.message}
                    message="Couldn't generate the brief"
                    showIcon
                    type="warning"
                />
            )}
            {data && !isLoading && (
                <div aria-label="Board brief content">
                    <h3>{data.headline}</h3>
                    <Alert
                        description={data.recommendation}
                        message="Recommended next step"
                        showIcon
                        style={{ marginBottom: 16 }}
                        type="info"
                    />
                    <h4>Counts per column</h4>
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
                        style={{ marginBottom: 16 }}
                    />

                    <h4>Largest unstarted</h4>
                    {data.largestUnstarted.length === 0 ? (
                        <p>No unstarted tasks. Nice.</p>
                    ) : (
                        <List
                            dataSource={data.largestUnstarted}
                            renderItem={(item) => (
                                <List.Item
                                    onClick={() =>
                                        openTaskFromBrief(item.taskId)
                                    }
                                    style={{ cursor: "pointer" }}
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
                                </List.Item>
                            )}
                            size="small"
                            style={{ marginBottom: 16 }}
                        />
                    )}

                    <h4>Unowned tasks</h4>
                    {data.unowned.length === 0 ? (
                        <p>All tasks have an owner.</p>
                    ) : (
                        <List
                            dataSource={data.unowned}
                            renderItem={(item) => (
                                <List.Item
                                    onClick={() =>
                                        openTaskFromBrief(item.taskId)
                                    }
                                    style={{ cursor: "pointer" }}
                                >
                                    {item.taskName}
                                </List.Item>
                            )}
                            size="small"
                            style={{ marginBottom: 16 }}
                        />
                    )}

                    <h4>Workload</h4>
                    {data.workload.length === 0 ? (
                        <p>No active tasks per member.</p>
                    ) : (
                        <List
                            dataSource={data.workload}
                            renderItem={(item) => (
                                <List.Item>
                                    <span>{item.username}</span>
                                    <span>
                                        <Tag>{item.openTasks} open</Tag>
                                        <Tag color="blue">
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
