import taskIcon from "../../assets/task.svg";
import bugIcon from "../../assets/bug.svg";
import styled from "@emotion/styled";
import { Spin } from "antd";
import { TaskSearchParam } from "../taskSearchPanel";
import TaskCreator from "../taskCreator";
import useTaskModal from "../../utils/hooks/useTaskModal";
import React from "react";
import { Drag, Drop, DropChild } from "../dragAndDrop";

const KanbanColumn = React.forwardRef<
    HTMLDivElement,
    {
        loading: boolean;
        tasks: ITask[];
        kanban: IKanban;
        param: TaskSearchParam;
    }
>(({ kanban, param, tasks, loading, ...props }, ref) => {
    const { startEditing } = useTaskModal();
    if (loading) {
        return <Spin size={"large"} />;
    } else {
        return (
            <KanbanContainer {...props} ref={ref}>
                <h4
                    style={{
                        textTransform: "uppercase",
                        paddingLeft: "1rem"
                    }}
                >
                    {kanban.kanbanName}
                </h4>
                <TaskContainer>
                    <Drop
                        type={"ROW"}
                        direction={"vertical"}
                        droppableId={String(kanban._id)}
                    >
                        <DropChild>
                            {tasks?.map((task, index) =>
                                (!param.type || task.type === param.type) &&
                                (!param.coordinatorId ||
                                    task.coordinatorId ===
                                        param.coordinatorId) &&
                                (!param.taskName ||
                                    task.taskName.includes(param.taskName)) ? (
                                    <Drag
                                        key={task._id}
                                        index={index}
                                        draggableId={"task" + task._id}
                                    >
                                        <TaskCardContainer
                                            onClick={() =>
                                                startEditing(task._id)
                                            }
                                            key={index}
                                        >
                                            <TaskCard>
                                                <div
                                                    style={{
                                                        marginBottom: "2rem"
                                                    }}
                                                >
                                                    {task.taskName}
                                                </div>
                                                <img
                                                    src={
                                                        task.type === "Task"
                                                            ? taskIcon
                                                            : bugIcon
                                                    }
                                                    alt={"Type icon"}
                                                />
                                            </TaskCard>
                                        </TaskCardContainer>
                                    </Drag>
                                ) : null
                            )}
                            <TaskCreator kanbanId={kanban._id} />
                        </DropChild>
                    </Drop>
                </TaskContainer>
            </KanbanContainer>
        );
    }
});

KanbanColumn.displayName = "Kanban Column";

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

const TaskCardContainer = styled.div`
    padding-bottom: 0.6rem;
`;

const TaskCard = styled.div`
    background-color: white;
    padding: 1.8rem 1.6rem;
`;
