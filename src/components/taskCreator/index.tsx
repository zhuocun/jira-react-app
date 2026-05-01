import { PlusOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";
import { Button, Input } from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { fontWeight, radius, space } from "../../theme/tokens";
import useAiEnabled from "../../utils/hooks/useAiEnabled";
import useAuth from "../../utils/hooks/useAuth";
import useReactMutation from "../../utils/hooks/useReactMutation";
import newTaskCallback from "../../utils/optimisticUpdate/createTask";
import AiSparkleIcon from "../aiSparkleIcon";
import AiTaskDraftModal from "../aiTaskDraftModal";

const CreatorRow = styled.div`
    align-items: center;
    /*
     * Stretch to the column width so the two affordances ("Create task" and
     * "Draft with AI") do not crowd each other inside a narrow column. The
     * row still wraps cleanly when both labels exceed the available width.
     */
    display: flex;
    flex-wrap: wrap;
    gap: ${space.xxs}px;
    margin-top: ${space.xxs}px;
    padding: 0 ${space.xs}px;
    width: 100%;
`;

const CreateLink = styled.button`
    align-items: center;
    background: transparent;
    border: 1px dashed transparent;
    border-radius: ${radius.md}px;
    color: var(--ant-color-text-secondary, rgba(15, 23, 42, 0.6));
    cursor: pointer;
    display: inline-flex;
    font: inherit;
    font-weight: ${fontWeight.medium};
    gap: ${space.xxs}px;
    padding: ${space.xs}px ${space.sm}px;
    transition:
        background-color 120ms ease-out,
        color 120ms ease-out,
        border-color 120ms ease-out;

    &:hover:not(:disabled) {
        background: var(--ant-color-primary-bg, rgba(94, 106, 210, 0.06));
        color: var(--ant-color-primary, #5e6ad2);
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
            <CreatorRow>
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
            </CreatorRow>
        );
    }
    return (
        <Input
            aria-label="New task name"
            disabled={isLoading || disabled}
            onBlur={toggle}
            placeholder="What needs to be done?"
            autoFocus
            onPressEnter={submit}
            onKeyDown={(event) => {
                if (event.key === "Escape") {
                    setInputMode(false);
                }
            }}
            value={taskName}
            onChange={(e) => {
                setTaskName(e.target.value);
            }}
            style={{ marginTop: space.xxs }}
        />
    );
};

export default TaskCreator;
