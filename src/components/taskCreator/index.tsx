import { useEffect, useState } from "react";
import useReactMutation from "../../utils/hooks/useReactMutation";
import { useParams } from "react-router-dom";
import { Input } from "antd";
import newTaskCallback from "../../utils/optimisticUpdate/createTask";
import useAuth from "../../utils/hooks/useAuth";

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
            columnId: columnId,
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
            <div onClick={toggle} style={{ paddingLeft: "1rem" }}>
                + Create task
            </div>
        );
    } else {
        return (
            <Input
                disabled={isLoading || disabled}
                onBlur={toggle}
                placeholder={"What needs to be done?"}
                autoFocus={true}
                onPressEnter={submit}
                value={taskName}
                onChange={(e) => {
                    setTaskName(e.target.value);
                }}
            />
        );
    }
};

export default TaskCreator;
