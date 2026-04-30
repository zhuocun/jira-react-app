import { Alert, Button, Form, Input, Modal, Select, Spin, Tag } from "antd";
import { useForm } from "antd/lib/form/Form";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import useAi from "../../utils/hooks/useAi";
import useAuth from "../../utils/hooks/useAuth";
import useCachedQueryData from "../../utils/hooks/useCachedQueryData";
import useReactMutation from "../../utils/hooks/useReactMutation";
import newTaskCallback from "../../utils/optimisticUpdate/createTask";
import AiSparkleIcon from "../aiSparkleIcon";

interface AiTaskDraftModalProps {
    open: boolean;
    onClose: () => void;
    columnId?: string;
}

const { TextArea } = Input;

const AiTaskDraftModal: React.FC<AiTaskDraftModalProps> = ({
    open,
    onClose,
    columnId
}) => {
    const { user } = useAuth();
    const { projectId } = useParams<{ projectId: string }>();
    const columns =
        useCachedQueryData<IColumn[]>(["boards", { projectId }]) ?? [];
    const tasks = useCachedQueryData<ITask[]>(["tasks", { projectId }]) ?? [];
    const members = useCachedQueryData<IMember[]>(["users/members"]) ?? [];

    const [prompt, setPrompt] = useState("");
    const [breakdownMode, setBreakdownMode] = useState(false);
    const [breakdownItems, setBreakdownItems] = useState<
        IDraftTaskSuggestion[]
    >([]);
    const [breakdownChecked, setBreakdownChecked] = useState<boolean[]>([]);
    const [form] = useForm();

    const draftAi = useAi<IDraftTaskSuggestion>({ route: "task-draft" });
    const breakdownAi = useAi<ITaskBreakdownSuggestion>({
        route: "task-breakdown"
    });

    const { mutateAsync: createTask, isLoading: creating } = useReactMutation(
        "tasks",
        "POST",
        ["tasks", { projectId }],
        newTaskCallback
    );

    const resetDraftAi = draftAi.reset;
    const resetBreakdownAi = breakdownAi.reset;
    const reset = useCallback(() => {
        setPrompt("");
        setBreakdownMode(false);
        setBreakdownItems([]);
        setBreakdownChecked([]);
        form.resetFields();
        resetDraftAi();
        resetBreakdownAi();
    }, [form, resetBreakdownAi, resetDraftAi]);

    useEffect(() => {
        if (!open) reset();
    }, [open, reset]);

    const aiContext = {
        project: { _id: projectId ?? "", projectName: "" },
        columns,
        tasks,
        members
    };

    const onDraft = async () => {
        if (!prompt.trim()) return;
        setBreakdownMode(false);
        const suggestion = await draftAi.run({
            draft: {
                prompt,
                columnId,
                coordinatorId: user?._id,
                context: aiContext
            }
        });
        form.setFieldsValue(suggestion);
    };

    const onBreakdown = async () => {
        if (!prompt.trim()) return;
        const result = await breakdownAi.run({
            draft: {
                prompt,
                columnId,
                coordinatorId: user?._id,
                context: aiContext,
                count: 3
            }
        });
        setBreakdownMode(true);
        setBreakdownItems(result.items);
        setBreakdownChecked(result.items.map(() => true));
    };

    const onSubmitSingle = async () => {
        const values = form.getFieldsValue();
        await createTask({
            taskName: values.taskName,
            type: values.type,
            epic: values.epic,
            note: values.note,
            storyPoints: values.storyPoints,
            columnId: values.columnId,
            coordinatorId: values.coordinatorId,
            projectId
        });
        onClose();
    };

    const onSubmitBreakdown = async () => {
        const selected = breakdownItems.filter(
            (_, index) => breakdownChecked[index]
        );
        for (const item of selected) {
            // sequential to keep optimistic cache consistent
            // eslint-disable-next-line no-await-in-loop
            await createTask({
                taskName: item.taskName,
                type: item.type,
                epic: item.epic,
                note: item.note,
                storyPoints: item.storyPoints,
                columnId: item.columnId,
                coordinatorId: item.coordinatorId,
                projectId
            });
        }
        onClose();
    };

    const suggestion = draftAi.data;
    const showForm = Boolean(suggestion) && !breakdownMode;

    return (
        <Modal
            destroyOnHidden
            footer={null}
            onCancel={onClose}
            open={open}
            title={
                <span>
                    <AiSparkleIcon style={{ marginRight: 8 }} />
                    Draft a task with Board Copilot
                </span>
            }
            width={640}
        >
            <Form.Item label="Describe the work in your own words">
                <TextArea
                    aria-label="Task prompt"
                    maxLength={1000}
                    onChange={(event) => setPrompt(event.target.value)}
                    placeholder="e.g. Investigate flaky login on Safari, blocks v2 release"
                    rows={3}
                    showCount
                    value={prompt}
                />
            </Form.Item>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <Button
                    aria-label="Draft task with Copilot"
                    disabled={!prompt.trim() || draftAi.isLoading}
                    onClick={onDraft}
                    type="primary"
                >
                    {draftAi.isLoading ? <Spin size="small" /> : "Draft task"}
                </Button>
                <Button
                    aria-label="Break the prompt into subtasks"
                    disabled={!prompt.trim() || breakdownAi.isLoading}
                    onClick={onBreakdown}
                >
                    {breakdownAi.isLoading ? (
                        <Spin size="small" />
                    ) : (
                        "Break down"
                    )}
                </Button>
            </div>

            {(draftAi.error || breakdownAi.error) && (
                <Alert
                    showIcon
                    style={{ marginBottom: 16 }}
                    title={
                        (draftAi.error ?? breakdownAi.error)?.message ??
                        "Couldn't draft this time."
                    }
                    type="warning"
                />
            )}

            {showForm && suggestion && (
                <Form
                    form={form}
                    initialValues={suggestion}
                    labelCol={{ span: 6 }}
                    onFinish={onSubmitSingle}
                >
                    <Alert
                        description={suggestion.rationale}
                        showIcon
                        style={{ marginBottom: 12 }}
                        title={
                            <span>
                                Suggested with{" "}
                                <Tag>
                                    {(suggestion.confidence * 100).toFixed(0)}%
                                </Tag>{" "}
                                confidence
                            </span>
                        }
                        type="info"
                    />
                    <Form.Item
                        label="Task Name"
                        name="taskName"
                        rules={[{ required: true }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item label="Type" name="type">
                        <Select
                            options={[
                                { label: "Task", value: "Task" },
                                { label: "Bug", value: "Bug" }
                            ]}
                        />
                    </Form.Item>
                    <Form.Item label="Epic" name="epic">
                        <Input />
                    </Form.Item>
                    <Form.Item label="Story Points" name="storyPoints">
                        <Select
                            options={[1, 2, 3, 5, 8, 13].map((value) => ({
                                label: `${value}`,
                                value
                            }))}
                        />
                    </Form.Item>
                    <Form.Item label="Column" name="columnId">
                        <Select
                            options={columns.map((column) => ({
                                label: column.columnName,
                                value: column._id
                            }))}
                        />
                    </Form.Item>
                    <Form.Item label="Coordinator" name="coordinatorId">
                        <Select
                            options={members.map((member) => ({
                                label: member.username,
                                value: member._id
                            }))}
                        />
                    </Form.Item>
                    <Form.Item label="Notes" name="note">
                        <TextArea rows={4} />
                    </Form.Item>
                    <div style={{ textAlign: "right" }}>
                        <Button onClick={onClose} style={{ marginRight: 8 }}>
                            Cancel
                        </Button>
                        <Button
                            htmlType="submit"
                            loading={creating}
                            type="primary"
                        >
                            Submit
                        </Button>
                    </div>
                </Form>
            )}

            {breakdownMode && breakdownItems.length > 0 && (
                <div aria-label="Subtask breakdown">
                    <Alert
                        showIcon
                        style={{ marginBottom: 12 }}
                        title="Pick the subtasks you want to create"
                        type="info"
                    />
                    {breakdownItems.map((item, index) => (
                        <div
                            key={`${item.taskName}-${index}`}
                            style={{
                                alignItems: "center",
                                display: "flex",
                                gap: 8,
                                marginBottom: 8
                            }}
                        >
                            <input
                                aria-label={`Include subtask ${item.taskName}`}
                                checked={breakdownChecked[index]}
                                onChange={(event) => {
                                    const next = [...breakdownChecked];
                                    next[index] = event.target.checked;
                                    setBreakdownChecked(next);
                                }}
                                type="checkbox"
                            />
                            <span style={{ flex: 1 }}>{item.taskName}</span>
                            <Tag>{item.storyPoints} pts</Tag>
                            <Tag color={item.type === "Bug" ? "red" : "blue"}>
                                {item.type}
                            </Tag>
                        </div>
                    ))}
                    <div style={{ textAlign: "right", marginTop: 12 }}>
                        <Button onClick={onClose} style={{ marginRight: 8 }}>
                            Cancel
                        </Button>
                        <Button
                            disabled={breakdownChecked.every((value) => !value)}
                            loading={creating}
                            onClick={onSubmitBreakdown}
                            type="primary"
                        >
                            Create selected
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default AiTaskDraftModal;
