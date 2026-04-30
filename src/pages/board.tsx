import styled from "@emotion/styled";
import {
    Alert,
    Button,
    Skeleton,
    Space,
    Spin,
    Switch,
    Tooltip,
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
import PageContainer from "../components/pageContainer";
import Row from "../components/row";
import TaskModal from "../components/taskModal";
import TaskSearchPanel from "../components/taskSearchPanel";
import { microcopy } from "../constants/microcopy";
import { space as themeSpace } from "../theme/tokens";
import useAiEnabled from "../utils/hooks/useAiEnabled";
import useAiProjectDisabled from "../utils/hooks/useAiProjectDisabled";
import useDebounce from "../utils/hooks/useDebounce";
import useDragEnd from "../utils/hooks/useDragEnd";
import useReactQuery from "../utils/hooks/useReactQuery";
import useTitle from "../utils/hooks/useTitle";
import useUrl from "../utils/hooks/useUrl";

export const ColumnContainer = styled.div`
    display: flex;
    flex: 1;
    min-height: 75%;
    overflow-x: auto;
    padding-bottom: ${themeSpace.xs}px;
`;

const BoardLoadingSkeleton = () => (
    <ColumnContainer aria-label="Loading board">
        {[0, 1, 2].map((i) => (
            <div
                key={i}
                style={{
                    background: "var(--ant-color-fill-quaternary, #f4f5f7)",
                    borderRadius: 8,
                    marginRight: themeSpace.md,
                    minWidth: "29.5rem",
                    padding: themeSpace.md
                }}
            >
                <Skeleton active paragraph={{ rows: 4 }} title />
            </div>
        ))}
        <Spin
            aria-label="Loading board"
            size="small"
            style={{ alignSelf: "flex-start", marginLeft: themeSpace.md }}
        />
    </ColumnContainer>
);

const BoardHeader = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${themeSpace.xs}px;
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
            <PageContainer>
                <BoardHeader>
                    <Row between>
                        {pLoading ? (
                            <span
                                aria-label="Loading project name"
                                role="status"
                            >
                                <Skeleton.Input
                                    active
                                    size="large"
                                    style={{ width: 240 }}
                                />
                            </span>
                        ) : (
                            <Typography.Title level={1} style={{ margin: 0 }}>
                                {currentProject?.projectName} board
                            </Typography.Title>
                        )}
                        {aiEnabled && (
                            <Space align="center" size={themeSpace.sm}>
                                <Tooltip title="Turn off to hide Board Copilot on this board and block AI requests for this project.">
                                    <Space size={themeSpace.xxs}>
                                        <Switch
                                            aria-label="Board Copilot for this project"
                                            checked={!aiDisabledForProject}
                                            onChange={(checked) =>
                                                setProjectAiDisabled(!checked)
                                            }
                                            size="small"
                                        />
                                        <Typography.Text type="secondary">
                                            Project AI
                                        </Typography.Text>
                                    </Space>
                                </Tooltip>
                                {boardAiOn && (
                                    <>
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
                                    </>
                                )}
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
                                    marginBottom: "0.75rem"
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
                        message={microcopy.feedback.loadFailed}
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
            </PageContainer>
        </DragDropContext>
    );
};

export default BoardPage;
