import taskIcon from "../../assets/task.svg";
import bugIcon from "../../assets/bug.svg";
import styled from "@emotion/styled";
import { Card, Spin } from "antd";
import { TaskSearchParam } from "../taskSearchPanel";
import TaskCreator from "../taskCreator";
import useTaskModal from "../../utils/hooks/useTaskModal";

const KanbanColumn: React.FC<{
    loading: boolean;
    tasks: any[];
    kanban: IKanban;
    param: TaskSearchParam;
}> = ({ kanban, param, tasks, loading }) => {
    const { startEditing } = useTaskModal();
    if (loading) {
        return <Spin size={"large"} />;
    } else {
        return (
            <KanbanContainer>
                <h3 style={{ textTransform: "uppercase" }}>
                    {kanban.kanbanName}
                </h3>
                <TaskContainer>
                    {tasks?.map((task, index) =>
                        (!param.type || task.type === param.type) &&
                        (!param.coordinatorId ||
                            task.coordinatorId === param.coordinatorId) &&
                        (!param.taskName ||
                            task.taskName === param.taskName) ? (
                            <Card
                                onClick={() => startEditing(task._id)}
                                key={index}
                                style={{ marginBottom: "0.5rem" }}
                            >
                                <div>
                                    {task.taskName.length > 26
                                        ? task.taskName
                                              .slice(0, 23)
                                              .concat("...")
                                        : task.taskName}
                                </div>
                                <img
                                    src={
                                        task.type === "Task"
                                            ? taskIcon
                                            : bugIcon
                                    }
                                    alt={"Type icon"}
                                />
                            </Card>
                        ) : null
                    )}
                    <TaskCreator kanbanId={kanban._id} />
                </TaskContainer>
            </KanbanContainer>
        );
    }
};

export default KanbanColumn;

export const KanbanContainer = styled.div`
    min-width: 27rem;
    border-radius: 6px;
    background-color: rgb(244, 245, 247);
    display: flex;
    flex-direction: column;
    padding: 0.7rem;
    margin-right: 1.5rem;
`;

const TaskContainer = styled.div`
    overflow: scroll;
    flex: 1;

    ::-webkit-scrollbar {
        display: none;
    }
`;
