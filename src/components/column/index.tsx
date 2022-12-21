import styled from "@emotion/styled";
import { Dropdown, MenuProps, Modal } from "antd";
import React from "react";
import { useParams } from "react-router-dom";

import bugIcon from "../../assets/bug.svg";
import taskIcon from "../../assets/task.svg";
import useReactMutation from "../../utils/hooks/useReactMutation";
import useTaskModal from "../../utils/hooks/useTaskModal";
import deleteColumnCallback from "../../utils/optimisticUpdate/deleteColumn";
import { Drag, Drop, DropChild } from "../dragAndDrop";
import { NoPaddingButton } from "../projectList";
import Row from "../row";
import TaskCreator from "../taskCreator";
import { TaskSearchParam } from "../taskSearchPanel";

export const ColumnContainer = styled.div`
    background-color: rgb(244, 245, 247);
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    margin-right: 1.5rem;
    min-width: 29.5rem;
    padding: 0.7rem;
`;

const TaskContainer = styled.div`
    flex: 1;
    overflow: scroll;

    ::-webkit-scrollbar {
        display: none;
    }
`;

const TaskCardContainer = styled.div`
    display: flex;
    justify-content: center;
    padding-bottom: 0.6rem;
`;

const TaskCard = styled.div`
    background-color: white;
    padding: 1.8rem 1.6rem;
    width: 28rem;
`;

const DeleteDropDown: React.FC<{ columnId: string }> = ({ columnId }) => {
    const { projectId } = useParams<{ projectId: string }>();
    const { mutate: remove } = useReactMutation(
        "boards",
        "DELETE",
        ["boards", { projectId }],
        deleteColumnCallback
    );
    const onDelete = (id: string) => {
        Modal.confirm({
            centered: true,
            okText: "Confirm",
            cancelText: "Cancel",
            title: "Are you sure to delete this column?",
            content: "This action cannot be undone",
            onOk() {
                remove({ columnId: id });
            }
        });
    };
    const items: MenuProps["items"] = [
        {
            key: "delete",
            label: (
                <NoPaddingButton
                    size="small"
                    type="text"
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
            <NoPaddingButton type="link">...</NoPaddingButton>
        </Dropdown>
    );
};

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
            <Row between marginBottom={1.5}>
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
                    type="ROW"
                    direction="vertical"
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
                                    draggableId={`task${task._id}`}
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
                                                alt="Type icon"
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

Column.displayName = "Column";

export default Column;
