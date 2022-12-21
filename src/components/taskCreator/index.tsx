import { Input } from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import useAuth from "../../utils/hooks/useAuth";
import useReactMutation from "../../utils/hooks/useReactMutation";
import newTaskCallback from "../../utils/optimisticUpdate/createTask";
import { NoPaddingButton } from "../projectList";

const TaskCreator: React.FC<{ columnId?: string; disabled: boolean }> = ({
    columnId,
    disabled
}) => {
    const { user } = useAuth();
    const [taskName, setTaskName] = useState("");
    const [inputMode, setInputMode] = useState(false);
    const { projectId } = useParams<{ projectId: string }>();
    const { mutateAsync, isLoading } = useReactMutation(
        "tasks",
        "POST",
        ["tasks", { projectId }],
        newTaskCallback
    );
    const submit = async () => {
        setInputMode(false);
        await mutateAsync({
            taskName,
            projectId,
            columnId,
            coordinatorId: user?._id,
            type: "Task",
            epic: "New Feature",
            storyPoints: 1,
            note: "No note yet"
        });
    };
    const toggle = () => {
        setInputMode(!inputMode);
    };

    useEffect(() => {
        if (!inputMode) {
            setTaskName("");
        }
    }, [inputMode]);

    if (!inputMode) {
        return (
            <NoPaddingButton
                onClick={toggle}
                style={{ paddingLeft: "1rem" }}
                type="text"
            >
                + Create task
            </NoPaddingButton>
        );
    }
    return (
        <Input
            disabled={isLoading || disabled}
            onBlur={toggle}
            placeholder="What needs to be done?"
            autoFocus
            onPressEnter={submit}
            value={taskName}
            onChange={(e) => {
                setTaskName(e.target.value);
            }}
        />
    );
};

export default TaskCreator;
