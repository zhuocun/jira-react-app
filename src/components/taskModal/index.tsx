import { useForm } from "antd/lib/form/Form";
import useTaskModal from "../../utils/hooks/useTaskModal";
import useReactMutation from "../../utils/hooks/useReactMutation";
import React, { useEffect } from "react";
import { Button, Form, Input, Modal, Select } from "antd";
import { useQueryClient } from "react-query";
import styled from "@emotion/styled";
import _ from "lodash";

const TaskModal: React.FC<{ tasks: ITask[] }> = ({ tasks }) => {
    const [form] = useForm();
    const { editingTaskId, closeModal } = useTaskModal();
    const { mutateAsync: update, isLoading: uLoading } = useReactMutation(
        "tasks",
        "PUT"
    );
    const { mutateAsync: remove, isLoading: dLoading } = useReactMutation(
        "tasks",
        "DELETE"
    );
    const editingTask = tasks.filter((t) => t._id === editingTaskId)[0];
    const members = useQueryClient().getQueryData<IMember[]>("users/members");
    const types: string[] = [];
    tasks.map((t) => {
        if (!types.includes(t.type)) {
            types.push(t.type);
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
        Modal.confirm({
            centered: true,
            okText: "Confirm",
            cancelText: "Cancel",
            title: "Are you sure to delete this task?",
            content: "This action cannot be withdraw",
            onOk() {
                remove({ taskId: editingTaskId }).then(closeModal);
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
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                form={form}
                initialValues={editingTask}
            >
                <TaskFormItem
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
                </TaskFormItem>
                <TaskFormItem
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
                        {members?.map((member, index) => (
                            <Select.Option value={member._id} key={index}>
                                {member.username}
                            </Select.Option>
                        ))}
                    </Select>
                </TaskFormItem>
                <TaskFormItem
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
                            types.map((t, index) => (
                                <Select.Option value={t} key={index}>
                                    {t}
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
                </TaskFormItem>
            </Form>
            <div style={{ textAlign: "right", marginRight: "3.6rem" }}>
                <Button
                    danger={true}
                    onClick={onDelete}
                    size={"small"}
                    style={{ fontSize: "1.4rem" }}
                    loading={dLoading}
                >
                    Delete
                </Button>
            </div>
        </Modal>
    );
};

export default TaskModal;

const TaskFormItem = styled(Form.Item)`
    margin-right: 3.6rem;
`;
