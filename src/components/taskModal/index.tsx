import { Button, Form, Input, Modal, Select } from "antd";
import { useForm } from "antd/lib/form/Form";
import _ from "lodash";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import useAiEnabled from "../../utils/hooks/useAiEnabled";
import useReactMutation from "../../utils/hooks/useReactMutation";
import useTaskModal from "../../utils/hooks/useTaskModal";
import deleteTaskCallback from "../../utils/optimisticUpdate/deleteTask";
import AiTaskAssistPanel from "../aiTaskAssistPanel";

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
    const members = useQueryClient().getQueryData<IMember[]>(["users/members"]);
    const types: string[] = [];
    tasks?.map((task) => {
        if (!types.includes(task.type)) {
            types.push(task.type);
        }
        return null;
    });

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
            okText: "Confirm",
            cancelText: "Cancel",
            title: "Are you sure to delete this task?",
            content: "This action cannot be undone",
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

    return (
        <Modal
            confirmLoading={uLoading}
            centered
            forceRender
            okText="Submit"
            onOk={onOk}
            cancelText="Cancel"
            onCancel={onClose}
            title="Edit Task"
            open={Boolean(editingTaskId)}
        >
            <Form
                labelCol={{ span: 6 }}
                form={form}
                initialValues={editingTask}
                onValuesChange={() => setFormTick((tick) => tick + 1)}
            >
                <Form.Item
                    label="Task Name"
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
                    label="Coordinator"
                    name="coordinatorId"
                    rules={[
                        {
                            required: true,
                            message: "Please select a coordinator"
                        }
                    ]}
                >
                    <Select placeholder="Coordinators">
                        {members?.map((member) => (
                            <Select.Option value={member._id} key={member._id}>
                                {member.username}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item
                    label="Type"
                    name="type"
                    rules={[
                        {
                            required: true,
                            message: "Please select the task type"
                        }
                    ]}
                >
                    <Select placeholder="Types">
                        {types.length > 1 ? (
                            types.map((type) => (
                                <Select.Option value={type} key={type}>
                                    {type}
                                </Select.Option>
                            ))
                        ) : (
                            <>
                                <Select.Option value="Task" key="task">
                                    Task
                                </Select.Option>
                                <Select.Option value="Bug" key="bug">
                                    Bug
                                </Select.Option>
                            </>
                        )}
                    </Select>
                </Form.Item>
                <Form.Item label="Epic" name="epic">
                    <Input placeholder="Epic" />
                </Form.Item>
                <Form.Item label="Story Points" name="storyPoints">
                    <Select
                        options={[1, 2, 3, 5, 8, 13].map((value) => ({
                            label: `${value}`,
                            value
                        }))}
                        placeholder="Story points"
                    />
                </Form.Item>
                <Form.Item label="Notes" name="note">
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
            <div style={{ textAlign: "right" }}>
                <Button
                    danger
                    type="dashed"
                    onClick={onDelete}
                    size="small"
                    style={{ fontSize: "1.4rem" }}
                    disabled={
                        tasks
                            ? tasks.length < 2 ||
                              dLoading ||
                              editingTaskId === "mock"
                            : true
                    }
                >
                    Delete
                </Button>
            </div>
        </Modal>
    );
};

export default TaskModal;
