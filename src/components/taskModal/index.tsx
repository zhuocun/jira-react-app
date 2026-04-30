import { Button, Form, Input, Modal, Select } from "antd";
import { useForm } from "antd/lib/form/Form";
import _ from "lodash";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { microcopy } from "../../constants/microcopy";
import useAiEnabled from "../../utils/hooks/useAiEnabled";
import useCachedQueryData from "../../utils/hooks/useCachedQueryData";
import useReactMutation from "../../utils/hooks/useReactMutation";
import useTaskModal from "../../utils/hooks/useTaskModal";
import deleteTaskCallback from "../../utils/optimisticUpdate/deleteTask";
import AiTaskAssistPanel from "../aiTaskAssistPanel";

const TYPE_OPTIONS = [
    { label: "Task", value: "Task" },
    { label: "Bug", value: "Bug" }
];

const STORY_POINT_OPTIONS = [1, 2, 3, 5, 8, 13].map((value) => ({
    label: `${value}`,
    value
}));

const TaskModal: React.FC<{
    tasks: ITask[] | undefined;
    boardAiOn?: boolean;
}> = ({ tasks, boardAiOn = true }) => {
    const [form] = useForm();
    const { projectId } = useParams<{ projectId: string }>();
    const { editingTaskId, startEditing, closeModal } = useTaskModal();
    const { enabled: aiEnabled } = useAiEnabled();
    const [formTick, setFormTick] = useState(0);
    const { mutateAsync: update, isLoading: uLoading } = useReactMutation(
        "tasks",
        "PUT"
    );
    const { mutate: remove, isLoading: dLoading } = useReactMutation(
        "tasks",
        "DELETE",
        ["tasks", { projectId }],
        deleteTaskCallback
    );
    const editingTask = tasks?.filter((task) => task._id === editingTaskId)[0];
    const members = useCachedQueryData<IMember[]>(["users/members"]) ?? [];

    const onClose = () => {
        form.resetFields();
        closeModal();
    };

    const onOk = async () => {
        if (
            _.isEqual({ ...editingTask, ...form.getFieldsValue() }, editingTask)
        ) {
            closeModal();
        } else {
            await update({ ...editingTask, ...form.getFieldsValue() }).then(
                closeModal
            );
        }
    };

    const onDelete = () => {
        onClose();
        Modal.confirm({
            centered: true,
            okText: microcopy.confirm.deleteTask.confirmLabel,
            cancelText: microcopy.actions.cancel,
            okButtonProps: { danger: true },
            title: microcopy.confirm.deleteTask.title,
            content: microcopy.confirm.deleteTask.description,
            onOk() {
                remove({ taskId: editingTaskId });
            }
        });
    };

    useEffect(() => {
        form.setFieldsValue(editingTask);
    }, [form, editingTask]);

    const liveValues = (() => {
        const fromForm = form.getFieldsValue();
        return {
            taskName: fromForm.taskName ?? editingTask?.taskName,
            note: fromForm.note ?? editingTask?.note,
            type: fromForm.type ?? editingTask?.type,
            epic: fromForm.epic ?? editingTask?.epic,
            coordinatorId: fromForm.coordinatorId ?? editingTask?.coordinatorId,
            storyPoints: fromForm.storyPoints ?? editingTask?.storyPoints
        };
    })();
    void formTick;

    const deleteDisabled = tasks
        ? tasks.length < 2 || dLoading || editingTaskId === "mock"
        : true;

    const titleText = editingTask?.taskName
        ? `Edit Task · ${editingTask.taskName}`
        : "Edit Task";

    return (
        <Modal
            confirmLoading={uLoading}
            centered
            forceRender
            okText={microcopy.actions.save}
            onOk={onOk}
            cancelText={microcopy.actions.cancel}
            onCancel={onClose}
            footer={(_originalFooter, { OkBtn, CancelBtn }) => (
                <div
                    style={{
                        alignItems: "center",
                        display: "flex",
                        justifyContent: "space-between"
                    }}
                >
                    <Button
                        aria-label={
                            editingTask?.taskName
                                ? `Delete ${editingTask.taskName}`
                                : microcopy.actions.delete
                        }
                        danger
                        disabled={deleteDisabled}
                        onClick={onDelete}
                        type="text"
                    >
                        {microcopy.actions.delete}
                    </Button>
                    <div style={{ display: "flex", gap: 8 }}>
                        <CancelBtn />
                        <OkBtn />
                    </div>
                </div>
            )}
            title={titleText}
            open={Boolean(editingTaskId)}
        >
            <Form
                labelCol={{ span: 6 }}
                form={form}
                initialValues={editingTask}
                onValuesChange={() => setFormTick((tick) => tick + 1)}
            >
                <Form.Item
                    label={microcopy.fields.taskName}
                    name="taskName"
                    rules={[
                        {
                            required: true,
                            message: "Please enter the task name"
                        }
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label={microcopy.fields.coordinator}
                    name="coordinatorId"
                    rules={[
                        {
                            required: true,
                            message: "Please select a coordinator"
                        }
                    ]}
                >
                    <Select
                        options={members.map((member) => ({
                            label: member.username,
                            value: member._id
                        }))}
                        placeholder="Coordinators"
                    />
                </Form.Item>
                <Form.Item
                    label={microcopy.fields.type}
                    name="type"
                    rules={[
                        {
                            required: true,
                            message: "Please select the task type"
                        }
                    ]}
                >
                    <Select options={TYPE_OPTIONS} placeholder="Types" />
                </Form.Item>
                <Form.Item label={microcopy.fields.epic} name="epic">
                    <Input placeholder="Epic" />
                </Form.Item>
                <Form.Item
                    label={microcopy.fields.storyPoints}
                    name="storyPoints"
                >
                    <Select
                        options={STORY_POINT_OPTIONS}
                        placeholder="Story points"
                    />
                </Form.Item>
                <Form.Item label={microcopy.fields.notes} name="note">
                    <Input.TextArea
                        placeholder="Notes / acceptance criteria"
                        rows={4}
                    />
                </Form.Item>
            </Form>
            {aiEnabled &&
                boardAiOn &&
                editingTaskId &&
                editingTaskId !== "mock" && (
                    <AiTaskAssistPanel
                        excludeTaskId={editingTaskId}
                        onApplyStoryPoints={(value) => {
                            form.setFieldsValue({ storyPoints: value });
                            setFormTick((tick) => tick + 1);
                        }}
                        onApplySuggestion={(field, suggestion) => {
                            const current = form.getFieldValue(field) ?? "";
                            if (field === "note") {
                                const appended = `${current}${
                                    current ? "\n\n" : ""
                                }## Acceptance criteria\n- ${suggestion}`;
                                form.setFieldsValue({ note: appended });
                            } else {
                                form.setFieldsValue({ [field]: suggestion });
                            }
                            setFormTick((tick) => tick + 1);
                        }}
                        onOpenSimilarTask={(taskId) => startEditing(taskId)}
                        values={liveValues}
                    />
                )}
        </Modal>
    );
};

export default TaskModal;
