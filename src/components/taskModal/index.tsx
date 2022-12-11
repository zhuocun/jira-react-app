import { useForm } from "antd/lib/form/Form";
import useTaskModal from "../../utils/hooks/useTaskModal";
import useReactMutation from "../../utils/hooks/useReactMutation";
import { useEffect } from "react";
import { Button, Form, Input, Modal, Select } from "antd";
import { useQueryClient } from "react-query";
import _ from "lodash";
import { useParams } from "react-router-dom";
import deleteTaskCallback from "../../utils/optimisticUpdate/deleteTask";

const TaskModal: React.FC<{ tasks: ITask[] | undefined }> = ({ tasks }) => {
    const [form] = useForm();
    const { projectId } = useParams<{ projectId: string }>();
    const { editingTaskId, closeModal } = useTaskModal();
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
    const members = useQueryClient().getQueryData<IMember[]>("users/members");
    const types: string[] = [];
    tasks?.map((task) => {
        if (!types.includes(task.type)) {
            types.push(task.type);
        }
    });

    const onClose = () => {
        form.resetFields();
        closeModal();
    };

    const onOk = async () => {
        _.isEqual({ ...editingTask, ...form.getFieldsValue() }, editingTask)
            ? closeModal()
            : await update({ ...editingTask, ...form.getFieldsValue() }).then(
                  closeModal
              );
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

    return (
        <Modal
            confirmLoading={uLoading}
            centered={true}
            forceRender={true}
            okText={"Submit"}
            onOk={onOk}
            cancelText={"Cancel"}
            onCancel={onClose}
            title={"Edit Task"}
            open={Boolean(editingTaskId)}
        >
            <Form
                labelCol={{ span: 6 }}
                form={form}
                initialValues={editingTask}
            >
                <Form.Item
                    label={"Task Name"}
                    name={"taskName"}
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
                    label={"Coordinator"}
                    name={"coordinatorId"}
                    rules={[
                        {
                            required: true,
                            message: "Please select a coordinator"
                        }
                    ]}
                >
                    <Select placeholder={"Coordinators"}>
                        {members?.map((member) => (
                            <Select.Option value={member._id} key={member._id}>
                                {member.username}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item
                    label={"Type"}
                    name={"type"}
                    rules={[
                        {
                            required: true,
                            message: "Please select the task type"
                        }
                    ]}
                >
                    <Select placeholder={"Types"}>
                        {types.length > 1 ? (
                            types.map((type) => (
                                <Select.Option value={type} key={type}>
                                    {type}
                                </Select.Option>
                            ))
                        ) : (
                            <>
                                <Select.Option value={"Task"} key={"task"}>
                                    Task
                                </Select.Option>
                                <Select.Option value={"Bug"} key={"bug"}>
                                    Bug
                                </Select.Option>
                            </>
                        )}
                    </Select>
                </Form.Item>
            </Form>
            <div style={{ textAlign: "right" }}>
                <Button
                    danger={true}
                    type={"dashed"}
                    onClick={onDelete}
                    size={"small"}
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
