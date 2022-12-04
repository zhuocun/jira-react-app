import useTitle from "../utils/hooks/useTitle";
import useReactQuery from "../utils/hooks/useReactQuery";
import { useParams } from "react-router-dom";
import Column from "../components/column";
import styled from "@emotion/styled";
import useUrl from "../utils/hooks/useUrl";
import useDebounce from "../utils/hooks/useDebounce";
import TaskSearchPanel from "../components/taskSearchPanel";
import PageContainer from "../components/pageContainer";
import ColumnCreator from "../components/columnCreator";
import TaskModal from "../components/taskModal";
import { DragDropContext } from "react-beautiful-dnd";
import { Drag, Drop, DropChild } from "../components/dragAndDrop";
import useDragEnd from "../utils/hooks/useDragEnd";
import { Spin } from "antd";

const BoardPage = () => {
    useTitle("Board");
    const { projectId } = useParams<{ projectId: string }>();
    const [param, setParam] = useUrl(["taskName", "coordinatorId", "type"]);
    const debouncedParam = useDebounce(param, 1000);
    const { data: currentProject, isLoading: pLoading } =
        useReactQuery<IProject>("projects", {
            projectId
        });
    const { data: boards, isLoading: kLoading } = useReactQuery<IColumn[]>(
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
        Boolean(boards)
    );

    const { onDragEnd, isColumnDragDisabled, isTaskDragDisabled } =
        useDragEnd();

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <PageContainer>
                <h1>
                    {!pLoading ? currentProject?.projectName + " Board" : "..."}
                </h1>
                <TaskSearchPanel
                    tasks={tasks || []}
                    param={param}
                    setParam={setParam}
                    members={members}
                    loading={tLoading || mLoading}
                />
                {!(kLoading || tLoading) ? (
                    <ColumnContainer>
                        <Drop
                            droppableId={"column"}
                            type={"COLUMN"}
                            direction={"horizontal"}
                        >
                            <DropChild style={{ display: "flex" }}>
                                {boards?.map((column, index) => (
                                    <Drag
                                        key={column._id}
                                        draggableId={"column" + column._id}
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
                                                    (t) =>
                                                        t.columnId ===
                                                        column._id
                                                ) || []
                                            }
                                            key={index}
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

export const ColumnContainer = styled.div`
    display: flex;
    overflow-x: scroll;
    min-height: 60%;
`;

const BoardSpin = styled(Spin)`
    margin-left: calc(0.5 * (100vw - 16rem - 26.4rem));
    margin-top: calc(0.5 * (100vh - 6rem - 40.7rem));
    padding: 1rem;
`;
