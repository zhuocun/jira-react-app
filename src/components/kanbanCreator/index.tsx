import { useState } from "react";
import { useParams } from "react-router-dom";
import useReactMutation from "../../utils/hooks/useReactMutation";
import { Input } from "antd";
import { KanbanContainer } from "../kanbanColumn";
import newKanbanCallback from "../../utils/optimisticUpdate/createKanban";

const KanbanCreator: React.FC = () => {
    const [kanbanName, setKanbanName] = useState("");
    const { projectId } = useParams<{ projectId: string }>();
    const { mutateAsync, isLoading } = useReactMutation(
        "kanbans",
        "POST",
        ["kanbans", { projectId }],
        newKanbanCallback
    );
    const submit = async (kanbanName: string) => {
        setKanbanName("");
        await mutateAsync({ kanbanName, projectId });
    };
    return (
        <KanbanContainer>
            <Input
                disabled={isLoading}
                style={{
                    height: "3.6rem",
                    marginTop: "0.4rem",
                    width: "28rem"
                }}
                size={"large"}
                placeholder={" + Create kanban"}
                onPressEnter={() => submit(kanbanName)}
                value={kanbanName}
                onChange={(e) => setKanbanName(e.target.value)}
            />
        </KanbanContainer>
    );
};

export default KanbanCreator;
