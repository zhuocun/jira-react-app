import styled from "@emotion/styled";
import { Button, Drawer, Form, Input, Select, Spin } from "antd";
import { useForm } from "antd/lib/form/Form";
import { useEffect } from "react";

import useProjectModal from "../../utils/hooks/useProjectModal";
import useReactMutation from "../../utils/hooks/useReactMutation";
import useReactQuery from "../../utils/hooks/useReactQuery";
import ErrorBox from "../errorBox";

const Container = styled.div`
    align-items: center;
    display: flex;
    flex-direction: column;
    height: 80vh;
    justify-content: center;
`;

const ProjectModal: React.FC = () => {
    const { isModalOpened, closeModal, editingProject, isLoading } =
        useProjectModal();
    const isEditing = Boolean(editingProject);

    const createProjectMutation = useReactMutation("projects", "POST");
    const updateProjectMutation = useReactMutation("projects", "PUT");
    const activeMutation = isEditing
        ? updateProjectMutation
        : createProjectMutation;
    const {
        mutateAsync,
        error,
        isLoading: mutateLoading
    } = activeMutation;

    const [form] = useForm();
    const onClose = () => {
        closeModal();
        form.resetFields();
    };
    const onFinish = (input: {
        projectName: string;
        organization: string;
        managerId: string;
    }) => {
        mutateAsync({ ...editingProject, ...input }).then(onClose);
    };
    const modalTitle = isEditing ? "Edit Project" : "Create Project";

    useEffect(() => {
        form.setFieldsValue(editingProject);
    }, [editingProject, form]);

    // const members = useQueryClient().getQueryData<IMember[]>("users/members");
    const { data: members } = useReactQuery<IMember[]>("users/members");

    return (
        <Drawer forceRender open={isModalOpened} onClose={onClose} size="100%">
            <Container>
                {isLoading && <Spin />}
                <Form
                    form={form}
                    layout="vertical"
                    style={{
                        display: isLoading ? "none" : undefined,
                        width: "40rem"
                    }}
                    onFinish={onFinish}
                >
                    <h1>{modalTitle}</h1>
                    <ErrorBox error={error} />
                    {!isLoading && (
                        <>
                            <Form.Item
                                label="Project Name"
                                name="projectName"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter the project name"
                                    }
                                ]}
                            >
                                <Input placeholder="Project Name" />
                            </Form.Item>
                            <Form.Item
                                label="Organization"
                                name="organization"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter the organization"
                                    }
                                ]}
                            >
                                <Input placeholder="Organization" />
                            </Form.Item>
                            <Form.Item
                                label="Manager"
                                name="managerId"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please select a manager"
                                    }
                                ]}
                            >
                                <Select placeholder="Managers">
                                    {members?.map((member) => (
                                        <Select.Option
                                            value={member._id}
                                            key={member._id}
                                        >
                                            {member.username}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item style={{ textAlign: "center" }}>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={mutateLoading}
                                >
                                    Submit
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form>
            </Container>
        </Drawer>
    );
};

export default ProjectModal;
