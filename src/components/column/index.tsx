import { MoreOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";
import { Avatar, Badge, Dropdown, MenuProps, Modal, Tag, Tooltip } from "antd";
import React from "react";
import { useParams } from "react-router-dom";

import bugIcon from "../../assets/bug.svg";
import taskIcon from "../../assets/task.svg";
import { microcopy } from "../../constants/microcopy";
import { brand, radius, space } from "../../theme/tokens";
import useReactMutation from "../../utils/hooks/useReactMutation";
import useTaskModal from "../../utils/hooks/useTaskModal";
import deleteColumnCallback from "../../utils/optimisticUpdate/deleteColumn";
import { Drag, Drop, DropChild } from "../dragAndDrop";
import { NoPaddingButton } from "../projectList";
import Row from "../row";
import TaskCreator from "../taskCreator";
import { TaskSearchParam } from "../taskSearchPanel";

export const ColumnContainer = styled.div`
    background-color: var(--ant-color-fill-quaternary, rgb(244, 245, 247));
    border-radius: ${radius.lg}px;
    display: flex;
    flex-direction: column;
    margin-right: ${space.md}px;
    min-width: 29.5rem;
    padding: ${space.xs}px;
`;

const TaskContainer = styled.div`
    flex: 1;
    overflow-y: auto;
`;

const TaskCardOuter = styled.button`
    background: var(--ant-color-bg-container, #fff);
    border: 1px solid transparent;
    border-radius: ${radius.md}px;
    box-shadow: 0 1px 0 rgba(9, 30, 66, 0.08);
    cursor: pointer;
    display: block;
    margin-bottom: ${space.xs}px;
    padding: ${space.sm}px ${space.sm}px;
    text-align: left;
    transition:
        border-color 100ms ease-out,
        box-shadow 100ms ease-out;
    width: 100%;

    &:hover:not(:disabled) {
        border-color: var(--ant-color-primary, ${brand.primary});
        box-shadow: 0 2px 6px rgba(9, 30, 66, 0.16);
    }

    &:disabled {
        cursor: default;
        opacity: 0.85;
    }
`;

const CardTitle = styled.div`
    color: var(--ant-color-text, rgba(0, 0, 0, 0.88));
    display: -webkit-box;
    font-weight: 500;
    line-height: 1.4;
    margin-bottom: ${space.xs}px;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
`;

const CardFooter = styled.div`
    align-items: center;
    color: var(--ant-color-text-secondary, rgba(0, 0, 0, 0.6));
    display: flex;
    font-size: 12px;
    gap: ${space.xs}px;
    justify-content: space-between;
`;

const ColumnHeader = styled(Row)`
    padding: ${space.xxs}px ${space.xs}px ${space.xs}px;
`;

const initialsOf = (username: string | undefined): string => {
    if (!username) return "?";
    const parts = username.trim().split(/\s+/);
    const head = parts[0]?.[0] ?? "";
    const tail = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (head + tail).toUpperCase() || username[0].toUpperCase();
};

const DeleteDropDown: React.FC<{ columnId: string; columnName: string }> = ({
    columnId,
    columnName
}) => {
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
            okText: microcopy.confirm.deleteColumn.confirmLabel,
            cancelText: microcopy.actions.cancel,
            okButtonProps: { danger: true },
            title: microcopy.confirm.deleteColumn.title,
            content: microcopy.confirm.deleteColumn.description,
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
                    aria-label={`Delete column ${columnName}`}
                    danger
                    disabled={columnId === "mock"}
                    onClick={() => onDelete(columnId)}
                    size="small"
                    type="text"
                >
                    {microcopy.actions.delete}
                </NoPaddingButton>
            )
        }
    ];
    return (
        <Dropdown menu={{ items }}>
            <NoPaddingButton
                aria-label={`More actions for column ${columnName}`}
                icon={<MoreOutlined />}
                size="small"
                type="text"
            />
        </Dropdown>
    );
};

type TaskCardProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    task: ITask;
    members: IMember[];
    onOpen?: () => void;
    isMock?: boolean;
};

