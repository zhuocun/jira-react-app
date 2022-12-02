import taskIcon from "../../assets/task.svg";
import bugIcon from "../../assets/bug.svg";
import styled from "@emotion/styled";
import { TaskSearchParam } from "../taskSearchPanel";
import TaskCreator from "../taskCreator";
import useTaskModal from "../../utils/hooks/useTaskModal";
import React from "react";
import { Drag, Drop, DropChild } from "../dragAndDrop";
import { Button, Dropdown, MenuProps, Modal } from "antd";
import useReactMutation from "../../utils/hooks/useReactMutation";
import Row from "../row";
import { useParams } from "react-router-dom";
import deleteKanbanCallback from "../../utils/optimisticUpdate/deleteKanban";

const KanbanColumn = React.forwardRef<
    HTMLDivElement,
    {
        tasks: ITask[];
        kanban: IKanban;
        param: TaskSearchParam;
    }
>(({ kanban, param, tasks, ...props }, ref) => {
    const { startEditing } = useTaskModal();
    return (
        <KanbanContainer {...props} ref={ref}>
            <Row between={true} marginBottom={1.5}>
                <h4
                    style={{
                        textTransform: "uppercase",
                        paddingLeft: "1rem"
                    }}
                >
                    {kanban.kanbanName}
                </h4>
                <DeleteDropDown kanbanId={kanban._id} />
            </Row>
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
                                task.coordinatorId === param.coordinatorId) &&
                            (!param.taskName ||
                                task.taskName.includes(param.taskName)) ? (
                                <Drag
                                    key={task._id || task.taskName}
                                    index={index}
                                    draggableId={"task" + task._id}
                                >
                                    <TaskCardContainer
                                        onClick={() => startEditing(task._id)}
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
});

const DeleteDropDown: React.FC<{ kanbanId: string }> = ({ kanbanId }) => {
    const { projectId } = useParams<{ projectId: string }>();
    const { mutate: remove } = useReactMutation(
        "kanbans",
        "DELETE",
        ["kanbans", { projectId }],
        deleteKanbanCallback
    );
    const onDelete = (kanbanId: string) => {
        Modal.confirm({
            centered: true,
            okText: "Confirm",
            cancelText: "Cancel",
            title: "Are you sure to delete this kanban?",
            content: "This action cannot be undone",
            onOk() {
                remove({ kanbanId });
            }
        });
    };
    const items: MenuProps["items"] = [
        {
            key: "delete",
            label: <a onClick={() => onDelete(kanbanId)}>Delete</a>
        }
    ];
    return (
        <Dropdown menu={{ items }}>
            <Button style={{ padding: 0 }} type={"link"}>
                ...
            </Button>
        </Dropdown>
    );
};

KanbanColumn.displayName = "Kanban Column";

export default KanbanColumn;

export const KanbanContainer = styled.div`
    min-width: 29.5rem;
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
    display: flex;
    justify-content: center;
`;

const TaskCard = styled.div`
    width: 28rem;
    background-color: white;
    padding: 1.8rem 1.6rem;
`;
