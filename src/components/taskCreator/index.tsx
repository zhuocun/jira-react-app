import { useEffect, useState } from "react";
import useReactMutation from "../../utils/hooks/useReactMutation";
import { useParams } from "react-router-dom";
import { Input } from "antd";
import { useQueryClient } from "react-query";

const TaskCreator: React.FC<{ kanbanId: string }> = ({ kanbanId }) => {
    const [taskName, setTaskName] = useState("");
    const [inputMode, setInputMode] = useState(false);
    const { projectId } = useParams<{ projectId: string }>();
    const { mutateAsync } = useReactMutation("tasks", "POST");
    const user = useQueryClient().getQueryData<IUser>("users");
    const submit = async () => {
        await mutateAsync({
            taskName,
            projectId,
            kanbanId,
            coordinatorId: user?._id,
            type: "Task",
            epic: "New Feature",
            storyPoints: 1,
            note: "No note yet"
        });
        setInputMode(false);
        setTaskName("");
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
        return <div onClick={toggle}>+ Create Task</div>;
    } else {
        return (
            <Input
                onBlur={toggle}
                placeholder={"What to do?"}
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
