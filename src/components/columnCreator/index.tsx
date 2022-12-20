import { Input } from "antd";
import { useState } from "react";
import { useParams } from "react-router-dom";

import useReactMutation from "../../utils/hooks/useReactMutation";
import newColumnCallback from "../../utils/optimisticUpdate/createColumn";
import { ColumnContainer } from "../column";

const ColumnCreator: React.FC = () => {
    const [columnName, setColumnName] = useState("");
    const { projectId } = useParams<{ projectId: string }>();
    const { mutateAsync, isLoading } = useReactMutation(
        "boards",
        "POST",
        ["boards", { projectId }],
        newColumnCallback
    );
    const submit = async (columnName: string) => {
        setColumnName("");
        await mutateAsync({ columnName: columnName, projectId });
    };
    return (
        <ColumnContainer>
            <Input
                disabled={isLoading}
                style={{
                    height: "3.6rem",
                    marginTop: "0.4rem",
                    width: "28rem"
                }}
                size={"large"}
                placeholder={" + Create column"}
                onPressEnter={() => submit(columnName)}
                value={columnName}
                onChange={(e) => setColumnName(e.target.value)}
            />
        </ColumnContainer>
    );
};

export default ColumnCreator;
