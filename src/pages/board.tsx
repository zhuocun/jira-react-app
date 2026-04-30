import { SettingOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";
import {
    Alert,
    Button,
    Popover,
    Skeleton,
    Space,
    Spin,
    Switch,
    Typography
} from "antd";
import { DragDropContext } from "@hello-pangea/dnd";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import AiChatDrawer from "../components/aiChatDrawer";
import AiSearchInput from "../components/aiSearchInput";
import AiSparkleIcon from "../components/aiSparkleIcon";
import BoardBriefDrawer from "../components/boardBriefDrawer";
import Column from "../components/column";
import ColumnCreator from "../components/columnCreator";
import { Drag, Drop, DropChild } from "../components/dragAndDrop";
import Row from "../components/row";
import TaskModal from "../components/taskModal";
import TaskSearchPanel from "../components/taskSearchPanel";
import { microcopy } from "../constants/microcopy";
import {
    breakpoints,
    columnMinWidthRem,
    fontSize,
    fontWeight,
    letterSpacing,
    lineHeight,
    radius,
    space as themeSpace
} from "../theme/tokens";
import useAiEnabled from "../utils/hooks/useAiEnabled";
import useAiProjectDisabled from "../utils/hooks/useAiProjectDisabled";
import useDebounce from "../utils/hooks/useDebounce";
import useDragEnd from "../utils/hooks/useDragEnd";
import useReactQuery from "../utils/hooks/useReactQuery";
import useTitle from "../utils/hooks/useTitle";
import useUrl from "../utils/hooks/useUrl";

/**
 * The board page deliberately opts out of `PageContainer`'s max-width because
 * Kanban columns flow horizontally and benefit from the full viewport on
 * ultra-wide monitors. We keep our own padding here.
 */
const BoardShell = styled.div`
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    padding: ${themeSpace.lg}px ${themeSpace.md}px ${themeSpace.md}px;
    padding-block-end: max(${themeSpace.lg}px, env(safe-area-inset-bottom));
    padding-inline-start: max(${themeSpace.md}px, env(safe-area-inset-left));
    padding-inline-end: max(${themeSpace.md}px, env(safe-area-inset-right));
    width: 100%;

    @media (min-width: ${breakpoints.md}px) {
        padding: ${themeSpace.xl}px ${themeSpace.xl}px ${themeSpace.xl}px;
        padding-inline-start: max(
            ${themeSpace.xl}px,
            env(safe-area-inset-left)
        );
        padding-inline-end: max(${themeSpace.xl}px, env(safe-area-inset-right));
    }
`;

export const ColumnContainer = styled.div`
    display: flex;
    flex: 1;
    min-height: 75%;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    padding-bottom: ${themeSpace.xs}px;
    /* Native, momentum-based scrolling on iOS so swiping between columns feels
     * fluid; the DnD library still catches long-press gestures separately. */
    -webkit-overflow-scrolling: touch;
    scroll-padding-inline: ${themeSpace.md}px;

    /* Subtle scrollbar on platforms that paint one (Firefox, desktop Linux,
     * older Edge). Keeps the visual rhythm calm without going to a hidden
     * scrollbar (which would remove the affordance entirely). */
    scrollbar-width: thin;
    scrollbar-color: var(--ant-color-fill-secondary, rgba(15, 23, 42, 0.08))
        transparent;

    &::-webkit-scrollbar {
        height: 8px;
    }
    &::-webkit-scrollbar-thumb {
        background: var(--ant-color-fill-secondary, rgba(15, 23, 42, 0.08));
        border-radius: ${radius.pill}px;
    }
    &::-webkit-scrollbar-thumb:hover {
        background: var(--ant-color-fill-tertiary, rgba(15, 23, 42, 0.16));
    }

    /*
     * On phone-sized viewports we show roughly one column at a time, so
     * snap horizontal swipes to each column for a Trello-style flick UX.
     * The DnD library still controls drag-and-drop; native scrolling only
     * kicks in on swipes that don't engage the drag handle.
     */
    @media (max-width: ${breakpoints.md - 1}px) {
        scroll-snap-type: x mandatory;

        > * {
            scroll-snap-align: start;
        }
    }
`;

const BoardLoadingSkeleton = () => (
    <ColumnContainer aria-busy="true" aria-label={microcopy.a11y.loadingBoard}>
        {[0, 1, 2].map((i) => (
            <div
                key={i}
                style={{
                    background: "var(--ant-color-fill-quaternary, #f4f5f7)",
                    borderRadius: radius.lg,
                    marginRight: themeSpace.md,
                    minWidth: `${columnMinWidthRem}rem`,
                    padding: themeSpace.md
                }}
            >
                <Skeleton active paragraph={{ rows: 4 }} title />
            </div>
        ))}
        <Spin
            aria-label={microcopy.a11y.loadingBoard}
            size="small"
            style={{ alignSelf: "flex-start", marginLeft: themeSpace.md }}
        />
    </ColumnContainer>
);

const BoardHeader = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${themeSpace.xs}px;
    margin-bottom: ${themeSpace.lg}px;
`;

const BoardTitle = styled(Typography.Title)`
    && {
        flex: 1 1 auto;
        font-size: ${fontSize.xl}px;
        font-weight: ${fontWeight.semibold};
        letter-spacing: ${letterSpacing.tight};
        line-height: ${lineHeight.tight};
        margin: 0;
        min-width: 0;
        overflow-wrap: anywhere;
    }

    @media (min-width: ${breakpoints.md}px) {
        && {
            font-size: ${fontSize.xxl}px;
        }
    }
`;

const BoardPage = () => {
    useTitle("Board");
    const { projectId } = useParams<{ projectId: string }>();
    const [param, setParam] = useUrl([
        "taskName",
        "coordinatorId",
        "type",
        "semanticIds"
    ]);
    const debouncedParam = useDebounce(param, 1000);
    const { data: currentProject, isLoading: pLoading } =
        useReactQuery<IProject>("projects", {
            projectId
        });
    const {
        data: board,
        isLoading: bLoading,
        error: bError,
        refetch: refetchBoard
    } = useReactQuery<IColumn[]>("boards", {
        projectId
    });
    const { isLoading: mLoading, data: members } =
        useReactQuery<IMember[]>("users/members");

    const {
        data: tasks,
        isLoading: tLoading,
        error: tError,
        refetch: refetchTasks
    } = useReactQuery<ITask[]>(
        "tasks",
        {
            projectId
        },
        undefined,
        undefined,
        undefined,
        Boolean(board)
    );

    const { onDragEnd, isColumnDragDisabled, isTaskDragDisabled } =
        useDragEnd();
    const visibleTasks = tasks ?? [];
    const tasksByColumn = useMemo(() => {
        const buckets = new Map<string, ITask[]>();
        for (const t of visibleTasks) {
            const list = buckets.get(t.columnId);
            if (list) {
                list.push(t);
            } else {
                buckets.set(t.columnId, [t]);
            }
        }
        return buckets;
    }, [visibleTasks]);
    const { enabled: aiEnabled } = useAiEnabled();
    const {
        disabled: aiDisabledForProject,
        setDisabled: setProjectAiDisabled
    } = useAiProjectDisabled(projectId);
    const boardAiOn = aiEnabled && !aiDisabledForProject;
    const aiProjectContext =
        currentProject && board
            ? {
                  project: {
                      _id: currentProject._id,
                      projectName: currentProject.projectName
                  },
                  columns: board,
                  tasks: visibleTasks,
                  members: members ?? []
              }
            : null;
    const [briefOpen, setBriefOpen] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);

    useEffect(() => {
        if (!boardAiOn && param.semanticIds) {
            setParam({ semanticIds: undefined });
        }
    }, [boardAiOn, param.semanticIds, setParam]);

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <BoardShell>
                <BoardHeader>
                    <Row
                        between
                        style={{
                            flexWrap: "wrap",
                            gap: themeSpace.sm,
                            rowGap: themeSpace.xs
                        }}
                    >
                        {pLoading ? (
                            <span
                                aria-label="Loading project name"
                                role="status"
                            >
                                <Skeleton.Input
                                    active
                                    size="large"
                                    style={{ maxWidth: "100%", width: 240 }}
                                />
                            </span>
                        ) : (
                            <BoardTitle level={1}>
                                {currentProject?.projectName} board
                            </BoardTitle>
                        )}
                        {aiEnabled && (
                            <Space align="center" size={themeSpace.xs} wrap>
                                {boardAiOn && (
                                    <Space.Compact>
                                        <Button
                                            aria-label="Open Board Copilot brief"
                                            icon={<AiSparkleIcon />}
                                            onClick={() => setBriefOpen(true)}
                                            type="default"
                                        >
                                            Brief
                                        </Button>
                                        <Button
                                            aria-label="Ask Board Copilot"
                                            icon={<AiSparkleIcon />}
                                            onClick={() => setChatOpen(true)}
                                            type="default"
                                        >
                                            Ask
                                        </Button>
                                    </Space.Compact>
                                )}
                                <Popover
                                    content={
                                        <Space
                                            orientation="vertical"
                                            size={themeSpace.xs}
                                            style={{ minWidth: 240 }}
                                        >
                                            <Typography.Text type="secondary">
                                                Board Copilot
                                            </Typography.Text>
                                            <div
                                                style={{
                                                    alignItems: "center",
                                                    display: "flex",
                                                    gap: themeSpace.sm,
                                                    justifyContent:
                                                        "space-between"
                                                }}
                                            >
                                                <span>
                                                    Enable on this board
                                                </span>
                                                <Switch
                                                    aria-label="Board Copilot for this project"
                                                    checked={
                                                        !aiDisabledForProject
                                                    }
                                                    onChange={(checked) =>
                                                        setProjectAiDisabled(
                                                            !checked
                                                        )
                                                    }
                                                    size="small"
                                                />
                                            </div>
                                            <Typography.Text
                                                style={{ fontSize: 12 }}
                                                type="secondary"
                                            >
                                                Hides Board Copilot on this
                                                board and blocks AI requests for
                                                this project.
                                            </Typography.Text>
                                        </Space>
                                    }
                                    placement="bottomRight"
                                    trigger={["click"]}
                                >
                                    <Button
                                        aria-label="Board Copilot settings"
                                        icon={<SettingOutlined />}
                                        type="text"
                                    />
                                </Popover>
                            </Space>
                        )}
                    </Row>
                </BoardHeader>
                <TaskSearchPanel
                    tasks={visibleTasks}
                    param={param}
                    setParam={setParam}
                    members={members}
                    loading={tLoading || mLoading}
                    aiSearchSlot={
                        boardAiOn && aiProjectContext ? (
                            <div
                                style={{
                                    flexBasis: "100%",
                                    marginBottom: themeSpace.sm
                                }}
                            >
                                <AiSearchInput
                                    kind="tasks"
                                    projectContext={aiProjectContext}
                                    semanticIds={param.semanticIds}
                                    setSemanticIds={(value) =>
                                        setParam({ semanticIds: value })
                                    }
                                />
                            </div>
                        ) : undefined
                    }
                />
                {bError || tError ? (
                    <Alert
                        action={
                            <Button
                                onClick={() => {
                                    if (bError) refetchBoard();
                                    if (tError) refetchTasks();
                                }}
                                size="small"
                                type="primary"
                            >
                                {microcopy.actions.retry}
                            </Button>
                        }
                        description={microcopy.feedback.retryHint}
                        title={microcopy.feedback.loadFailed}
                        showIcon
                        style={{ marginBottom: themeSpace.md }}
                        type="error"
                    />
                ) : null}
                {!(bLoading || tLoading) ? (
                    <ColumnContainer>
                        <Drop
                            droppableId="column"
                            type="COLUMN"
                            direction="horizontal"
                        >
                            <DropChild style={{ display: "flex" }}>
                                {board?.map((column, index) => (
                                    <Drag
                                        key={column._id}
                                        draggableId={`column${column._id}`}
                                        index={index}
                                        isDragDisabled={
                                            isColumnDragDisabled ||
                                            isTaskDragDisabled ||
                                            column._id === "mock"
                                        }
                                    >
                                        <Column
                                            boardAiOn={boardAiOn}
                                            tasks={
                                                tasksByColumn.get(column._id) ??
                                                []
                                            }
                                            key={column._id}
                                            column={column}
                                            members={members ?? []}
                                            param={debouncedParam}
                                            isDragDisabled={isTaskDragDisabled}
                                        />
                                    </Drag>
                                ))}
                            </DropChild>
                        </Drop>
                        <ColumnCreator />
                    </ColumnContainer>
                ) : (
                    <BoardLoadingSkeleton />
                )}
                <TaskModal boardAiOn={boardAiOn} tasks={visibleTasks} />
                {boardAiOn && (
                    <>
                        <BoardBriefDrawer
                            columns={board ?? []}
                            members={members ?? []}
                            onClose={() => setBriefOpen(false)}
                            open={briefOpen}
                            project={currentProject}
                            tasks={visibleTasks}
                        />
                        <AiChatDrawer
                            columns={board ?? []}
                            knownProjectIds={projectId ? [projectId] : []}
                            members={members ?? []}
                            onClose={() => setChatOpen(false)}
                            open={chatOpen}
                            project={currentProject ?? null}
                            tasks={visibleTasks}
                        />
                    </>
                )}
            </BoardShell>
        </DragDropContext>
    );
};

export default BoardPage;
