import taskIcon from "../../assets/task.svg";
import bugIcon from "../../assets/bug.svg";
import styled from "@emotion/styled";
import { TaskSearchParam } from "../taskSearchPanel";
import TaskCreator from "../taskCreator";
import useTaskModal from "../../utils/hooks/useTaskModal";
import React from "react";
import { Drag, Drop, DropChild } from "../dragAndDrop";
import { Dropdown, MenuProps, Modal } from "antd";
import useReactMutation from "../../utils/hooks/useReactMutation";
import Row from "../row";
import { useParams } from "react-router-dom";
import deleteColumnCallback from "../../utils/optimisticUpdate/deleteColumn";
import { NoPaddingButton } from "../projectList";

const Column = React.forwardRef<
    HTMLDivElement,
    {
        tasks: ITask[];
        column: IColumn;
        param: TaskSearchParam;
        isDragDisabled: boolean;
    }
>(({ column, param, tasks, isDragDisabled, ...props }, ref) => {
    const { startEditing } = useTaskModal();
    return (
        <ColumnContainer {...props} ref={ref}>
            <Row between={true} marginBottom={1.5}>
                <h4
                    style={{
                        textTransform: "uppercase",
                        paddingLeft: "1rem"
                    }}
                >
                    {column.columnName}
                </h4>
                <DeleteDropDown columnId={column._id} />
            </Row>
            <TaskContainer>
                <Drop
                    type={"ROW"}
                    direction={"vertical"}
                    droppableId={String(column._id)}
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
                                    isDragDisabled={
                                        isDragDisabled || task._id === "mock"
                                    }
                                >
                                    <TaskCardContainer
                                        onClick={
                                            task._id !== "mock"
                                                ? () => startEditing(task._id)
                                                : undefined
                                        }
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
                        <TaskCreator
                            columnId={column._id}
                            disabled={isDragDisabled}
                        />
                    </DropChild>
                </Drop>
            </TaskContainer>
        </ColumnContainer>
    );
});

const DeleteDropDown: React.FC<{ columnId: string }> = ({ columnId }) => {
    const { projectId } = useParams<{ projectId: string }>();
    const { mutate: remove } = useReactMutation(
        "boards",
        "DELETE",
        ["boards", { projectId }],
        deleteColumnCallback
    );
    const onDelete = (columnId: string) => {
        Modal.confirm({
            centered: true,
            okText: "Confirm",
            cancelText: "Cancel",
            title: "Are you sure to delete this column?",
            content: "This action cannot be undone",
            onOk() {
                remove({ columnId: columnId });
            }
        });
    };
    const items: MenuProps["items"] = [
        {
            key: "delete",
            label: (
                <NoPaddingButton
                    size={"small"}
                    type={"text"}
                    disabled={columnId === "mock"}
                    onClick={() => onDelete(columnId)}
                    style={{ fontSize: "1.4rem" }}
                >
                    Delete
                </NoPaddingButton>
            )
        }
    ];
    return (
        <Dropdown menu={{ items }}>
            <NoPaddingButton type={"link"}>...</NoPaddingButton>
        </Dropdown>
    );
};

Column.displayName = "Column";

export default Column;

export const ColumnContainer = styled.div`
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
