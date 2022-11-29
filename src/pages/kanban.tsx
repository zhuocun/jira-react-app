import useTitle from "../utils/hooks/useTitle";
import useReactQuery from "../utils/hooks/useReactQuery";
import { useParams } from "react-router-dom";
import KanbanColumn from "../components/kanbanColumn";
import styled from "@emotion/styled";
import useUrl from "../utils/hooks/useUrl";
import useDebounce from "../utils/hooks/useDebounce";
import TaskSearchPanel from "../components/taskSearchPanel";
import { useQueryClient } from "react-query";

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

    return (
        <div>
            <h1>{currentProject?.projectName} Kanban</h1>
            <TaskSearchPanel
                kanbans={kanbans}
                param={param}
                setParam={setParam}
                members={members}
                loading={pLoading || kLoading}
            />
            <ColumnContainer>
                {kanbans?.map((kanban, index) => (
                    <KanbanColumn
                        key={index}
                        kanban={kanban}
                        param={debouncedParam}
                    />
                ))}
            </ColumnContainer>
        </div>
    );
};

export default KanbanPage;

const ColumnContainer = styled.div`
    display: flex;
    overflow: hidden;
    margin-right: 2rem;
`;
