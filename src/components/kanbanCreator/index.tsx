import { useState } from "react";
import { useParams } from "react-router-dom";
import useReactMutation from "../../utils/hooks/useReactMutation";
import { Input } from "antd";
import { KanbanContainer } from "../kanbanColumn";

const KanbanCreator: React.FC = () => {
    const [kanbanName, setKanbanName] = useState("");
    const { projectId } = useParams<{ projectId: string }>();
    const { mutateAsync } = useReactMutation("kanbans", "POST");
    const submit = async () => {
        await mutateAsync({ kanbanName, projectId });
        setKanbanName("");
    };
    return (
        <KanbanContainer>
            <Input
                style={{ height: "3.6rem", marginTop: "0.4rem" }}
                size={"large"}
                placeholder={" + Create kanban"}
                onPressEnter={submit}
                value={kanbanName}
                onChange={(e) => setKanbanName(e.target.value)}
            />
        </KanbanContainer>
    );
};

export default KanbanCreator;
