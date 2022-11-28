import useTitle from "../utils/hooks/useTitle";
import useReactQuery from "../utils/hooks/useReactQuery";
import { useParams } from "react-router-dom";
import KanbanColumn from "../components/kanbanColumn";
import styled from "@emotion/styled";

const KanbanPage = () => {
    useTitle("Kanban List");
    const { projectId } = useParams<{ projectId: string }>();
    const { data: currentProject } = useReactQuery<IProject>("projects", { projectId });
    const { data: kanbans } = useReactQuery<IKanban[]>("kanbans", { projectId });
    return (
        <div>
            <h1>{currentProject?.projectName} Kanban</h1>
            <ColumnContainer>
                {kanbans?.map((kanban, index) => (
                    <KanbanColumn key={index} kanban={kanban} />
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
