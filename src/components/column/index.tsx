import { MoreOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";
import {
    Avatar,
    Badge,
    Dropdown,
    MenuProps,
    Modal,
    Tag,
    Tooltip,
    Typography
} from "antd";
import React from "react";
import { useParams } from "react-router-dom";

import bugIcon from "../../assets/bug.svg";
import taskIcon from "../../assets/task.svg";
import { microcopy } from "../../constants/microcopy";
import {
    breakpoints,
    columnMinWidthRem,
    fontSize,
    fontWeight,
    letterSpacing,
    radius,
    shadow,
    space
} from "../../theme/tokens";
import useReactMutation from "../../utils/hooks/useReactMutation";
import useTaskModal from "../../utils/hooks/useTaskModal";
import deleteColumnCallback from "../../utils/optimisticUpdate/deleteColumn";
import { Drag, Drop, DropChild } from "../dragAndDrop";
import { NoPaddingButton } from "../projectList";
import Row from "../row";
import TaskCreator from "../taskCreator";
import { TaskSearchParam } from "../taskSearchPanel";

export const ColumnContainer = styled.div`
    background: var(--ant-color-fill-quaternary, rgba(15, 23, 42, 0.04));
    border: 1px solid transparent;
    border-radius: ${radius.lg}px;
    display: flex;
    flex-direction: column;
    margin-right: ${space.md}px;
    min-width: ${columnMinWidthRem}rem;
    padding: ${space.sm}px;
    transition: background-color 200ms ease-out;

    /*
     * On phone-sized viewports a full desktop column overflows the screen.
     * BoardShell uses ${space.md}px horizontal padding on mobile (16 + 16 =
     * 32). Subtract another ${space.md}px so the next column peeks past the
     * edge — that's the affordance that hints "more columns this way" and
     * pairs with scroll-snap on the parent to give a Trello-style flick UX.
     */
    @media (max-width: ${breakpoints.md - 1}px) {
        min-width: min(
            ${columnMinWidthRem}rem,
            calc(100vw - ${space.md * 2 + space.md}px)
        );
        width: min(
            ${columnMinWidthRem}rem,
            calc(100vw - ${space.md * 2 + space.md}px)
        );
    }
`;

const TaskContainer = styled.div`
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: ${space.xs}px;
    overflow-y: auto;
    padding-bottom: ${space.xs}px;
`;

const TaskCardOuter = styled.button`
    background: var(--ant-color-bg-container, #fff);
    border: 1px solid var(--ant-color-border-secondary, rgba(15, 23, 42, 0.06));
    border-radius: ${radius.md}px;
    box-shadow: ${shadow.xs};
    cursor: pointer;
    display: block;
    padding: ${space.sm}px ${space.md}px;
    text-align: left;
    transition:
        border-color 120ms ease-out,
        box-shadow 120ms ease-out,
        transform 120ms ease-out;
    width: 100%;

    &:hover:not(:disabled) {
        border-color: var(--ant-color-primary-border, rgba(94, 106, 210, 0.4));
        box-shadow: ${shadow.md};
        transform: translateY(-1px);
    }

    &:active:not(:disabled) {
        transform: translateY(0);
    }

    &:disabled {
        cursor: default;
        opacity: 0.7;
    }

    /* On touch devices the hover lift feels janky and never triggers; skip
     * it so finger taps don't get a stale outline. */
    @media (hover: none) {
        &:hover:not(:disabled) {
            border-color: var(
                --ant-color-border-secondary,
                rgba(15, 23, 42, 0.06)
            );
            box-shadow: ${shadow.xs};
            transform: none;
        }
    }
`;

const CardTitle = styled.div`
    color: var(--ant-color-text, rgba(15, 23, 42, 0.92));
    display: -webkit-box;
    font-size: ${fontSize.base}px;
    font-weight: ${fontWeight.medium};
    line-height: 1.4;
    margin-bottom: ${space.xs}px;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
`;

const CardFooter = styled.div`
    align-items: center;
    color: var(--ant-color-text-secondary, rgba(15, 23, 42, 0.55));
    display: flex;
    font-size: ${fontSize.xs}px;
    gap: ${space.xs}px;
    justify-content: space-between;
`;

const ColumnHeader = styled(Row)`
    align-items: center;
    margin-bottom: ${space.sm}px;
    padding: ${space.xxs}px ${space.xs}px;
`;

const ColumnTitle = styled(Typography.Title)`
    && {
        color: var(--ant-color-text-secondary, rgba(15, 23, 42, 0.65));
        font-size: ${fontSize.xs}px;
        font-weight: ${fontWeight.semibold};
        letter-spacing: ${letterSpacing.wider};
        margin: 0;
        text-transform: uppercase;
    }
`;

const ColumnDot = styled.span<{ statusColor: string }>`
    background: ${(props) => props.statusColor};
    border-radius: 50%;
    box-shadow: 0 0 0 4px ${(props) => `${props.statusColor}33`};
    display: inline-block;
    flex: 0 0 auto;
    height: 8px;
    width: 8px;
`;

const STATUS_PALETTE = [
    "#94A3B8",
    "#5E6AD2",
    "#7C5CFF",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#3B82F6",
    "#F472B6"
] as const;

const dotForColumn = (id: string): string => {
    let hash = 0;
    for (let i = 0; i < id.length; i += 1) {
        hash = (hash * 31 + id.charCodeAt(i)) | 0;
    }
    return STATUS_PALETTE[Math.abs(hash) % STATUS_PALETTE.length];
};

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
                        variant="filled"
                        color={isBug ? "magenta" : "geekblue"}
                        style={{
                            fontSize: fontSize.xs,
                            fontWeight: 500,
                            marginBottom: space.xs,
                            paddingInline: space.xs
                        }}
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
                                color: isBug ? "#DB2777" : "#5E6AD2",
                                display: "inline-flex",
                                fontWeight: 500,
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
                            <Tag
                                variant="filled"
                                style={{
                                    margin: 0,
                                    fontWeight: 600,
                                    fontVariantNumeric: "tabular-nums"
                                }}
                            >
                                {task.storyPoints} pts
                            </Tag>
                        ) : null}
                        {coordinator ? (
                            <Tooltip
                                title={`Assigned to ${coordinator.username}`}
                            >
                                <Avatar
                                    size="small"
                                    style={{
                                        background:
                                            "linear-gradient(135deg, #7C5CFF 0%, #5E6AD2 100%)",
                                        color: "#fff",
                                        fontSize: 11,
                                        fontWeight: 600
                                    }}
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
                <ColumnHeader between>
                    <span
                        style={{
                            alignItems: "center",
                            display: "inline-flex",
                            gap: space.xs,
                            minWidth: 0
                        }}
                    >
                        <ColumnDot
                            aria-hidden
                            statusColor={dotForColumn(column._id)}
                        />
                        <ColumnTitle level={4}>{column.columnName}</ColumnTitle>
                        <Badge
                            aria-label={`${filteredTasks.length} tasks in ${column.columnName}`}
                            color="default"
                            count={filteredTasks.length}
                            showZero
                            style={{
                                backgroundColor:
                                    "var(--ant-color-fill-secondary, rgba(15, 23, 42, 0.06))",
                                color: "var(--ant-color-text-secondary, rgba(15, 23, 42, 0.55))",
                                fontWeight: 600
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
                                    // TaskCard renders a <button>, which @hello-pangea/dnd
                                    // refuses to drag from by default; opt out of that block.
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
