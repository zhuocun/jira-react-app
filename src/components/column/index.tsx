import { MoreOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";
import {
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
import UserAvatar from "../userAvatar";

export const ColumnContainer = styled.div`
    background: var(--ant-color-fill-quaternary, rgba(15, 23, 42, 0.04));
    border: 1px solid transparent;
    border-radius: ${radius.lg}px;
    display: flex;
    flex-direction: column;
    margin-right: ${space.md}px;
    /* Fix the column at 18rem so a single ultra-wide task card cannot
     * stretch the lane past its lane-mates. min-width alone is a floor —
     * flex-basis: auto resolves to the card's max-content and the column
     * grew to ~780px when a 120-char single-token task name appeared. */
    width: ${columnMinWidthRem}rem;
    flex: 0 0 ${columnMinWidthRem}rem;
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

const FilteredEmpty = styled.div`
    align-items: center;
    background: var(--ant-color-fill-quaternary, rgba(15, 23, 42, 0.04));
    border: 1px dashed var(--ant-color-border-secondary, rgba(15, 23, 42, 0.12));
    border-radius: ${radius.md}px;
    color: var(--ant-color-text-secondary, rgba(15, 23, 42, 0.55));
    display: flex;
    flex-direction: column;
    font-size: ${fontSize.xs}px;
    gap: ${space.xxs}px;
    padding: ${space.sm}px ${space.md}px;
    text-align: center;
`;

const FilteredEmptyButton = styled.button`
    background: transparent;
    border: 0;
    border-radius: ${radius.sm}px;
    color: var(--ant-color-primary, #5e6ad2);
    cursor: pointer;
    font-size: ${fontSize.xs}px;
    font-weight: ${fontWeight.medium};
    padding: ${space.xxs}px ${space.xs}px;

    &:hover,
    &:focus-visible {
        background: var(--ant-color-primary-bg, rgba(94, 106, 210, 0.1));
        outline: none;
    }
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

    &:focus-visible {
        border-color: var(--ant-color-primary, #5e6ad2);
        outline: none;
        box-shadow: ${shadow.focus}, ${shadow.md};
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
    /* A 120-char single-token name (URL, commit hash) has no natural break
     * points, so the line-clamp can't truncate and the unbreakable run grows
     * the column past 18rem, distorting the whole kanban. break-word lets the
     * run split mid-character so the clamp engages and the column stays at
     * its min-width. */
    word-break: break-word;
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

    /*
     * Lift the column-level "more actions" trigger to a 32 × 32 hit target
     * on touch viewports so a thumb can land it without zooming. The icon
     * stays visually small but the surrounding padding grows, satisfying
     * WCAG 2.5.5 (24 × 24 minimum, 44 × 44 recommended on coarse pointers).
     */
    @media (pointer: coarse) {
        > button:last-child,
        > div:last-child > button {
            min-height: 32px;
            min-width: 32px;
        }
    }
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
                            paddingInline: space.xs,
                            maxWidth: "100%",
                            wordBreak: "break-word",
                            whiteSpace: "normal"
                        }}
                    >
                        {task.epic}
                    </Tag>
                ) : null}
                <CardTitle>{task.taskName}</CardTitle>
                <CardFooter>
                    {/* The label "Bug"/"Task" reads as the visible text and
                     * the icon is decorative, so no Tooltip is needed —
                     * the previous Tooltip duplicated the label and
                     * announced it twice to screen readers. */}
                    <span
                        style={{
                            alignItems: "center",
                            color: isBug ? "#DB2777" : "#5E6AD2",
                            display: "inline-flex",
                            fontWeight: fontWeight.medium,
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
                                    fontWeight: fontWeight.semibold,
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
                                <UserAvatar
                                    aria-label={`Assigned to ${coordinator.username}`}
                                    id={coordinator._id}
                                    name={coordinator.username}
                                />
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
        onResetFilters?: () => void;
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
            onResetFilters,
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
        const hasTasksHiddenByFilter =
            tasks.length > 0 && filteredTasks.length === 0;
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
                            {hasTasksHiddenByFilter ? (
                                <FilteredEmpty aria-live="polite" role="status">
                                    <span>
                                        {microcopy.empty.filteredColumn.title}
                                    </span>
                                    {onResetFilters ? (
                                        <FilteredEmptyButton
                                            onClick={onResetFilters}
                                            type="button"
                                        >
                                            {microcopy.empty.filteredColumn.cta}
                                        </FilteredEmptyButton>
                                    ) : null}
                                </FilteredEmpty>
                            ) : null}
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