const TaskCard = React.forwardRef<HTMLButtonElement, TaskCardProps>(
    (
        { task, members, onOpen, isMock, "aria-label": ariaLabel, ...rest },
        ref
    ) => {
        const coordinator = members.find((m) => m._id === task.coordinatorId);
        const isBug = task.type === "Bug";
        return (
            <TaskCardOuter
                aria-label={ariaLabel ?? `Open task ${task.taskName}`}
                disabled={isMock}
                onClick={onOpen}
                ref={ref}
                type="button"
                {...rest}
            >
                {task.epic ? (
                    <Tag
                        color={isBug ? "red" : "blue"}
                        style={{ marginBottom: space.xs }}
                    >
                        {task.epic}
                    </Tag>
                ) : null}
                <CardTitle>{task.taskName}</CardTitle>
                <CardFooter>
                    <Tooltip title={isBug ? "Bug" : "Task"}>
                        <span
                            style={{
                                alignItems: "center",
                                display: "inline-flex",
                                gap: space.xxs
                            }}
                        >
                            <img
                                alt=""
                                aria-hidden
                                src={isBug ? bugIcon : taskIcon}
                                style={{ height: 14, width: 14 }}
                            />
                            <span>{isBug ? "Bug" : "Task"}</span>
                        </span>
                    </Tooltip>
                    <span
                        style={{
                            alignItems: "center",
                            display: "inline-flex",
                            gap: space.xs
                        }}
                    >
                        {typeof task.storyPoints === "number" ? (
                            <Tag style={{ margin: 0 }}>
                                {task.storyPoints} pts
                            </Tag>
                        ) : null}
                        {coordinator ? (
                            <Tooltip
                                title={`Assigned to ${coordinator.username}`}
                            >
                                <Avatar
                                    size="small"
                                    style={{ backgroundColor: brand.primary }}
                                >
                                    {initialsOf(coordinator.username)}
                                </Avatar>
                            </Tooltip>
                        ) : null}
                    </span>
                </CardFooter>
            </TaskCardOuter>
        );
    }
);

TaskCard.displayName = "TaskCard";

const Column = React.forwardRef<
    HTMLDivElement,
    {
        tasks: ITask[];
        column: IColumn;
        param: TaskSearchParam;
        isDragDisabled: boolean;
        boardAiOn?: boolean;
        members?: IMember[];
    }
>(
    (
        {
            column,
            param,
            tasks,
            isDragDisabled,
            boardAiOn = true,
            members = [],
            ...props
        },
        ref
    ) => {
        const { startEditing } = useTaskModal();
        const filteredTasks = tasks.filter(
            (task) =>
                (!param.type || task.type === param.type) &&
                (!param.coordinatorId ||
                    task.coordinatorId === param.coordinatorId) &&
                (!param.taskName || task.taskName.includes(param.taskName)) &&
                (!param.semanticIds ||
                    param.semanticIds
                        .split(",")
                        .filter(Boolean)
                        .includes(task._id))
        );
        return (
            <ColumnContainer {...props} ref={ref}>
                <ColumnHeader between marginBottom={1.5}>
                    <span
                        style={{
                            alignItems: "center",
                            display: "inline-flex",
                            gap: space.xs
                        }}
                    >
                        <h4
                            style={{
                                margin: 0,
                                textTransform: "uppercase"
                            }}
                        >
                            {column.columnName}
                        </h4>
                        <Badge
                            color="default"
                            count={filteredTasks.length}
                            showZero
                            style={{
                                backgroundColor: "rgba(9, 30, 66, 0.08)",
                                color: "rgba(9, 30, 66, 0.7)"
                            }}
                        />
                    </span>
                    <DeleteDropDown
                        columnId={column._id}
                        columnName={column.columnName}
                    />
                </ColumnHeader>
                <TaskContainer>
                    <Drop
                        type="ROW"
                        direction="vertical"
                        droppableId={String(column._id)}
                    >
                        <DropChild>
                            {filteredTasks.map((task, index) => (
                                <Drag
                                    key={task._id || task.taskName}
                                    index={index}
                                    draggableId={`task${task._id}`}
                                    isDragDisabled={
                                        isDragDisabled || task._id === "mock"
                                    }
                                    disableInteractiveElementBlocking
                                >
                                    <TaskCard
                                        isMock={task._id === "mock"}
                                        members={members}
                                        onOpen={
                                            task._id !== "mock"
                                                ? () => startEditing(task._id)
                                                : undefined
                                        }
                                        task={task}
                                    />
                                </Drag>
                            ))}
                            <TaskCreator
                                boardAiOn={boardAiOn}
                                columnId={column._id}
                                disabled={isDragDisabled}
                            />
                        </DropChild>
                    </Drop>
                </TaskContainer>
            </ColumnContainer>
        );
    }
);

Column.displayName = "Column";

export default Column;
