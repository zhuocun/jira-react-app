import useTitle from "../utils/hooks/useTitle";
import useReactQuery from "../utils/hooks/useReactQuery";
import { useParams } from "react-router-dom";
import KanbanColumn from "../components/kanbanColumn";
import styled from "@emotion/styled";
import useUrl from "../utils/hooks/useUrl";
import useDebounce from "../utils/hooks/useDebounce";
import TaskSearchPanel from "../components/taskSearchPanel";
import PageContainer from "../components/pageContainer";
import KanbanCreator from "../components/kanbanCreator";
import TaskModal from "../components/taskModal";
import { DragDropContext } from "react-beautiful-dnd";
import { Drag, Drop, DropChild } from "../components/dragAndDrop";

const BoardPage = () => {
    useTitle("Kanban List");
    const { projectId } = useParams<{ projectId: string }>();
    const [param, setParam] = useUrl(["taskName", "coordinatorId", "type"]);
    const debouncedParam = useDebounce(param, 1000);
    const { data: currentProject, isLoading: pLoading } =
        useReactQuery<IProject>("projects", {
            projectId
        });
    const { data: kanbans, isLoading: kLoading } = useReactQuery<IKanban[]>(
        "kanbans",
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
        }
    );

    return (
        <DragDropContext
            onDragEnd={() => {
                return null;
            }}
        >
            <PageContainer>
                <h1>{currentProject?.projectName} Board</h1>
                <TaskSearchPanel
                    tasks={tasks || []}
                    param={param}
                    setParam={setParam}
                    members={members}
                    loading={pLoading || kLoading || tLoading || mLoading}
                />
                <ColumnContainer>
                    <Drop
                        droppableId={"kanban"}
                        type={"COLUMN"}
                        direction={"horizontal"}
                    >
                        <DropChild style={{ display: "flex" }}>
                            {kanbans?.map((k, index) => (
                                <Drag
                                    key={k._id}
                                    draggableId={"kanban" + k._id}
                                    index={index}
                                >
                                    <KanbanColumn
                                        loading={tLoading}
                                        tasks={
                                            tasks?.filter(
                                                (t) => t.kanbanId === k._id
                                            ) || []
                                        }
                                        key={index}
                                        kanban={k}
                                        param={debouncedParam}
                                    />
                                </Drag>
                            ))}
                        </DropChild>
                    </Drop>
                    <KanbanCreator />
                </ColumnContainer>

                <TaskModal tasks={tasks || []} />
            </PageContainer>
        </DragDropContext>
    );
};

export default BoardPage;

export const ColumnContainer = styled.div`
    display: flex;
    overflow-x: scroll;
    height: 85%;
`;
