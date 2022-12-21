import styled from "@emotion/styled";
import { Spin } from "antd";
import { DragDropContext } from "react-beautiful-dnd";
import { useParams } from "react-router-dom";

import Column from "../components/column";
import ColumnCreator from "../components/columnCreator";
import { Drag, Drop, DropChild } from "../components/dragAndDrop";
import PageContainer from "../components/pageContainer";
import TaskModal from "../components/taskModal";
import TaskSearchPanel from "../components/taskSearchPanel";
import useDebounce from "../utils/hooks/useDebounce";
import useDragEnd from "../utils/hooks/useDragEnd";
import useReactQuery from "../utils/hooks/useReactQuery";
import useTitle from "../utils/hooks/useTitle";
import useUrl from "../utils/hooks/useUrl";

export const ColumnContainer = styled.div`
    display: flex;
    min-height: 60%;
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
    const [param, setParam] = useUrl(["taskName", "coordinatorId", "type"]);
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

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <PageContainer>
                <h1>
                    {!pLoading ? `${currentProject?.projectName} Board` : "..."}
                </h1>
                <TaskSearchPanel
                    tasks={tasks || []}
                    param={param}
                    setParam={setParam}
                    members={members}
                    loading={tLoading || mLoading}
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
                                            tasks={
                                                tasks?.filter(
                                                    (task) =>
                                                        task.columnId ===
                                                        column._id
                                                ) || []
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
                <TaskModal tasks={tasks || []} />
            </PageContainer>
        </DragDropContext>
    );
};

export default BoardPage;
