import { PlusOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";
import { Button, Input } from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { space } from "../../theme/tokens";
import useAiEnabled from "../../utils/hooks/useAiEnabled";
import useAuth from "../../utils/hooks/useAuth";
import useReactMutation from "../../utils/hooks/useReactMutation";
import newTaskCallback from "../../utils/optimisticUpdate/createTask";
import AiSparkleIcon from "../aiSparkleIcon";
import AiTaskDraftModal from "../aiTaskDraftModal";

const CreateLink = styled.button`
    background: transparent;
    border: 1px dashed transparent;
    border-radius: 6px;
    color: var(--ant-color-link, #1677ff);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font: inherit;
    padding: ${space.xxs}px ${space.xs}px;

    &:hover:not(:disabled) {
        background: var(--ant-color-bg-text-hover, rgba(0, 0, 0, 0.04));
    }

    &:disabled {
        cursor: default;
        opacity: 0.5;
    }
`;

const TaskCreator: React.FC<{
    columnId?: string;
    disabled: boolean;
    boardAiOn?: boolean;
}> = ({ columnId, disabled, boardAiOn = true }) => {
    const { user } = useAuth();
    const [taskName, setTaskName] = useState("");
    const [inputMode, setInputMode] = useState(false);
    const [aiOpen, setAiOpen] = useState(false);
    const { enabled: aiEnabled } = useAiEnabled();
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
            <span
                style={{
                    alignItems: "center",
                    display: "inline-flex",
                    paddingLeft: space.xs
                }}
            >
                <CreateLink
                    aria-label="Create task"
                    disabled={disabled}
                    onClick={toggle}
                    type="button"
                >
                    <PlusOutlined aria-hidden /> Create task
                </CreateLink>
                {aiEnabled && boardAiOn && (
                    <>
                        <span style={{ margin: "0 0.4rem" }}>·</span>
                        <Button
                            aria-label="Draft a task with Board Copilot"
                            disabled={disabled}
                            icon={<AiSparkleIcon />}
                            onClick={() => setAiOpen(true)}
                            size="small"
                            type="link"
                        >
                            Draft with AI
                        </Button>
                        {aiOpen && (
                            <AiTaskDraftModal
                                columnId={columnId}
                                onClose={() => setAiOpen(false)}
                                open
                            />
                        )}
                    </>
                )}
            </span>
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
