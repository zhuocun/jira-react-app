import styled from "@emotion/styled";
import { Button, Space, Spin, Switch, Tooltip, Typography } from "antd";
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
import useAiEnabled from "../utils/hooks/useAiEnabled";
import useAiProjectDisabled from "../utils/hooks/useAiProjectDisabled";
import useDebounce from "../utils/hooks/useDebounce";
import useDragEnd from "../utils/hooks/useDragEnd";
import useReactQuery from "../utils/hooks/useReactQuery";
import useTitle from "../utils/hooks/useTitle";
import useUrl from "../utils/hooks/useUrl";

export const ColumnContainer = styled.div`
    display: flex;
    min-height: 75%;
    overflow-x: scroll;
`;

const BoardSpin = styled(Spin)`
    margin-left: calc(0.5 * (100vw - 16rem - 26.4rem));
    margin-top: calc(0.5 * (100vh - 6rem - 40.7rem));
    padding: 1rem;
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
    const { data: board, isLoading: bLoading } = useReactQuery<IColumn[]>(
        "boards",
        {
            projectId
        }
    );
    const { isLoading: mLoading, data: members } =
        useReactQuery<IMember[]>("users/members");

    const { data: tasks, isLoading: tLoading } = useReactQuery<ITask[]>(
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
                <Row between>
                    <h1>
                        {!pLoading
                            ? `${currentProject?.projectName} Board`
                            : "..."}
                    </h1>
                    {aiEnabled && (
                        <Space align="center">
                            <Tooltip title="Turn off to hide Board Copilot on this board and block AI requests for this project.">
                                <Space size={4}>
                                    <Switch
                                        aria-label="Board Copilot for this project"
                                        checked={!aiDisabledForProject}
                                        onChange={(checked) =>
                                            setProjectAiDisabled(!checked)
                                        }
                                    />
                                    <Typography.Text
                                        style={{ fontSize: "0.85rem" }}
                                        type="secondary"
                                    >
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
                                                tasksByColumn.get(
                                                    column._id
                                                ) ?? []
                                            }
                                            key={column._id}
                                            column={column}
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
                    <BoardSpin />
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
