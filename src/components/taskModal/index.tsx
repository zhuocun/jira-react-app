import { useForm } from "antd/lib/form/Form";
import useTaskModal from "../../utils/hooks/useTaskModal";
import useReactMutation from "../../utils/hooks/useReactMutation";
import { useEffect } from "react";
import { Form, Input, Modal, Select } from "antd";
import { useQueryClient } from "react-query";

const TaskModal: React.FC<{ tasks: ITask[] }> = ({ tasks }) => {
    const [form] = useForm();
    const { editingTaskId, closeModal } = useTaskModal();
    const { mutateAsync } = useReactMutation("tasks", "PUT");
    const editingTask = tasks.filter((t) => t._id === editingTaskId)[0];
    const members = useQueryClient().getQueryData<IMember[]>("users/members");
    const types: string[] = [];
    tasks.map((t) => {
        if (!types.includes(t.type)) {
            types.push(t.type);
        }
    });

    const onCancel = () => {
        form.resetFields();
        closeModal();
    };

    const onOk = async () => {
        await mutateAsync({ ...editingTask, ...form.getFieldsValue() });
        closeModal();
    };

    useEffect(() => {
        form.setFieldsValue(editingTask);
    }, [form, editingTask]);

    return (
        <Modal
            forceRender={true}
            okText={"Submit"}
            onOk={onOk}
            cancelText={"Cancel"}
            onCancel={onCancel}
            title={"Edit Task"}
            open={Boolean(editingTaskId)}
        >
            <Form
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                form={form}
                initialValues={editingTask}
            >
                <Form.Item
                    label={"Task name"}
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
                        {members?.map((member, index) => (
                            <Select.Option value={member._id} key={index}>
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
                        {types?.map((type, index) => (
                            <Select.Option value={type} key={index}>
                                {type}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default TaskModal;
