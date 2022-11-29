import useTitle from "../utils/hooks/useTitle";
import useReactQuery from "../utils/hooks/useReactQuery";
import { useParams } from "react-router-dom";
import KanbanColumn from "../components/kanbanColumn";
import styled from "@emotion/styled";
import useUrl from "../utils/hooks/useUrl";
import useDebounce from "../utils/hooks/useDebounce";
import TaskSearchPanel from "../components/taskSearchPanel";
import { useQueryClient } from "react-query";
import PageContainer from "../components/pageContainer";
import KanbanCreator from "../components/kanbanCreator";

const KanbanPage = () => {
    useTitle("Kanban List");
    const queryClient = useQueryClient();
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
    const members = queryClient.getQueryData<IMember[]>("users/members");

    const { data: tasks, isLoading: tLoading } = useReactQuery<ITask[]>(
        "tasks",
        {
            projectId
        }
    );

    return (
        <PageContainer>
            <h1>{currentProject?.projectName} Kanban</h1>
            <TaskSearchPanel
                tasks={tasks || []}
                param={param}
                setParam={setParam}
                members={members}
                loading={pLoading || kLoading || tLoading}
            />
            <ColumnContainer>
                {kanbans?.map((k, index) => (
                    <KanbanColumn
                        loading={tLoading}
                        tasks={tasks?.filter((t) => t.kanbanId === k._id) || []}
                        key={index}
                        kanban={k}
                        param={debouncedParam}
                    />
                ))}
                <KanbanCreator />
            </ColumnContainer>
        </PageContainer>
    );
};

export default KanbanPage;

export const ColumnContainer = styled.div`
    display: flex;
    overflow-x: scroll;
    height: 85%;
`;
